import { z } from "zod";

const taskStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]);
const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

const statusFromQuerySchema = z
  .union([z.string(), z.literal(""), z.array(taskStatusEnum)])
  .transform((raw) => {
    if (raw === "") return [];
    if (Array.isArray(raw)) return raw;
    return raw.trim().length > 0
      ? raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  })
  .pipe(z.array(taskStatusEnum))
  .optional()
  .default([]);

const priorityFromQuerySchema = z
  .union([z.string(), z.literal(""), z.array(priorityEnum)])
  .transform((raw) => {
    if (raw === "") return [];
    if (Array.isArray(raw)) return raw;
    return raw.trim().length > 0
      ? raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  })
  .pipe(z.array(priorityEnum))
  .optional()
  .default([]);

const tagListInputSchema = z
  .union([z.string(), z.literal(""), z.array(z.string())])
  .transform((raw) => {
    if (raw === "") return [];
    if (Array.isArray(raw)) return raw;
    return raw.trim().length > 0
      ? raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  })
  .pipe(z.array(z.string().min(1)))
  .optional()
  .default([]);

export const taskQuerySchema = z.object({
  status: statusFromQuerySchema,
  priority: priorityFromQuerySchema,
  tag: tagListInputSchema,
  due: z.enum(["today", "thisWeek", "overdue", "noDate"]).optional(),
  search: z
    .union([z.literal(""), z.string()])
    .transform((v) => {
      if (v === "" || v.trim().length === 0) return undefined;
      return v.trim().slice(0, 512);
    })
    .optional(),
  sort: z
    .enum(["manual", "createdAt", "updatedAt", "dueDate", "priority", "title", "deletedAt"])
    .optional()
    .default("manual"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(20),
  trashOnly: z
    .union([
      z.literal(""),
      z.literal("true"),
      z.literal("false"),
      z.literal("1"),
      z.literal("0"),
      z.boolean(),
    ])
    .transform((v) => v === true || v === "true" || v === "1")
    .optional()
    .default(false),
  /** IANA zone (`Intl`). When set, "today"/week due filters align with wall-clock day (matches date-picker storage). */
  timeZone: z.string().min(2).max(200).optional(),
});

export type TaskQueryParams = z.infer<typeof taskQuerySchema>;
