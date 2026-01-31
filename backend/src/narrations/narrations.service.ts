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

        // Fetch existing entity names for resolution context
        const { data: existingElements } = await this.supabase
            .from('narrative_elements')
            .select('name')
            .eq('story_id', storyId);

        const existingNames = existingElements?.map(e => e.name) || [];

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

        // Extract narrative elements and generate listener response
        try {
            extracted = await this.aiService.extractNarrativeElements(content, {
                entities: existingNames
            });
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

        // Store AI's perceptions as pending suggestions (Don't auto-update the story world)
        if (extracted) {
            await this.createSuggestions(storyId, narration.id, extracted);
        }

        return {
            narration,
            extracted,
            listener_response: listenerResponse,
            status: extracted ? 'suggestions_pending' : 'raw'
        };
    }

    private async createSuggestions(storyId: string, narrationId: string, extracted: any) {
        const suggestions = [];

        // 1. Element Suggestions (Characters, Locations, Organizations)
        const processElements = (entities: any[], type: string) => {
            entities?.forEach(ent => {
                suggestions.push({
                    story_id: storyId,
                    narration_id: narrationId,
                    suggestion_type: 'element',
                    suggested_data: {
                        name: ent.name,
                        element_type: type,
                        attributes: ent.attributes,
                        confidence: ent.confidence,
                        mention_phrase: ent.mention_phrase
                    }
                });
            });
        };

        processElements(extracted.characters, 'character');
        processElements(extracted.locations, 'location');
        processElements(extracted.organizations, 'organization');

        // 2. Moment Suggestions (Events)
        extracted.events?.forEach((event: any) => {
            suggestions.push({
                story_id: storyId,
                narration_id: narrationId,
                suggestion_type: 'moment',
                suggested_data: {
                    title: event.title,
                    description: event.description,
                    importance: event.importance,
                    involved: event.characters_involved
                }
            });
        });

        // 3. Connection Suggestions
        extracted.connections?.forEach((conn: any) => {
            suggestions.push({
                story_id: storyId,
                narration_id: narrationId,
                suggestion_type: 'connection',
                suggested_data: {
                    from: conn.from,
                    to: conn.to,
                    type: conn.type,
                    description: conn.description
                }
            });
        });

        if (suggestions.length > 0) {
            const { error } = await this.supabase
                .from('ai_suggestions')
                .insert(suggestions);

            if (error) console.error('Failed to store suggestions:', error);
        }
    }

    async getNarrations(storyId: string, userId: string) {
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
