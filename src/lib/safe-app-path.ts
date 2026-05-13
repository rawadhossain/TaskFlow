import { env } from "@/env";

export function safeAppPath(redirect: string | undefined): string {
  if (!redirect) return "/tasks";
  try {
    const target = new URL(redirect, env.BETTER_AUTH_URL);
    const base = new URL(env.BETTER_AUTH_URL);
    if (target.origin !== base.origin) return "/tasks";
    const path = `${target.pathname}${target.search}${target.hash}`;
    return path.startsWith("/") ? path : "/tasks";
  } catch {
    return "/tasks";
  }
}
