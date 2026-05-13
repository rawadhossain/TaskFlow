import type { Priority, Prisma, TaskStatus } from "@/generated/prisma/client";
import { Prisma as PrismaNS, TaskStatus as TaskStatusEnum } from "@/generated/prisma/client";
import { comparePriority, utcAddDays, utcStartOfCalendarDayUtc } from "@/lib/api-response";
import prisma from "@/lib/prisma";
import { TAG_COLOR_PALETTE } from "@/lib/tag-palette";
import { createTagSchema, updateTagSchema } from "@/lib/validations/tag.schema";
import { createTaskSchema, reorderSchema, updateTaskSchema } from "@/lib/validations/task.schema";
import type { TaskQueryParams } from "@/lib/validations/task-query.schema";
import type { ApiSubtaskRow, ApiTagRow, ApiTaskRow, StatsData, TagWithTaskCount } from "@/types";
import type { z } from "zod";
import {
  gregorianAddDays,
  gregorianPartsInTimeZone,
  getEffectiveDueDateBounds,
  utcMillisStartOfZonedCalendarDay,
} from "@/lib/zoned-calendar";

export const TASK_INCLUDE = {
  subtasks: true,
  tags: {
    include: {
      tag: true,
    },
  },
} satisfies Prisma.TaskInclude;

export type TaskWithRelations = Prisma.TaskGetPayload<{ include: typeof TASK_INCLUDE }>;

function mapTaskRow(task: TaskWithRelations): ApiTaskRow {
  const { tags: taskTags, subtasks, dueDate, createdAt, updatedAt, deletedAt, ...rest } = task;
  return {
    ...rest,
    dueDate: dueDate?.toISOString() ?? null,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    deletedAt: deletedAt?.toISOString() ?? null,
    tags: taskTags.map((tt) => serializeTag(tt.tag)),
    subtasks: subtasks.map(serializeSubtask),
  };
}

function serializeTag(tag: {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}): ApiTagRow {
  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    userId: tag.userId,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  };
}

function serializeSubtask(s: {
  id: string;
  title: string;
  isCompleted: boolean;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}): ApiSubtaskRow {
  return {
    id: s.id,
    title: s.title,
    isCompleted: s.isCompleted,
    taskId: s.taskId,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function listTasksForUser(
  userId: string,
  q: TaskQueryParams,
): Promise<{
  tasks: ApiTaskRow[];
  meta: { total: number; page: number; limit: number };
}> {
  const tz = typeof q.timeZone === "string" ? q.timeZone.trim() || undefined : undefined;
  const { todayStart, tomorrowStart, weekEndExclusive } = getEffectiveDueDateBounds(new Date(), tz);

  const baseWhere: Prisma.TaskWhereInput = {
    userId,
    isDeleted: q.trashOnly ? true : false,
  };

  const andClauses: Prisma.TaskWhereInput[] = [];

  if (q.status.length > 0) {
    andClauses.push({ status: { in: q.status as TaskStatus[] } });
  }

  if (q.priority.length > 0) {
    andClauses.push({ priority: { in: q.priority as Priority[] } });
  }

  for (const tagId of q.tag) {
    andClauses.push({ tags: { some: { tagId } } });
  }

  switch (q.due) {
    case "today":
      andClauses.push({
        dueDate: {
          gte: todayStart,
          lt: tomorrowStart,
        },
      });
      break;
    case "thisWeek":
      andClauses.push({
        dueDate: {
          gte: todayStart,
          lt: weekEndExclusive,
        },
      });
      break;
    case "overdue":
      andClauses.push({ dueDate: { lt: todayStart } });
      andClauses.push({ status: { not: "COMPLETED" } });
      break;
    case "noDate":
      andClauses.push({ dueDate: null });
      break;
    default:
      break;
  }

  if (q.search) {
    andClauses.push({
      OR: [
        { title: { contains: q.search, mode: "insensitive" } },
        { description: { contains: q.search, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.TaskWhereInput =
    andClauses.length > 0 ? { AND: [baseWhere, ...andClauses] } : baseWhere;

  let rows: TaskWithRelations[];
  let total: number;

  if (q.sort === "priority") {
    const all = await prisma.task.findMany({
      where,
      include: TASK_INCLUDE,
    });
    total = all.length;
    const sorted = [...all].sort((a, b) =>
      q.order === "asc"
        ? comparePriority(a.priority, b.priority, "asc")
        : comparePriority(a.priority, b.priority, "desc"),
    );
    const offset = (q.page - 1) * q.limit;
    rows = sorted.slice(offset, offset + q.limit);
  } else {
    const orderBy: Prisma.TaskOrderByWithRelationInput[] = [];
    switch (q.sort) {
      case "manual":
        orderBy.push({ position: "asc" });
        orderBy.push({ createdAt: "desc" });
        break;
      case "createdAt":
        orderBy.push({ createdAt: q.order });
        break;
      case "updatedAt":
        orderBy.push({ updatedAt: q.order });
        break;
      case "dueDate":
        orderBy.push({ dueDate: { sort: q.order, nulls: "last" } });
        break;
      case "title":
        orderBy.push({ title: q.order });
        break;
      case "deletedAt":
        orderBy.push({ deletedAt: { sort: q.order, nulls: "last" } });
        break;
      default:
        orderBy.push({ position: "asc" }, { createdAt: "desc" });
    }

    total = await prisma.task.count({ where });
    const skip = (q.page - 1) * q.limit;
    rows = await prisma.task.findMany({
      where,
      orderBy,
      skip,
      take: q.limit,
      include: TASK_INCLUDE,
    });
  }

  return {
    tasks: rows.map(mapTaskRow),
    meta: { total, page: q.page, limit: q.limit },
  };
}

export async function createTaskForUser(
  userId: string,
  body: z.infer<typeof createTaskSchema>,
): Promise<ApiTaskRow> {
  if (body.tagIds.length > 0) {
    const tagMatches = await prisma.tag.findMany({
      where: { userId, id: { in: body.tagIds } },
      select: { id: true },
    });
    if (tagMatches.length !== body.tagIds.length) {
      throw new Error("One or more tags are invalid");
    }
  }

  const last = await prisma.task.findFirst({
    where: { userId, isDeleted: false },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const position = (last?.position ?? -1) + 1;

  const task = await prisma.task.create({
    data: {
      userId,
      title: body.title,
      description: body.description ?? null,
      status: body.status ?? TaskStatusEnum.PENDING,
      priority: body.priority ?? "MEDIUM",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      position,
      subtasks:
        body.subtasks.length > 0
          ? {
              createMany: {
                data: body.subtasks.map((s) => ({
                  title: s.title,
                  isCompleted: s.isCompleted ?? false,
                })),
              },
            }
          : undefined,
      tags:
        body.tagIds.length > 0
          ? {
              createMany: {
                data: body.tagIds.map((tagId) => ({ tagId })),
              },
            }
          : undefined,
    },
    include: TASK_INCLUDE,
  });

  return mapTaskRow(task);
}

export async function updateTaskForUser(
  userId: string,
  id: string,
  body: z.infer<typeof updateTaskSchema>,
): Promise<ApiTaskRow> {
  const touched =
    typeof body.title !== "undefined" ||
    typeof body.description !== "undefined" ||
    typeof body.status !== "undefined" ||
    typeof body.priority !== "undefined" ||
    typeof body.dueDate !== "undefined" ||
    typeof body.tagIds !== "undefined" ||
    typeof body.subtasks !== "undefined";

  if (!touched) {
    throw new Error("At least one updatable field is required");
  }

  const existing = await prisma.task.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Task not found");
  }

  if (body.tagIds?.length) {
    const authorizedTags = await prisma.tag.findMany({
      where: { userId, id: { in: body.tagIds } },
      select: { id: true },
    });
    if (authorizedTags.length !== body.tagIds.length) {
      throw new Error("One or more tags are invalid");
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (typeof body.tagIds !== "undefined") {
      await tx.taskTag.deleteMany({ where: { taskId: id } });
    }

    if (typeof body.subtasks !== "undefined") {
      await tx.subtask.deleteMany({ where: { taskId: id } });
    }

    return tx.task.update({
      where: { id },
      data: {
        ...(typeof body.title !== "undefined" ? { title: body.title } : {}),
        ...(typeof body.description !== "undefined" ? { description: body.description } : {}),
        ...(typeof body.status !== "undefined" ? { status: body.status } : {}),
        ...(typeof body.priority !== "undefined" ? { priority: body.priority } : {}),
        ...(typeof body.dueDate !== "undefined"
          ? { dueDate: body.dueDate ? new Date(body.dueDate) : null }
          : {}),
        ...(typeof body.subtasks !== "undefined"
          ? {
              subtasks: {
                createMany: {
                  data: body.subtasks.map((s) => ({
                    title: s.title,
                    isCompleted: s.isCompleted ?? false,
                  })),
                },
              },
            }
          : {}),
        ...(typeof body.tagIds !== "undefined"
          ? {
              tags:
                body.tagIds.length === 0
                  ? undefined
                  : {
                      createMany: {
                        data: body.tagIds.map((tagId) => ({ tagId })),
                      },
                    },
            }
          : {}),
      },
      include: TASK_INCLUDE,
    });
  });

  return mapTaskRow(updated);
}

function nextCycleStatus(status: TaskStatus): TaskStatus {
  switch (status) {
    case TaskStatusEnum.PENDING:
      return TaskStatusEnum.IN_PROGRESS;
    case TaskStatusEnum.IN_PROGRESS:
      return TaskStatusEnum.COMPLETED;
    case TaskStatusEnum.COMPLETED:
      return TaskStatusEnum.PENDING;
    default:
      return TaskStatusEnum.PENDING;
  }
}

export async function toggleTaskForUser(userId: string, id: string): Promise<ApiTaskRow> {
  const candidate = await prisma.task.findFirst({
    where: { id, userId },
    select: { isDeleted: true, status: true },
  });

  if (!candidate || candidate.isDeleted) {
    throw new Error("Task not found");
  }

  const upcomingStatus = nextCycleStatus(candidate.status);
  const todayStart = utcStartOfCalendarDayUtc();
  const yesterdayStart = utcAddDays(todayStart, -1);

  const updated = await prisma.$transaction(async (tx) => {
    if (upcomingStatus === TaskStatusEnum.COMPLETED) {
      const dbUser = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { currentStreak: true, lastActiveDate: true },
      });

      let nextStreak = dbUser.currentStreak;
      const last = dbUser.lastActiveDate;

      if (!last) {
        nextStreak = 1;
      } else {
        const lastStart = utcStartOfCalendarDayUtc(last);

        if (lastStart.getTime() === todayStart.getTime()) {
          nextStreak = dbUser.currentStreak;
        } else if (lastStart.getTime() === yesterdayStart.getTime()) {
          nextStreak = dbUser.currentStreak + 1;
        } else {
          nextStreak = 1;
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          lastActiveDate: todayStart,
          currentStreak: nextStreak,
        },
      });
    }

    return tx.task.update({
      where: { id },
      data: { status: upcomingStatus },
      include: TASK_INCLUDE,
    });
  });

  return mapTaskRow(updated);
}

export async function softDeleteTaskForUser(userId: string, id: string): Promise<ApiTaskRow> {
  const candidate = await prisma.task.findFirst({
    where: { id, userId },
    select: { isDeleted: true },
  });

  if (!candidate || candidate.isDeleted) {
    throw new Error("Task not found");
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
    include: TASK_INCLUDE,
  });

  return mapTaskRow(updated);
}

export async function restoreTaskForUser(userId: string, id: string): Promise<ApiTaskRow> {
  const candidate = await prisma.task.findFirst({
    where: { id, userId },
    select: { isDeleted: true },
  });

  if (!candidate || !candidate.isDeleted) {
    throw new Error("Task not found");
  }

  const restored = await prisma.task.update({
    where: { id },
    data: {
      isDeleted: false,
      deletedAt: null,
    },
    include: TASK_INCLUDE,
  });

  return mapTaskRow(restored);
}

export async function permanentDeleteTaskForUser(userId: string, id: string): Promise<void> {
  const candidate = await prisma.task.findFirst({
    where: { id, userId },
    select: { isDeleted: true },
  });

  if (!candidate) {
    throw new Error("Task not found");
  }

  if (!candidate.isDeleted) {
    throw new Error("Task must be soft-deleted before permanent deletion");
  }

  const deleted = await prisma.task.deleteMany({
    where: { id, userId, isDeleted: true },
  });

  if (deleted.count !== 1) {
    throw new Error("Task not found");
  }
}

export async function bulkSoftDeleteCompletedForUser(userId: string): Promise<{ count: number }> {
  const result = await prisma.task.updateMany({
    where: {
      userId,
      isDeleted: false,
      status: TaskStatusEnum.COMPLETED,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
  return { count: result.count };
}

export async function bulkPermanentDeleteTrashForUser(userId: string): Promise<{ count: number }> {
  const result = await prisma.task.deleteMany({
    where: {
      userId,
      isDeleted: true,
    },
  });
  return { count: result.count };
}

export async function reorderTasksForUser(
  userId: string,
  ids: z.infer<typeof reorderSchema>["ids"],
): Promise<{ ids: string[] }> {
  const owned = await prisma.task.findMany({
    where: {
      userId,
      id: { in: ids },
      isDeleted: false,
    },
    select: { id: true },
  });

  if (owned.length !== ids.length) {
    throw new Error("One or more tasks are invalid or not owned by you");
  }

  await prisma.$transaction(
    ids.map((taskId, index) =>
      prisma.task.update({
        where: { id: taskId },
        data: { position: index },
      }),
    ),
  );

  return { ids };
}

export async function getTaskStatsForUser(
  userId: string,
  opts?: { timeZone?: string },
): Promise<StatsData> {
  const ref = new Date();
  const tz = opts?.timeZone?.trim() || undefined;
  const { todayStart, tomorrowStart } = getEffectiveDueDateBounds(ref, tz);

  const countsBase = {
    total: prisma.task.count({ where: { userId, isDeleted: false } }),
    dueToday: prisma.task.count({
      where: {
        userId,
        isDeleted: false,
        dueDate: { gte: todayStart, lt: tomorrowStart },
      },
    }),
    completedDueToday: prisma.task.count({
      where: {
        userId,
        isDeleted: false,
        status: TaskStatusEnum.COMPLETED,
        dueDate: { gte: todayStart, lt: tomorrowStart },
      },
    }),
    trash: prisma.task.count({ where: { userId, isDeleted: true } }),
    pending: prisma.task.count({
      where: { userId, isDeleted: false, status: TaskStatusEnum.PENDING },
    }),
    inProgress: prisma.task.count({
      where: {
        userId,
        isDeleted: false,
        status: TaskStatusEnum.IN_PROGRESS,
      },
    }),
    completed: prisma.task.count({
      where: {
        userId,
        isDeleted: false,
        status: TaskStatusEnum.COMPLETED,
      },
    }),
    overdue: prisma.task.count({
      where: {
        userId,
        isDeleted: false,
        status: { not: TaskStatusEnum.COMPLETED },
        dueDate: { lt: todayStart },
      },
    }),
  };

  const [
    total,
    dueToday,
    completedDueToday,
    trash,
    pending,
    inProgress,
    completed,
    overdue,
    userRecord,
  ] = await Promise.all([
    countsBase.total,
    countsBase.dueToday,
    countsBase.completedDueToday,
    countsBase.trash,
    countsBase.pending,
    countsBase.inProgress,
    countsBase.completed,
    countsBase.overdue,
    prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, lastActiveDate: true },
    }),
  ]);

  const utcAnchorForWeekFallback = utcStartOfCalendarDayUtc(ref);

  const weeklyCompletions = await Promise.all(
    [6, 5, 4, 3, 2, 1, 0].map(async (offset) => {
      let dayStart: Date;
      let dayEnd: Date;

      if (tz) {
        const { year, month, day } = gregorianPartsInTimeZone(ref, tz);
        const dp = gregorianAddDays(year, month, day, -offset);
        const dayStartMs = utcMillisStartOfZonedCalendarDay(dp.year, dp.month, dp.day, tz);
        const next = gregorianAddDays(dp.year, dp.month, dp.day, 1);
        const dayEndMs = utcMillisStartOfZonedCalendarDay(next.year, next.month, next.day, tz);
        dayStart = new Date(dayStartMs);
        dayEnd = new Date(dayEndMs);
      } else {
        dayStart = utcAddDays(utcAnchorForWeekFallback, -offset);
        dayEnd = utcAddDays(dayStart, 1);
      }

      const count = await prisma.task.count({
        where: {
          userId,
          isDeleted: false,
          status: TaskStatusEnum.COMPLETED,
          updatedAt: {
            gte: dayStart,
            lt: dayEnd,
          },
        },
      });

      return {
        date: dayStart.toISOString(),
        count,
      };
    }),
  );

  return {
    counts: {
      total,
      dueToday,
      completedDueToday,
      trash,
      pending,
      inProgress,
      completed,
      overdue,
    },
    streak: {
      current: userRecord?.currentStreak ?? 0,
      lastActive: userRecord?.lastActiveDate?.toISOString() ?? null,
    },
    weeklyCompletions,
  };
}

export async function listTagsForUser(userId: string): Promise<TagWithTaskCount[]> {
  const tags = await prisma.tag.findMany({
    where: { userId },
    include: {
      _count: {
        select: { tasks: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return tags.map(({ _count, ...rest }) => ({
    ...serializeTag(rest),
    taskCount: _count.tasks,
  }));
}

export async function createTagForUser(
  userId: string,
  body: z.infer<typeof createTagSchema>,
): Promise<ApiTagRow> {
  const existingCount = await prisma.tag.count({ where: { userId } });
  const color = body.color ?? TAG_COLOR_PALETTE[existingCount % TAG_COLOR_PALETTE.length]!;

  try {
    const created = await prisma.tag.create({
      data: {
        userId,
        name: body.name,
        color,
      },
    });
    return serializeTag(created);
  } catch (error: unknown) {
    if (error instanceof PrismaNS.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("A tag with this name already exists");
    }
    throw error;
  }
}

export async function updateTagForUser(
  userId: string,
  id: string,
  body: z.infer<typeof updateTagSchema>,
): Promise<ApiTagRow> {
  const candidate = await prisma.tag.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!candidate) {
    throw new Error("Tag not found");
  }

  const touched = typeof body.name !== "undefined" || typeof body.color !== "undefined";
  if (!touched) {
    throw new Error("Provide at least one field to update");
  }

  try {
    const updated = await prisma.tag.update({
      where: { id },
      data: {
        ...(typeof body.name !== "undefined" ? { name: body.name } : {}),
        ...(typeof body.color !== "undefined" ? { color: body.color } : {}),
      },
    });
    return serializeTag(updated);
  } catch (error: unknown) {
    if (error instanceof PrismaNS.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("A tag with this name already exists");
    }
    throw error;
  }
}

export async function deleteTagForUser(userId: string, id: string): Promise<void> {
  const candidate = await prisma.tag.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!candidate) {
    throw new Error("Tag not found");
  }

  const deleted = await prisma.tag.deleteMany({
    where: { id, userId },
  });

  if (deleted.count !== 1) {
    throw new Error("Tag not found");
  }
}
