import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import {
  bulkPermanentDeleteTrashForUser,
  bulkSoftDeleteCompletedForUser,
  createTaskForUser,
  createTagForUser,
  deleteTagForUser,
  listTasksForUser,
  listTagsForUser,
  permanentDeleteTaskForUser,
  getTaskStatsForUser,
  reorderTasksForUser,
  restoreTaskForUser,
  softDeleteTaskForUser,
  toggleTaskForUser,
  updateTagForUser,
  updateTaskForUser,
} from "@/lib/tasks.repo";
import {
  bulkCompletedDeleteSchema,
  bulkTrashPermanentDeleteSchema,
} from "@/lib/validations/task-bulk.schema";
import { createTagSchema, updateTagSchema } from "@/lib/validations/tag.schema";
import { taskQuerySchema } from "@/lib/validations/task-query.schema";
import { createTaskSchema, reorderSchema, updateTaskSchema } from "@/lib/validations/task.schema";

async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: getRequestHeaders() });
  const id = session?.user?.id;
  if (!id || typeof id !== "string") {
    throw new Error("Unauthorized");
  }
  return id;
}

const statsPayloadSchema = z.object({
  timeZone: z.string().min(2).max(200).optional(),
});

export const listTasksFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => taskQuerySchema.parse(data ?? {}))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    return listTasksForUser(userId, data);
  });

export const getTaskStatsFn = createServerFn({ method: "POST" })
  .inputValidator((raw: unknown) => statsPayloadSchema.parse(raw ?? {}))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    return getTaskStatsForUser(userId, { timeZone: data.timeZone });
  });

export const listTagsFn = createServerFn({ method: "GET" }).handler(async () => {
  const userId = await requireUserId();
  return listTagsForUser(userId);
});

export const createTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createTaskSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    return createTaskForUser(userId, data);
  });

const updateTaskInputSchema = z.object({ id: z.string().min(1) }).merge(updateTaskSchema);

export const updateTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateTaskInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const { id, ...body } = data;
    return updateTaskForUser(userId, id, body);
  });

export const toggleTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    return toggleTaskForUser(userId, data.id);
  });

export const deleteTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    return softDeleteTaskForUser(userId, data.id);
  });

export const restoreTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    return restoreTaskForUser(userId, data.id);
  });

export const permanentDeleteTaskFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await permanentDeleteTaskForUser(userId, data.id);
    return { ok: true as const };
  });

export const reorderTasksFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => reorderSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    return reorderTasksForUser(userId, data.ids);
  });

export const bulkSoftDeleteCompletedFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bulkCompletedDeleteSchema.parse(data))
  .handler(async () => {
    const userId = await requireUserId();
    return bulkSoftDeleteCompletedForUser(userId);
  });

export const bulkPermanentDeleteTrashFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bulkTrashPermanentDeleteSchema.parse(data))
  .handler(async () => {
    const userId = await requireUserId();
    return bulkPermanentDeleteTrashForUser(userId);
  });

export const createTagFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createTagSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    return createTagForUser(userId, data);
  });

const updateTagInputSchema = z.object({ id: z.string().min(1) }).merge(updateTagSchema);

export const updateTagFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => updateTagInputSchema.parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    const { id, ...body } = data;
    return updateTagForUser(userId, id, body);
  });

export const deleteTagFn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const userId = await requireUserId();
    await deleteTagForUser(userId, data.id);
    return { ok: true as const };
  });
