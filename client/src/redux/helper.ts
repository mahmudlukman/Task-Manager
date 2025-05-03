/* eslint-disable @typescript-eslint/no-explicit-any */
type EntityType = "Task" | "Report" | "User";

export const getEntitiesFromResult = <T extends EntityType>(
  result: any,
  entityType: T
): Array<{ type: T; id: string | number }> => {
  if (Array.isArray(result)) {
    return result.map(({ id }) => ({ type: entityType, id }));
  }
  if (result && typeof result === "object" && "id" in result) {
    return [{ type: entityType, id: result.id }];
  }
  return [];
};

// Usage examples:
export const getTaskFromResult = (result: any) =>
  getEntitiesFromResult(result, "Task");

export const getReportFromResult = (result: any) =>
  getEntitiesFromResult(result, "Report");

export const getUsersFromResult = (result: any) =>
  getEntitiesFromResult(result, "User");
