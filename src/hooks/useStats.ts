"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getTaskStatsFn } from "@/lib/tasks.functions";

function clientTimeZone(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

export function useStats() {
  const timeZone = useMemo(() => clientTimeZone(), []);

  const query = useQuery({
    queryKey: ["stats", timeZone ?? "UTC_FALLBACK"],
    queryFn: () => getTaskStatsFn({ data: timeZone ? { timeZone } : {} }),
    staleTime: 15_000,
    refetchOnWindowFocus: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
