import { taskQuerySchema, type TaskQueryParams } from "@/lib/validations/task-query.schema";

export function parseTasksRouteSearch(raw: Record<string, unknown>): TaskQueryParams {
  const parsed = taskQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : taskQuerySchema.parse({});
}

export type { TaskQueryParams as TasksRouteSearch } from "@/lib/validations/task-query.schema";
