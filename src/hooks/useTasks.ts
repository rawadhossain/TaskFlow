"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { listTasksFn } from "@/lib/tasks.functions";
import type { TaskQueryParams } from "@/lib/validations/task-query.schema";

function clientTimeZone(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export function useTasks(params: TaskQueryParams) {
  const timeZone = useMemo(() => clientTimeZone(), []);
  const merged = useMemo(
    () => (timeZone?.length ? { ...params, timeZone } : params),
    [params, timeZone],
  );

  const query = useQuery({
    queryKey: ["tasks", merged],
    queryFn: () => listTasksFn({ data: merged }),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });

  const pack = query.data;

  return {
    tasks: pack?.tasks ?? [],
    meta: pack?.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
