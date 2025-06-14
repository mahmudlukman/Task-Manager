import { apiSlice } from "../api/apiSlice";

export const notificationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUserNotifications: builder.query({
      query: () => {
        return {
          url: "get-user-notifications",
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["Notifications"],
    }),
    markNotificationAsRead: builder.mutation({
      query: (id) => ({
        url: `mark-as-read/${id}`,
        method: "PUT",
        credentials: "include",
      }),
      invalidatesTags: ["Notifications"],
    }),
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `delete-notification/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetUserNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi;