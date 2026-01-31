import { baseApi } from './api';

export interface Narration {
    id: string;
    story_id: string;
    content: string;
    sequence_number: number;
    created_at: string;
}

export interface NarrationResponse {
    narration: Narration;
    extracted: any;
    listenerResponse: string;
}

export const narrationsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getNarrations: builder.query<Narration[], string>({
            query: (storyId) => `/stories/${storyId}/narrations`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Narration' as const, id })), 'Narration']
                    : ['Narration'],
        }),
        addNarration: builder.mutation<NarrationResponse, { storyId: string; content: string }>({
            query: ({ storyId, content }) => ({
                url: `/stories/${storyId}/narrations`,
                method: 'POST',
                body: { content },
            }),
            invalidatesTags: ['Narration', 'Element', 'Moment', 'Suggestion'],
        }),
    }),
});

export const { useGetNarrationsQuery, useAddNarrationMutation } = narrationsApi;
