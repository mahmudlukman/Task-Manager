import { apiSlice } from "../api/apiSlice";
// import { getUsersFromResult } from "../../helper";
import {
  AdminDashboardData,
  GetAllTasksResponse,
  Task,
  Todo,
  // UserDashboardData,
} from "../../../@types";

export const taskApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTask: builder.mutation({
      query: (data) => ({
        url: "create-task",
        method: "POST",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: (result) => {
        return [
          { type: "Task", id: result?.task?._id },
          { type: "Task", id: "LIST" },
        ];
      },
    }),
    getAllTasks: builder.query<GetAllTasksResponse, { status?: string }>({
      query: ({ status }) => ({
        url: "tasks",
        method: "GET",
        params: status ? { status } : undefined,
        credentials: "include" as const,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.tasks.map(({ _id }) => ({
                type: "Task" as const,
                id: _id,
              })),
              { type: "Task", id: "LIST" },
              // Add user tags for assignedTo
              ...result.tasks.flatMap((task) =>
                task.assignedTo.map((user) => ({
                  type: "User" as const,
                  id: user._id,
                }))
              ),
            ]
          : [{ type: "Task", id: "LIST" }],
    }),
    getTask: builder.query<Task, { id: string }>({
      query: ({ id }) => ({
        url: `task/${id}`,
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) =>
        result
          ? [
              { type: "Task", id: result._id },
              ...result.assignedTo.map((user) => ({
                type: "User" as const,
                id: user._id,
              })),
            ]
          : [{ type: "Task", id: "LIST" }],
    }),
    updateTask: builder.mutation({
      query: ({ id, data }) => ({
        url: `update-task/${id}`,
        method: "PUT",
        body: data,
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
        credentials: "include" as const,
      }),
      invalidatesTags: (arg) => [
        { type: "Task", id: arg.data.id },
        { type: "Task", id: "LIST" },
      ],
    }),
    updateTaskChecklist: builder.mutation<
      Task,
      { id: string; data: { todoChecklist: Todo[] } }
    >({
      query: ({ id, data }) => ({
        url: `todo/${id}`,
        method: "PUT",
        body: data,
        credentials: "include" as const,
      }),
      invalidatesTags: (result) => [
        { type: "Task", id: result?._id },
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
    getDashboardData: builder.query<AdminDashboardData, void>({
      query: () => ({
        url: "dashboard-data",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) =>
        result && result.recentTasks && Array.isArray(result.recentTasks)
          ? [
              { type: "Task", id: "LIST" },
              ...result.recentTasks.map((task: Task) => ({
                type: "Task" as const,
                id: task._id,
              })),
              ...result.recentTasks.flatMap((task: Task) =>
                task.assignedTo && Array.isArray(task.assignedTo)
                  ? task.assignedTo.map((user) => ({
                      type: "User" as const,
                      id: user._id,
                    }))
                  : []
              ),
            ]
          : [{ type: "Task", id: "LIST" }],
    }),
    getUserDashboardData: builder.query<AdminDashboardData, void>({
      query: () => ({
        url: "user-dashboard-data",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) =>
        result && result.recentTasks && Array.isArray(result.recentTasks)
          ? [
              { type: "Task", id: "LIST" },
              ...result.recentTasks.map((task: Task) => ({
                type: "Task" as const,
                id: task._id,
              })),
              ...result.recentTasks.flatMap((task: Task) =>
                task.assignedTo && Array.isArray(task.assignedTo)
                  ? task.assignedTo.map((user) => ({
                      type: "User" as const,
                      id: user._id,
                    }))
                  : []
              ),
            ]
          : [{ type: "Task", id: "LIST" }],
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
