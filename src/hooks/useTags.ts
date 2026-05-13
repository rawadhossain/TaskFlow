import { useQuery } from "@tanstack/react-query";

import { listTagsFn } from "@/lib/tasks.functions";

export function useTags() {
  const query = useQuery({
    queryKey: ["tags"],
    queryFn: () => listTagsFn(),
    staleTime: 60_000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
  });

  return {
    tags: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
