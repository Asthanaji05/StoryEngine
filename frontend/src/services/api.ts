import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabase';

export const baseApi = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
        prepareHeaders: async (headers) => {
            // Get the current Supabase session
            const { data: { session } } = await supabase.auth.getSession();

            // If we have a session, add the access token to the headers
            if (session?.access_token) {
                headers.set('authorization', `Bearer ${session.access_token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['Story', 'Narration', 'Element', 'Moment', 'Connection', 'Mention'],
    endpoints: () => ({}),
});
