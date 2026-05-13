import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import { auth } from "@/lib/auth";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await auth.api.getSession({ headers: getRequestHeaders() });
  } catch (error) {
    console.error("[getSession]", error);
    return null;
  }
});

export const ensureSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
});
