import { apiSlice } from "../api/apiSlice";

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    exportUsersReport: builder.mutation<Blob, void>({
      query: () => ({
        url: "/export/users",
        method: "GET",
        credentials: "include" as const,
        responseHandler: (response) => response.blob(),
      }),
    }),
    exportTasksReport: builder.mutation<Blob, void>({
      query: () => ({
        url: "/export/tasks",
        method: "GET",
        credentials: "include" as const,
        responseHandler: (response) => response.blob(), // Handle binary response
      }),
    }),
  }),
});

export const { useExportUsersReportMutation, useExportTasksReportMutation } =
  reportApi;
