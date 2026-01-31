import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../database/database.module';
import { AiService } from '../ai/ai.service';
import { StoriesService } from '../stories/stories.service';

@Injectable()
export class NarrationsService {
    constructor(
        @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
        private aiService: AiService,
        private storiesService: StoriesService,
    ) { }

    async addNarration(storyId: string, userId: string, content: string) {
        // Verify story belongs to user
        await this.storiesService.getStoryById(storyId, userId);

        // Get next sequence number
        const { data: lastNarration } = await this.supabase
            .from('raw_narrations')
            .select('sequence_number')
            .eq('story_id', storyId)
            .order('sequence_number', { ascending: false })
            .limit(1)
            .single();

        const sequenceNumber = lastNarration ? lastNarration.sequence_number + 1 : 0;

        let extracted: any = null;
        let listenerResponse: string = 'I hear you. Tell me more.';

        // Extract narrative elements and generate listener response using AI
        try {
            extracted = await this.aiService.extractNarrativeElements(content);
            listenerResponse = await this.aiService.generateListenerResponse(content);
        } catch (error) {
            console.error('AI processing failed:', error);
        }

        // Store raw narration and AI understanding
        const { data: narration, error } = await this.supabase
            .from('raw_narrations')
            .insert({
                story_id: storyId,
                content,
                sequence_number: sequenceNumber,
                listener_response: listenerResponse,
                extracted: extracted || {},
            })
            .select()
            .single();

        if (error) throw error;

        // Store extracted elements in their respective tables
        if (extracted) {
            await this.storeNarrativeElements(storyId, narration.id, extracted);
        }

        return {
            narration,
            extracted,
            listener_response: listenerResponse,
            status: extracted ? 'understood' : 'raw'
        };
    }

    private async storeNarrativeElements(storyId: string, narrationId: string, extracted: any) {
        const promises = [];

        // Store characters
        if (extracted.characters?.length > 0) {
            const characters = extracted.characters.map((char: any) => ({
                story_id: storyId,
                element_type: 'character',
                name: char.name,
                attributes: char.attributes,
                first_mentioned_in_narration: narrationId,
                last_mentioned_in_narration: narrationId,
                confidence_score: char.confidence,
            }));
            promises.push(this.supabase.from('narrative_elements').insert(characters));
        }

        // Store locations
        if (extracted.locations?.length > 0) {
            const locations = extracted.locations.map((loc: any) => ({
                story_id: storyId,
                element_type: 'location',
                name: loc.name,
                attributes: loc.attributes,
                first_mentioned_in_narration: narrationId,
                last_mentioned_in_narration: narrationId,
                confidence_score: loc.confidence,
            }));
            promises.push(this.supabase.from('narrative_elements').insert(locations));
        }

        // Store organizations
        if (extracted.organizations?.length > 0) {
            const orgs = extracted.organizations.map((org: any) => ({
                story_id: storyId,
                element_type: 'organization',
                name: org.name,
                attributes: org.attributes,
                first_mentioned_in_narration: narrationId,
                last_mentioned_in_narration: narrationId,
                confidence_score: org.confidence,
            }));
            promises.push(this.supabase.from('narrative_elements').insert(orgs));
        }

        // Store events
        if (extracted.events?.length > 0) {
            // Get total narration count to estimate position
            const { count } = await this.supabase
                .from('raw_narrations')
                .select('*', { count: 'exact', head: true })
                .eq('story_id', storyId);

            const basePosition = Math.min(0.9, (count || 1) / 100);

            const events = extracted.events.map((event: any, index: number) => ({
                story_id: storyId,
                title: event.title,
                description: event.description,
                timeline_position: Math.min(0.99, basePosition + (index * 0.01)),
                created_from_narration: narrationId,
                characters_involved: event.characters_involved || [],
                emotional_signature: { [event.emotional_tone || 'neutral']: event.importance || 5 },
                narrative_weight: event.importance || 5,
            }));
            promises.push(this.supabase.from('story_moments').insert(events));
        }

        await Promise.all(promises);
    }

    async getNarrations(storyId: string, userId: string) {
        // Verify story belongs to user
        await this.storiesService.getStoryById(storyId, userId);

        const { data, error } = await this.supabase
            .from('raw_narrations')
            .select('*')
            .eq('story_id', storyId)
            .order('sequence_number', { ascending: true });

        if (error) throw error;
        return data;
    }
}
