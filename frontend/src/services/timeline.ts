import { baseApi } from './api';

export interface StoryMoment {
    id: string;
    story_id: string;
    title: string;
    description?: string;
    timeline_position: number;
    emotional_signature: Record<string, number>;
    narrative_weight: number;
}

export const timelineApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getTimeline: builder.query<StoryMoment[], string>({
            query: (storyId) => `/stories/${storyId}/timeline`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Moment' as const, id })), 'Moment']
                    : ['Moment'],
        }),
    }),
});

export const { useGetTimelineQuery } = timelineApi;
