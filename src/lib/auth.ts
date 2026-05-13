import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { env } from "@/env";
import prisma from "@/lib/prisma";

const canonical = new URL(env.BETTER_AUTH_URL);

/** Vercel uses many hostnames (including `*.vercel.app`). Dynamic host allowlist avoids origin/trusted-host mismatches vs a single fixed string. */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: {
    allowedHosts: Array.from(new Set([canonical.host, "*.vercel.app"])),
    protocol:
      env.NODE_ENV !== "production"
        ? canonical.protocol === "https:"
          ? "https"
          : "http"
        : "https",
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  plugins: [tanstackStartCookies()],
});
