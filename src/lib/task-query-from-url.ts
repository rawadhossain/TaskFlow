import { taskQuerySchema, type TaskQueryParams } from "@/lib/validations/task-query.schema";

function normalizeTaskQueryKeys(input: Record<string, string | string[] | undefined>) {
  const getter = (key: string) => {
    const raw = input[key];
    return typeof raw === "string" ? raw : raw?.at(0);
  };
  return Object.fromEntries(
    [
      "status",
      "priority",
      "tag",
      "due",
      "search",
      "sort",
      "order",
      "page",
      "limit",
      "trashOnly",
    ].map((k) => [k, getter(k)]),
  );
}

export function searchParamsKeysToNormalizeInput(
  searchParams: URLSearchParams,
): Record<string, string | string[] | undefined> {
  const uniqueKeys = [...new Set(searchParams.keys())];
  const out: Record<string, string | string[] | undefined> = {};
  for (const key of uniqueKeys) {
    const all = searchParams.getAll(key).filter((v) => v.length > 0);
    if (all.length === 0) {
      out[key] = undefined;
    } else if (all.length === 1 && all[0] !== undefined) {
      out[key] = all[0];
    } else {
      out[key] = all;
    }
  }
  return out;
}

export function parseTaskQueryFromSearchParams(searchParams: URLSearchParams): TaskQueryParams {
  const raw = normalizeTaskQueryKeys(searchParamsKeysToNormalizeInput(searchParams));
  const parsed = taskQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : taskQuerySchema.parse({});
}
