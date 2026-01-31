import { Injectable, Inject, NotFoundException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_CLIENT } from "../database/database.module";
import { AiService } from "../ai/ai.service";

@Injectable()
export class StoriesService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private readonly aiService: AiService,
  ) {}

  async createStory(userId: string, title?: string) {
    const { data, error } = await this.supabase
      .from("stories")
      .insert({
        user_id: userId,
        title: title || "Untitled Story",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserStories(userId: string) {
    const { data, error } = await this.supabase
      .from("stories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  async getStoryById(storyId: string, userId: string) {
    const { data, error } = await this.supabase
      .from("stories")
      .select("*")
      .eq("id", storyId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      throw new NotFoundException("Story not found");
    }

    return data;
  }

  async updateStory(storyId: string, userId: string, updates: any) {
    const { data, error } = await this.supabase
      .from("stories")
      .update(updates)
      .eq("id", storyId)
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException("Story not found");
    }

    return data;
  }

  async deleteStory(storyId: string, userId: string) {
    const { error } = await this.supabase
      .from("stories")
      .delete()
      .eq("id", storyId)
      .eq("user_id", userId);

    if (error) throw error;
    return { success: true };
  }

  async brainstormStoryOptions(storyId: string, userId: string) {
    await this.getStoryById(storyId, userId);

    // Fetch context for AI
    const { data: entities } = await this.supabase
      .from("narrative_elements")
      .select("name, element_type, attributes")
      .eq("story_id", storyId);

    const { data: moments } = await this.supabase
      .from("story_moments")
      .select("title, description")
      .eq("story_id", storyId)
      .order("timeline_position", { ascending: false })
      .limit(10);

    return this.aiService.brainstormStoryTheme({
      entities: entities || [],
      moments: moments || [],
    });
  }

  async getStoryElements(storyId: string, userId: string) {
    await this.getStoryById(storyId, userId);
    const { data, error } = await this.supabase
      .from("narrative_elements")
      .select("*")
      .eq("story_id", storyId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  }

  async getStoryTimeline(storyId: string, userId: string) {
    await this.getStoryById(storyId, userId);
    const { data, error } = await this.supabase
      .from("story_moments")
      .select("*")
      .eq("story_id", storyId)
      .order("timeline_position", { ascending: true });

    if (error) throw error;
    return data;
  }

  async getStoryConnections(storyId: string, userId: string) {
    await this.getStoryById(storyId, userId);
    const { data, error } = await this.supabase
      .from("narrative_connections")
      .select("*")
      .eq("story_id", storyId);

    if (error) throw error;
    return data;
  }

  async getStoryMentions(storyId: string, userId: string) {
    await this.getStoryById(storyId, userId);
    const { data, error } = await this.supabase
      .from("entity_mentions")
      .select("*")
      .eq("story_id", storyId);

    if (error) throw error;
    return data;
  }

  async updateStoryElement(
    storyId: string,
    elementId: string,
    userId: string,
    updates: any,
  ) {
    await this.getStoryById(storyId, userId);
    const { data, error } = await this.supabase
      .from("narrative_elements")
      .update(updates)
      .eq("id", elementId)
      .eq("story_id", storyId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteStoryElement(storyId: string, elementId: string, userId: string) {
    await this.getStoryById(storyId, userId);
    const { error } = await this.supabase
      .from("narrative_elements")
      .delete()
      .eq("id", elementId)
      .eq("story_id", storyId);
    if (error) throw error;
    return { success: true };
  }

  async updateStoryMoment(
    storyId: string,
    momentId: string,
    userId: string,
    updates: any,
  ) {
    await this.getStoryById(storyId, userId);
    const { data, error } = await this.supabase
      .from("story_moments")
      .update(updates)
      .eq("id", momentId)
      .eq("story_id", storyId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async deleteStoryMoment(storyId: string, momentId: string, userId: string) {
    await this.getStoryById(storyId, userId);
    const { error } = await this.supabase
      .from("story_moments")
      .delete()
      .eq("id", momentId)
      .eq("story_id", storyId);
    if (error) throw error;
    return { success: true };
  }

  async interviewStoryCharacter(
    storyId: string,
    characterId: string,
    userId: string,
    prompt: string,
  ) {
    await this.getStoryById(storyId, userId);

    const { data: character } = await this.supabase
      .from("narrative_elements")
      .select("*")
      .eq("id", characterId)
      .single();

    if (!character) throw new NotFoundException("Character not found");

    // Fetch recent moments for context
    const { data: moments } = await this.supabase
      .from("story_moments")
      .select("title, description")
      .eq("story_id", storyId)
      .order("timeline_position", { ascending: false })
      .limit(5);

    return this.aiService.simulateCharacterDialogue(
      character.name,
      character.attributes,
      prompt,
      { moments: moments || [] },
    );
  }

  async mergeEntities(storyId: string, userId: string, sourceId: string, targetId: string) {
    if (sourceId === targetId) return; // Cannot merge into self

    await this.getStoryById(storyId, userId);

    // 1. Move Mentions
    await this.supabase
      .from('entity_mentions')
      .update({ element_id: targetId })
      .eq('element_id', sourceId);

    // 2. Update Moments (characters_involved Array)
    const { data: moments } = await this.supabase
      .from('story_moments')
      .select('id, characters_involved')
      .contains('characters_involved', [sourceId]);

    if (moments) {
      for (const m of moments) {
        const newIds = new Set(m.characters_involved);
        newIds.delete(sourceId);
        newIds.add(targetId);
        await this.supabase
          .from('story_moments')
          .update({ characters_involved: Array.from(newIds) })
          .eq('id', m.id);
      }
    }

    // 3. Update Connections (From)
    const { data: fromConns } = await this.supabase
      .from('narrative_connections')
      .select('*')
      .eq('from_id', sourceId);

    if (fromConns) {
      for (const conn of fromConns) {
        const { data: existing } = await this.supabase
          .from('narrative_connections')
          .select('id')
          .eq('from_id', targetId)
          .eq('to_id', conn.to_id)
          .single();

        if (existing) {
          await this.supabase.from('narrative_connections').delete().eq('id', conn.id);
        } else {
          await this.supabase.from('narrative_connections').update({ from_id: targetId }).eq('id', conn.id);
        }
      }
    }

    // 4. Update Connections (To)
    const { data: toConns } = await this.supabase
      .from('narrative_connections')
      .select('*')
      .eq('to_id', sourceId);

    if (toConns) {
      for (const conn of toConns) {
        const { data: existing } = await this.supabase
          .from('narrative_connections')
          .select('id')
          .eq('from_id', conn.from_id)
          .eq('to_id', targetId)
          .single();

        if (existing) {
          await this.supabase.from('narrative_connections').delete().eq('id', conn.id);
        } else {
          await this.supabase.from('narrative_connections').update({ to_id: targetId }).eq('id', conn.id);
        }
      }
    }

    // 5. Update Suggestions & Delete Source
    await this.supabase
      .from('ai_suggestions')
      .update({ confirmed_item_id: targetId })
      .eq('confirmed_item_id', sourceId);

    await this.supabase
      .from('narrative_elements')
      .delete()
      .eq('id', sourceId);

    return { success: true };
  }
}
