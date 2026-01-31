import { baseApi } from './api';

export interface NarrativeElement {
    id: string;
    story_id: string;
    element_type: 'character' | 'location' | 'organization';
    name: string;
    attributes: any;
    user_confirmed: boolean;
}

export const elementsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getElements: builder.query<NarrativeElement[], string>({
            query: (storyId) => `/stories/${storyId}/elements`,
            providesTags: (result) =>
                result
                    ? [...result.map(({ id }) => ({ type: 'Element' as const, id })), 'Element']
                    : ['Element'],
        }),
    }),
});

export const { useGetElementsQuery } = elementsApi;
