import type { Priority } from "@/generated/prisma/client";
import type { ZodError } from "zod";

type PaginationMeta = { total: number; page: number; limit: number };

export function okJson<T>(data: T, metaOverrides?: Partial<PaginationMeta>, init?: ResponseInit) {
  const meta: PaginationMeta = { total: 0, page: 1, limit: 20, ...(metaOverrides ?? {}) };
  return Response.json({ success: true as const, data, meta }, init);
}

export function validationError(fields: Record<string, string>, message = "Validation failed") {
  return Response.json(
    {
      success: false as const,
      error: { code: "VALIDATION_ERROR", message, fields },
    },
    { status: 400 },
  );
}

export function unauthorized(message = "You must be signed in") {
  return Response.json(
    { success: false as const, error: { code: "UNAUTHORIZED", message } },
    { status: 401 },
  );
}

export function forbidden(message = "You do not have access to this resource") {
  return Response.json(
    { success: false as const, error: { code: "FORBIDDEN", message } },
    { status: 403 },
  );
}

export function notFound(message = "Resource not found") {
  return Response.json(
    { success: false as const, error: { code: "NOT_FOUND", message } },
    { status: 404 },
  );
}

export function conflict(message: string, fields?: Record<string, string>) {
  return Response.json(
    {
      success: false as const,
      error: {
        code: "CONFLICT",
        message,
        ...(fields ? { fields } : {}),
      },
    },
    { status: 409 },
  );
}

export function badRequestEnvelope(message: string, fields?: Record<string, string>) {
  return Response.json(
    {
      success: false as const,
      error: {
        code: "BAD_REQUEST",
        message,
        ...(fields ? { fields } : {}),
      },
    },
    { status: 400 },
  );
}

export function internalError(routeName: string, error: unknown) {
  console.error(routeName, error);
  return Response.json(
    {
      success: false as const,
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong",
      },
    },
    { status: 500 },
  );
}

export function utcStartOfCalendarDayUtc(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function utcAddDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function normalizeTaskQuery(input: Record<string, string | string[] | undefined>) {
  const getter = (key: string) => {
    const raw = input[key];
    return typeof raw === "string" ? raw : raw?.at(0);
  };
  return Object.fromEntries(
    [
      "status",
      "priority",
      "tag",
      "due",
      "search",
      "sort",
      "order",
      "page",
      "limit",
      "trashOnly",
    ].map((k) => [k, getter(k)]),
  );
}

export const priorityRank: Record<Priority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export function comparePriority(a: Priority, b: Priority, dir: "asc" | "desc") {
  const av = priorityRank[a];
  const bv = priorityRank[b];
  if (av !== bv) return dir === "asc" ? av - bv : bv - av;
  return 0;
}

export function flattenZodFieldErrors(error: ZodError) {
  const fields: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(error.flatten().fieldErrors)) {
    if (!msgs) continue;
    if (Array.isArray(msgs) && typeof msgs[0] === "string") fields[key] = msgs[0];
    else if (typeof msgs === "string") fields[key] = msgs;
  }
  return fields;
}
