import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from '../services/api';

export const store = configureStore({
    reducer: {
        [baseApi.reducerPath]: baseApi.reducer,
        // Future slices for local state (e.g., UI state) will go here
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
