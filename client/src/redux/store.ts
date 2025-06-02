import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './features/api/apiSlice';
import authSlice from './features/auth/authSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authSlice,
  },
  devTools: import.meta.env.NODE_ENV !== 'production', // Enable devTools in development
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// Initialize app and load user
const initializeApp = async () => {
  try {
    const result = await store.dispatch(
      apiSlice.endpoints.loadUser.initiate({}, { forceRefetch: true })
    );
    if (result.error) {
      console.error('loadUser failed:', result.error);
    } else {
      console.log('loadUser succeeded, user:', result.data.user);
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

initializeApp();

// Export RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;