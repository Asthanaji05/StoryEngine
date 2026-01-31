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

        // Store extracted elements and mentions
        if (extracted) {
            await this.storeNarrativeData(storyId, narration.id, extracted);
        }

        return {
            narration,
            extracted,
            listener_response: listenerResponse,
            status: extracted ? 'understood' : 'raw'
        };
    }

    private async storeNarrativeData(storyId: string, narrationId: string, extracted: any) {
        const insertPromises = [];
        const elementMap = new Map<string, string>();

        // Fetch existing elements to handle updates/re-mentions
        const { data: existingElements } = await this.supabase
            .from('narrative_elements')
            .select('id, name')
            .eq('story_id', storyId);

        existingElements?.forEach(el => elementMap.set(el.name.toLowerCase(), el.id));

        // 1. Process Elements (Characters, Locations, Orgs)
        const elementsToInsert = [];
        const mentionsToInsert = [];

        const processEntities = (entities: any[], type: string) => {
            entities?.forEach(ent => {
                let elementId = elementMap.get(ent.name.toLowerCase());

                if (!elementId) {
                    // New Entity
                    elementsToInsert.push({
                        story_id: storyId,
                        element_type: type,
                        name: ent.name,
                        attributes: ent.attributes,
                        first_mentioned_in_narration: narrationId,
                        last_mentioned_in_narration: narrationId,
                        confidence_score: ent.confidence,
                    });
                } else {
                    // Handle Existing Entity
                    insertPromises.push(
                        this.supabase
                            .from('narrative_elements')
                            .update({ last_mentioned_in_narration: narrationId })
                            .eq('id', elementId)
                    );
                }
            });
        };

        processEntities(extracted.characters, 'character');
        processEntities(extracted.locations, 'location');
        processEntities(extracted.organizations, 'organization');

        // Execute element insertions first to get IDs for mentions
        if (elementsToInsert.length > 0) {
            const { data: newlyCreated } = await this.supabase
                .from('narrative_elements')
                .insert(elementsToInsert)
                .select();

            newlyCreated?.forEach(el => elementMap.set(el.name.toLowerCase(), el.id));
        }

        // 2. Prepare Mentions
        const collectMentions = (entities: any[]) => {
            entities?.forEach(ent => {
                const elementId = elementMap.get(ent.name.toLowerCase());
                if (elementId) {
                    mentionsToInsert.push({
                        story_id: storyId,
                        element_id: elementId,
                        narration_id: narrationId,
                        mention_context: ent.mention_phrase,
                        emotional_state: { current_emotion: ent.attributes?.current_emotion },
                        importance_in_narration: ent.confidence * 10,
                    });
                }
            });
        };

        collectMentions(extracted.characters);
        collectMentions(extracted.locations);
        collectMentions(extracted.organizations);

        if (mentionsToInsert.length > 0) {
            insertPromises.push(this.supabase.from('entity_mentions').insert(mentionsToInsert));
        }

        // 3. Store connections using Resolved IDs
        if (extracted.connections?.length > 0) {
            const connectionsToInsert = extracted.connections
                .map((conn: any) => {
                    const fromId = elementMap.get(conn.from.toLowerCase());
                    const toId = elementMap.get(conn.to.toLowerCase());

                    if (fromId && toId) {
                        return {
                            story_id: storyId,
                            from_id: fromId,
                            to_id: toId,
                            connection_type: conn.type,
                            description: conn.description,
                            weight: conn.weight || 5,
                            emotional_charge: conn.emotional_charge || 0,
                            created_from_narration: narrationId,
                        };
                    }
                    return null;
                })
                .filter(c => c !== null);

            if (connectionsToInsert.length > 0) {
                insertPromises.push(this.supabase.from('narrative_connections').insert(connectionsToInsert));
            }
        }

        // 4. Store events (Story Moments)
        if (extracted.events?.length > 0) {
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
                characters_involved: event.characters_involved?.map(name => elementMap.get(name.toLowerCase())).filter(id => !!id) || [],
                emotional_signature: { [event.emotional_tone || 'neutral']: event.importance || 5 },
                narrative_weight: event.importance || 5,
            }));
            insertPromises.push(this.supabase.from('story_moments').insert(events));
        }

        await Promise.all(insertPromises);
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
