import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { userLoggedIn } from '../auth/authSlice';
import { RootState } from '../../../@types';

export const apiSlice = createApi({
  tagTypes: ['User', 'Task', 'Report', 'Notifications'],
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_PUBLIC_SERVER_URI || 'http://localhost:8000/api/v1/',
    credentials: 'include', // Send cookies
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
        console.log('Setting Authorization header with token:', token); // Debug log
      } else {
        console.log('No token in Redux state, relying on cookie'); // Debug log
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    loadUser: builder.query({
      query: () => {
        console.log('Triggering loadUser query'); // Debug log
        return {
          url: 'me',
          method: 'GET',
          credentials: 'include',
        };
      },
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          console.log('loadUser result:', result.data); // Debug log
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              user: result.data.user,
            })
          );
        } catch (error) {
          console.error('loadUser error:', error);
        }
      },
      providesTags: ['User'],
    }),
  }),
});

export const { useLoadUserQuery } = apiSlice;