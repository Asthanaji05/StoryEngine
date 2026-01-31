import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../database/database.module';
import { StoriesService } from '../stories/stories.service';

@Injectable()
export class SuggestionsService {
    constructor(
        @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
        private storiesService: StoriesService,
    ) { }

    async getPendingSuggestions(storyId: string, userId: string) {
        await this.storiesService.getStoryById(storyId, userId);

        const { data, error } = await this.supabase
            .from('ai_suggestions')
            .select(`
                *,
                narration:raw_narrations(content, sequence_number)
            `)
            .eq('story_id', storyId)
            .eq('status', 'pending')
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    }

    async updateSuggestion(suggestionId: string, userId: string, data: any) {
        // First verify ownership through story_id
        const { data: suggestion } = await this.supabase
            .from('ai_suggestions')
            .select('story_id')
            .eq('id', suggestionId)
            .single();

        if (!suggestion) throw new Error('Suggestion not found');
        await this.storiesService.getStoryById(suggestion.story_id, userId);

        const { data: updated, error } = await this.supabase
            .from('ai_suggestions')
            .update({ suggested_data: data })
            .eq('id', suggestionId)
            .select()
            .single();

        if (error) throw error;
        return updated;
    }

    async rejectSuggestion(suggestionId: string, userId: string) {
        const { data: suggestion } = await this.supabase
            .from('ai_suggestions')
            .select('story_id')
            .eq('id', suggestionId)
            .single();

        if (!suggestion) throw new Error('Suggestion not found');
        await this.storiesService.getStoryById(suggestion.story_id, userId);

        const { error } = await this.supabase
            .from('ai_suggestions')
            .update({ status: 'rejected' })
            .eq('id', suggestionId);

        if (error) throw error;
        return { success: true };
    }

    async confirmSuggestion(suggestionId: string, userId: string) {
        const { data: suggestion, error: fetchError } = await this.supabase
            .from('ai_suggestions')
            .select('*')
            .eq('id', suggestionId)
            .single();

        if (fetchError || !suggestion) throw new Error('Suggestion not found');
        await this.storiesService.getStoryById(suggestion.story_id, userId);

        const { suggested_data: data, suggestion_type: type, story_id, narration_id } = suggestion;

        let resultId = null;

        if (type === 'element') {
            // 1. Resolve or Create Element
            const { data: existing } = await this.supabase
                .from('narrative_elements')
                .select('id')
                .eq('story_id', story_id)
                .eq('name', data.name)
                .single();

            let elementId = existing?.id;

            if (!elementId) {
                const { data: created } = await this.supabase
                    .from('narrative_elements')
                    .insert({
                        story_id,
                        element_type: data.element_type,
                        name: data.name,
                        attributes: data.attributes,
                        first_mentioned_in_narration: narration_id,
                        last_mentioned_in_narration: narration_id,
                        confidence_score: data.confidence || 1.0,
                    })
                    .select()
                    .single();
                elementId = created.id;
            } else {
                await this.supabase
                    .from('narrative_elements')
                    .update({ last_mentioned_in_narration: narration_id })
                    .eq('id', elementId);
            }

            // 2. Log Mention (The Journey)
            await this.supabase.from('entity_mentions').insert({
                story_id,
                element_id: elementId,
                narration_id,
                mention_context: data.mention_phrase,
                emotional_state: { current_emotion: data.attributes?.current_emotion },
                importance_in_narration: (data.confidence || 1.0) * 10,
            });
            resultId = elementId;

        } else if (type === 'moment') {
            // Resolve characters involved by name
            const involvedNames = data.involved || [];
            const { data: elements } = await this.supabase
                .from('narrative_elements')
                .select('id, name')
                .eq('story_id', story_id)
                .in('name', involvedNames);

            const characterIds = elements?.map(e => e.id) || [];

            // Calculate position based on sequence if not provided
            const { data: narration } = await this.supabase
                .from('raw_narrations')
                .select('sequence_number')
                .eq('id', narration_id)
                .single();

            const position = (narration?.sequence_number || 0) / 100;

            const { data: created } = await this.supabase
                .from('story_moments')
                .insert({
                    story_id,
                    title: data.title,
                    description: data.description,
                    timeline_position: Math.min(0.99, position),
                    created_from_narration: narration_id,
                    characters_involved: characterIds,
                    narrative_weight: data.importance || 5,
                })
                .select()
                .single();
            resultId = created.id;

        } else if (type === 'connection') {
            const { data: elements } = await this.supabase
                .from('narrative_elements')
                .select('id, name')
                .eq('story_id', story_id)
                .in('name', [data.from, data.to]);

            const fromEl = elements?.find(e => e.name === data.from);
            const toEl = elements?.find(e => e.name === data.to);

            if (fromEl && toEl) {
                const { data: created } = await this.supabase
                    .from('narrative_connections')
                    .insert({
                        story_id,
                        from_id: fromEl.id,
                        to_id: toEl.id,
                        connection_type: data.type,
                        description: data.description,
                        created_from_narration: narration_id,
                    })
                    .select()
                    .single();
                resultId = created.id;
            }
        }

        // Mark suggestion as accepted
        await this.supabase
            .from('ai_suggestions')
            .update({ status: 'accepted' })
            .eq('id', suggestionId);

        return { success: true, id: resultId };
    }
}
