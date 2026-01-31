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
        createStory: builder.mutation<Story, { title?: string }>({
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
    }),
});

export const {
    useGetStoriesQuery,
    useCreateStoryMutation,
    useGetStoryByIdQuery,
    useGetStoryElementsQuery,
    useGetStoryTimelineQuery,
    useGetStoryConnectionsQuery,
} = storiesApi;
