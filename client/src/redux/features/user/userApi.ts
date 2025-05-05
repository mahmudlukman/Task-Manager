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
        formData: true,
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => [
        { type: "User", id: arg.data.id },
        { type: "User", id: "LIST" },
      ],
    }),
    updateUserRole: builder.mutation({
      query: ({ data }) => ({
        url: "update-user-role",
        method: "PUT",
        body: data,
        formData: true,
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => [
        { type: "User", id: arg.data.id },
        { type: "User", id: "LIST" },
      ],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `delete/${id}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: (id) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetUserQuery,
  useGetAllUsersQuery,
  useUpdateUserMutation,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
} = userApi;
