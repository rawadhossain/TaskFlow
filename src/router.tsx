import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import {
  compactRouterParseSearch,
  compactRouterStringifySearch,
} from "@/lib/router-search-serialization";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    parseSearch: compactRouterParseSearch,
    stringifySearch: compactRouterStringifySearch,
  });

  return router;
};
