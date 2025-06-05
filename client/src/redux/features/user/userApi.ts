import { apiSlice } from "../api/apiSlice";
import { getUsersFromResult } from "../../helper";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query({
      query: ({ userId }) => ({
        url: `user/${userId}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (arg) => [{ type: "User", id: arg.userId }],
    }),
    getAllUsers: builder.query({
      query: () => ({
        url: "users",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getUsersFromResult(result),
        { type: "User", id: "LIST" },
      ],
    }),
    updateUser: builder.mutation({
      query: ({ data }) => ({
        url: "update-user",
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      // The fix is here - make the invalidation safer
      invalidatesTags: (result) => {
        // Only invalidate if we have a successful result
        if (result?.success) {
          return [
            { type: "User", id: "me" },
            { type: "User", id: "LIST" },
          ];
        }
        return []; // Don't invalidate anything if there's an error
      },
    }),
    updateUserStatus: builder.mutation({
      query: ({ data }) => ({
        url: "update-user-status",
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => {
        return [
          { type: "User", id: arg?.id || "UNKNOWN" },
          { type: "User", id: "LIST" },
        ];
      },
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `delete/${id}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: (result, error, id) => {
        return [
          { type: "User", id },
          { type: "User", id: "LIST" },
        ];
      },
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} = userApi;
