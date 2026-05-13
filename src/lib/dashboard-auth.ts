import { redirect } from "@tanstack/react-router";

import { getSession } from "@/lib/auth.functions";

export async function requireDashboardSession(opts: { location: { href: string } }) {
  const session = await getSession();
  if (!session) {
    throw redirect({
      to: "/login",
      search: { redirect: opts.location.href },
    });
  }
  return { session };
}
