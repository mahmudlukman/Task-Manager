import { apiSlice } from "../api/apiSlice";
import { getUsersFromResult } from "../../helper";

export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation({
      query: (data) => ({
        url: "create-task",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => [
        { type: "Task", id: arg.data.id },
        { type: "Task", id: "LIST" },
      ],
    }),
    getAllTasks: builder.query({
      query: () => ({
        url: "tasks",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getUsersFromResult(result),
        { type: "Task", id: "LIST" },
      ],
    }),
    getTask: builder.query({
      query: ({ id }) => ({
        url: `task/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getUsersFromResult(result),
        { type: "Task", id: "LIST" },
      ],
    }),
    updateTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `update-task/${id}`,
        method: "PUT",
        body: data,
        formData: true,
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => [
        { type: "Task", id: arg.data.id },
        { type: "Task", id: "LIST" },
      ],
    }),
    updateTaskStatus: builder.mutation({
      query: ({ id, data }) => ({
        url: `status/${id}`,
        method: "PUT",
        body: data,
        formData: true,
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => [
        { type: "Task", id: arg.data.id },
        { type: "Task", id: "LIST" },
      ],
    }),
    updateTaskChecklist: builder.mutation({
      query: ({ id, data }) => ({
        url: `todo/${id}`,
        method: "PUT",
        body: data,
        formData: true,
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => [
        { type: "Task", id: arg.data.id },
        { type: "Task", id: "LIST" },
      ],
    }),
    updateTaskAttachments: builder.mutation({
      query: ({ id, data }) => ({
        url: `task/${id}/attachments`,
        method: "PUT",
        body: data,
        formData: true,
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => [
        { type: "Task", id: arg.data.id },
        { type: "Task", id: "LIST" },
      ],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `delete-task/${id}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: (id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),
    deleteAttachment: builder.mutation({
      query: ({ id, attachmentId }) => ({
        url: `task/${id}/attachments/${attachmentId}`,
        method: "DELETE",
        credentials: "include" as const,
      }),
      invalidatesTags: (id) => [
        { type: "Task", id },
        { type: "Task", id: "LIST" },
      ],
    }),
    getDashboardData: builder.query({
      query: () => ({
        url: "dashboard-data",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getUsersFromResult(result),
        { type: "Task", id: "LIST" },
      ],
    }),
    getUserDashboardData: builder.query({
      query: () => ({
        url: "user-dashboard-data",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getUsersFromResult(result),
        { type: "Task", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useGetAllTasksQuery,
  useGetTaskQuery,
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskChecklistMutation,
  useUpdateTaskAttachmentsMutation,
  useDeleteTaskMutation,
  useDeleteAttachmentMutation,
  useGetDashboardDataQuery,
  useGetUserDashboardDataQuery,
} = taskApi;
