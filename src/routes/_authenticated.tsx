import { Outlet, createFileRoute } from "@tanstack/react-router";

import { requireDashboardSession } from "@/lib/dashboard-auth";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const { session } = await requireDashboardSession({ location });
    return { session };
  },
  component: AuthenticatedOutlet,
});

function AuthenticatedOutlet() {
  return <Outlet />;
}
