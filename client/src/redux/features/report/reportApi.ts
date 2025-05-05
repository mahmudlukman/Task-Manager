import { apiSlice } from "../api/apiSlice";
import { getUsersFromResult } from "../../helper";

export const reportApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    exportUsersReport: builder.query({
      query: () => ({
        url: "export/tasks",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getUsersFromResult(result),
        { type: "Report", id: "LIST" },
      ],
    }),
    exportTasksReport: builder.query({
      query: () => ({
        url: "export/users",
        method: "GET",
        credentials: "include" as const,
      }),
      providesTags: (result) => [
        ...getUsersFromResult(result),
        { type: "Report", id: "LIST" },
      ],
    }),
  }),
});

export const { useExportUsersReportQuery, useExportTasksReportQuery } =
  reportApi;
