import { baseApi } from './api';

export interface Suggestion {
    id: string;
    story_id: string;
    narration_id: string;
    suggestion_type: 'element' | 'moment' | 'connection';
    suggested_data: any;
    status: 'pending' | 'accepted' | 'rejected';
    created_at: string;
    narration?: {
        content: string;
        sequence_number: number;
    };
}

export const suggestionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPendingSuggestions: builder.query<Suggestion[], string>({
            query: (storyId) => `/suggestions/story/${storyId}`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Suggestion' as const, id })), 'Suggestion']
                    : ['Suggestion'],
        }),
        updateSuggestion: builder.mutation<Suggestion, { id: string; data: any }>({
            query: ({ id, data }) => ({
                url: `/suggestions/${id}`,
                method: 'PATCH',
                body: data,
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Suggestion', id }],
        }),
        rejectSuggestion: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `/suggestions/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Suggestion', id }],
        }),
        confirmSuggestion: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `/suggestions/${id}/confirm`,
                method: 'POST',
            }),
            invalidatesTags: ['Suggestion', 'Element', 'Moment', 'Connection'],
        }),
    }),
});

export const {
    useGetPendingSuggestionsQuery,
    useUpdateSuggestionMutation,
    useRejectSuggestionMutation,
    useConfirmSuggestionMutation,
} = suggestionsApi;
