import { baseApi } from './api';

export interface Story {
    id: string;
    title: string;
    description?: string;
    created_at: string;
}

export const storiesApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getStories: builder.query<Story[], void>({
            query: () => '/stories',
            providesTags: ['Story'],
        }),
        createStory: builder.mutation<Story, Partial<Story>>({
            query: (body) => ({
                url: '/stories',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Story'],
        }),
        getStoryById: builder.query<Story, string>({
            query: (id) => `/stories/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Story', id }],
        }),
        updateStory: builder.mutation<Story, { id: string; updates: Partial<Story> }>({
            query: ({ id, updates }) => ({
                url: `/stories/${id}`,
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Story', id }, 'Story'],
        }),
        brainstormOptions: builder.mutation<{ title: string; description: string }[], string>({
            query: (id) => `/stories/${id}/brainstorm`,
        }),
        getStoryElements: builder.query<any[], string>({
            query: (id) => `/stories/${id}/elements`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Element' as const, id })), 'Element']
                    : ['Element'],
        }),
        getStoryTimeline: builder.query<any[], string>({
            query: (id) => `/stories/${id}/timeline`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Moment' as const, id })), 'Moment']
                    : ['Moment'],
        }),
        getStoryConnections: builder.query<any[], string>({
            query: (id) => `/stories/${id}/connections`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Connection' as const, id })), 'Connection']
                    : ['Connection'],
        }),
        getStoryMentions: builder.query<any[], string>({
            query: (id) => `/stories/${id}/mentions`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Mention' as const, id })), 'Mention']
                    : ['Mention'],
        }),
        updateElement: builder.mutation<any, { storyId: string; elementId: string; updates: any }>({
            query: ({ storyId, elementId, updates }) => ({
                url: `/stories/${storyId}/elements/${elementId}`,
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: (_result, _error, { elementId }) => [{ type: 'Element', id: elementId }, 'Element'],
        }),
        deleteElement: builder.mutation<{ success: boolean }, { storyId: string; elementId: string }>({
            query: ({ storyId, elementId }) => ({
                url: `/stories/${storyId}/elements/${elementId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Element'],
        }),
        updateMoment: builder.mutation<any, { storyId: string; momentId: string; updates: any }>({
            query: ({ storyId, momentId, updates }) => ({
                url: `/stories/${storyId}/timeline/${momentId}`,
                method: 'PATCH',
                body: updates,
            }),
            invalidatesTags: (_result, _error, { momentId }) => [{ type: 'Moment', id: momentId }, 'Moment'],
        }),
        deleteMoment: builder.mutation<{ success: boolean }, { storyId: string; momentId: string }>({
            query: ({ storyId, momentId }) => ({
                url: `/stories/${storyId}/timeline/${momentId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Moment'],
        }),
        interviewCharacter: builder.mutation<string, { storyId: string; characterId: string; prompt: string }>({
            query: ({ storyId, characterId, prompt }) => ({
                url: `/stories/${storyId}/interview/${characterId}`,
                method: 'POST',
                body: { prompt },
            }),
        }),
    }),
});

export const {
    useGetStoriesQuery,
    useCreateStoryMutation,
    useGetStoryByIdQuery,
    useUpdateStoryMutation,
    useBrainstormOptionsMutation,
    useGetStoryElementsQuery,
    useGetStoryTimelineQuery,
    useGetStoryConnectionsQuery,
    useGetStoryMentionsQuery,
    useUpdateElementMutation,
    useDeleteElementMutation,
    useUpdateMomentMutation,
    useDeleteMomentMutation,
    useInterviewCharacterMutation,
} = storiesApi;
