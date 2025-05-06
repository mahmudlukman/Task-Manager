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
    exportTasksReport: builder.mutation<Blob, void>({
      query: () => ({
        url: "export/users",
        method: "GET",
        responseType: "blob",
        credentials: "include" as const,
      }),
    }),
  }),
});

export const { useExportUsersReportQuery, useExportTasksReportMutation } =
  reportApi;
