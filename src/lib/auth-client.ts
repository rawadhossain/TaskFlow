import { createAuthClient } from "better-auth/react";

const origin = import.meta.env.VITE_BETTER_AUTH_URL;

export const authClient = createAuthClient({
  baseURL: typeof origin === "string" ? origin : "",
});
