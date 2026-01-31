import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../database/database.module';

@Injectable()
export class StoriesService {
    constructor(
        @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    ) { }

    async createStory(userId: string, title?: string) {
        const { data, error } = await this.supabase
            .from('stories')
            .insert({
                user_id: userId,
                title: title || 'Untitled Story',
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async getUserStories(userId: string) {
        const { data, error } = await this.supabase
            .from('stories')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    async getStoryById(storyId: string, userId: string) {
        const { data, error } = await this.supabase
            .from('stories')
            .select('*')
            .eq('id', storyId)
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Story not found');
        }

        return data;
    }

    async updateStory(storyId: string, userId: string, updates: any) {
        const { data, error } = await this.supabase
            .from('stories')
            .update(updates)
            .eq('id', storyId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error || !data) {
            throw new NotFoundException('Story not found');
        }

        return data;
    }

    async deleteStory(storyId: string, userId: string) {
        const { error } = await this.supabase
            .from('stories')
            .delete()
            .eq('id', storyId)
            .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
    }

    async getStoryElements(storyId: string, userId: string) {
        // First verify story ownership
        await this.getStoryById(storyId, userId);

        const { data, error } = await this.supabase
            .from('narrative_elements')
            .select('*')
            .eq('story_id', storyId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    }

    async getStoryTimeline(storyId: string, userId: string) {
        // First verify story ownership
        await this.getStoryById(storyId, userId);

        const { data, error } = await this.supabase
            .from('story_moments')
            .select('*')
            .eq('story_id', storyId)
            .order('timeline_position', { ascending: true });

        if (error) throw error;
        return data;
    }

    async getStoryConnections(storyId: string, userId: string) {
        // First verify story ownership
        await this.getStoryById(storyId, userId);

        const { data, error } = await this.supabase
            .from('narrative_connections')
            .select('*')
            .eq('story_id', storyId);

        if (error) throw error;
        return data;
    }
}
