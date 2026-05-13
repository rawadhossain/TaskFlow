import { defaultParseSearch, stringifySearchWith } from "@tanstack/react-router";

export function compactTaskSearchBeforeStringify(
  search: Record<string, unknown>,
): Record<string, unknown> {
  const out = { ...search };
  const emptyListKeys = ["status", "priority", "tag"] as const;
  for (const k of emptyListKeys) {
    const v = out[k];
    if (Array.isArray(v) && v.length === 0) delete out[k];
  }
  if (out.sort === "manual") delete out.sort;
  if (out.order === "asc") delete out.order;
  if (out.page === 1) delete out.page;
  if (out.limit === 20) delete out.limit;
  if (out.trashOnly === false) delete out.trashOnly;
  return out;
}

const stringifyWithFlatArrays = stringifySearchWith((val: unknown) => {
  if (Array.isArray(val)) return val.join(",");
  return JSON.stringify(val);
}, JSON.parse);

export function compactRouterStringifySearch(search: Record<string, unknown>): string {
  return stringifyWithFlatArrays(compactTaskSearchBeforeStringify(search));
}

export const compactRouterParseSearch = defaultParseSearch;
