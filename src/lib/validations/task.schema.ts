import { Priority, TaskStatus } from "@/generated/prisma/enums";
import { z } from "zod";

export { taskQuerySchema, type TaskQueryParams } from "@/lib/validations/task-query.schema";

export const isoDateTimeOptional = z
  .union([z.string().datetime({ offset: true }), z.null()])
  .optional();

const subtaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  isCompleted: z.boolean().optional().default(false),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.union([z.string().max(2000), z.null()]).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: isoDateTimeOptional,
  tagIds: z.array(z.string().min(1)).max(10).optional().default([]),
  subtasks: z.array(subtaskSchema).optional().default([]),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.union([z.string().max(2000), z.null()]).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: isoDateTimeOptional,
  tagIds: z.array(z.string().min(1)).max(10).optional(),
  subtasks: z.array(subtaskSchema).optional(),
});

export const reorderSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});
