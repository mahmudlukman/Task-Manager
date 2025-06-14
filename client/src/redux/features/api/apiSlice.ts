import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { userLoggedIn } from "../auth/authSlice";
// import { RootState } from "../../../@types";

export const apiSlice = createApi({
  tagTypes: ["User", "Task", "Report", "Notifications"],
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl:
      import.meta.env.VITE_PUBLIC_SERVER_URI || "http://localhost:8000/api/v1/",
  }),
  endpoints: (builder) => ({
    loadUser: builder.query({
      query: () => {
        // This query fetches the logged-in user's profile
        return {
          url: "me",
          method: "GET",
          credentials: "include",
        };
      },
      async onQueryStarted(arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          // If the query is successful, dispatch the userLoggedIn action
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              user: result.data.user,
            })
          );
        } catch (error) {
          console.error("loadUser error:", error);
        }
      },
      providesTags: ["User"],
    }),
  }),
});

export const { useLoadUserQuery } = apiSlice;
