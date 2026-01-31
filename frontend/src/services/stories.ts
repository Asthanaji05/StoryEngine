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
    }),
});

export const {
    useGetStoriesQuery,
    useCreateStoryMutation,
    useGetStoryByIdQuery
} = storiesApi;
