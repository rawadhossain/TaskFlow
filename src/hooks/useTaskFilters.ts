"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

import type { Priority, TaskStatus } from "@/generated/prisma/enums";
import { parseTaskQueryFromSearchParams } from "@/lib/task-query-from-url";
import { tasksQueryToSearchParams } from "@/lib/tasks-query-to-search-params";
import { taskQuerySchema, type TaskQueryParams } from "@/lib/validations/task-query.schema";

export function computeActiveFilterCount(taskParams: TaskQueryParams): number {
  let n = 0;
  if (taskParams.status.length > 0) n += 1;
  if (taskParams.priority.length > 0) n += 1;
  n += taskParams.tag.length;
  if (taskParams.due !== undefined) n += 1;
  if (taskParams.search !== undefined && taskParams.search.length > 0) {
    n += 1;
  }
  return n;
}

export function locationSearchString(location: { search: unknown }): string {
  const s = location.search;
  if (typeof s === "string") {
    return s.startsWith("?") ? s.slice(1) : s;
  }
  if (s && typeof s === "object") {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(s as Record<string, unknown>)) {
      if (v === undefined || v === null) continue;
      if (Array.isArray(v)) {
        for (const item of v) {
          sp.append(k, String(item));
        }
      } else {
        sp.set(k, String(v));
      }
    }
    return sp.toString();
  }
  return "";
}

function routeHref(pathname: string, next: TaskQueryParams): string {
  const qs = tasksQueryToSearchParams(next).toString();
  return qs.length > 0 ? `${pathname}?${qs}` : pathname;
}

export function useTaskFilters(initialParamsFromServer: TaskQueryParams): {
  params: TaskQueryParams;
  activeFilterCount: number;
  clearAllFilters: () => void;
  patchParams: (patch: Partial<TaskQueryParams>) => void;
  setStatus: (status: TaskStatus[]) => void;
  setPriority: (priority: Priority[]) => void;
  setTags: (tagIds: string[]) => void;
  setDue: (due: TaskQueryParams["due"]) => void;
  setSearch: (search: string | undefined) => void;
  setSort: (sort: TaskQueryParams["sort"]) => void;
  setOrder: (order: TaskQueryParams["order"]) => void;
  setPage: (page: number) => void;
} {
  const navigate = useNavigate();
  const pathname = useLocation({ select: (l) => l.pathname });
  const searchKey = useLocation({ select: (l) => locationSearchString(l) });

  const params = useMemo(() => {
    if (searchKey.length === 0) return initialParamsFromServer;
    return parseTaskQueryFromSearchParams(new URLSearchParams(searchKey));
  }, [searchKey, initialParamsFromServer]);

  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  const commitPatch = useCallback(
    (patch: Partial<TaskQueryParams>) => {
      const next = taskQuerySchema.parse({
        ...paramsRef.current,
        ...patch,
      });
      paramsRef.current = next;
      void navigate({ href: routeHref(pathname, next), replace: true });
    },
    [pathname, navigate],
  );

  const setStatus = useCallback(
    (status: TaskStatus[]) => {
      commitPatch({ status, page: 1 });
    },
    [commitPatch],
  );

  const setPriority = useCallback(
    (priority: Priority[]) => {
      commitPatch({ priority, page: 1 });
    },
    [commitPatch],
  );

  const setTags = useCallback(
    (tagIds: string[]) => {
      commitPatch({ tag: tagIds, page: 1 });
    },
    [commitPatch],
  );

  const setDue = useCallback(
    (due: TaskQueryParams["due"]) => {
      commitPatch({ due, page: 1 });
    },
    [commitPatch],
  );

  const setSearch = useCallback(
    (raw: string | undefined) => {
      const trimmed = typeof raw === "string" ? raw.trim().slice(0, 512) : undefined;
      const search = trimmed !== undefined && trimmed.length > 0 ? trimmed : undefined;
      commitPatch({ search, page: 1 });
    },
    [commitPatch],
  );

  const setSort = useCallback(
    (sort: TaskQueryParams["sort"]) => {
      commitPatch({ sort, page: 1 });
    },
    [commitPatch],
  );

  const setOrder = useCallback(
    (order: TaskQueryParams["order"]) => {
      commitPatch({ order, page: 1 });
    },
    [commitPatch],
  );

  const setPage = useCallback(
    (page: number) => {
      const safe = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
      commitPatch({ page: safe });
    },
    [commitPatch],
  );

  const clearAllFilters = useCallback(() => {
    const blank = taskQuerySchema.parse({});
    const snapshot = paramsRef.current;
    const next = taskQuerySchema.parse({
      ...blank,
      sort: snapshot.sort,
      order: snapshot.order,
      limit: snapshot.limit,
      page: 1,
      trashOnly: false,
    });
    paramsRef.current = next;
    void navigate({ href: routeHref(pathname, next), replace: true });
  }, [pathname, navigate]);

  const activeFilterCount = useMemo(() => computeActiveFilterCount(params), [params]);

  return {
    params,
    activeFilterCount,
    clearAllFilters,
    patchParams: commitPatch,
    setStatus,
    setPriority,
    setTags,
    setDue,
    setSearch,
    setSort,
    setOrder,
    setPage,
  };
}
