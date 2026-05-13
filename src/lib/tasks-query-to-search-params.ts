import type { TaskQueryParams } from "@/lib/validations/task-query.schema";

export function tasksQueryToSearchParams(params: TaskQueryParams): URLSearchParams {
  const sp = new URLSearchParams();

  if (params.status.length > 0) {
    sp.set("status", params.status.join(","));
  }
  if (params.priority.length > 0) {
    sp.set("priority", params.priority.join(","));
  }
  if (params.tag.length > 0) {
    sp.set("tag", params.tag.join(","));
  }
  if (params.due !== undefined) {
    sp.set("due", params.due);
  }
  if (params.search !== undefined && params.search.length > 0) {
    sp.set("search", params.search);
  }

  sp.set("sort", params.sort);
  sp.set("order", params.order);
  sp.set("page", String(params.page));
  sp.set("limit", String(params.limit));

  if (params.trashOnly) {
    sp.set("trashOnly", "true");
  }

  return sp;
}
