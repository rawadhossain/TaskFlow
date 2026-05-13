import type { Prisma, Subtask, Tag } from "@/generated/prisma/client";

export type { Priority, Subtask, Tag, Task, TaskStatus } from "@/generated/prisma/client";

export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    subtasks: true;
    tags: {
      include: {
        tag: true;
      };
    };
  };
}>;

export type ApiTagRow = Omit<Tag, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type ApiSubtaskRow = Omit<Subtask, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type ApiTaskRow = Omit<
  TaskWithRelations,
  "tags" | "subtasks" | "dueDate" | "createdAt" | "updatedAt" | "deletedAt"
> & {
  tags: ApiTagRow[];
  subtasks: ApiSubtaskRow[];
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type TagWithTaskCount = ApiTagRow & { taskCount: number };

export type StatsData = {
  counts: {
    total: number;
    dueToday: number;
    /** Completed tasks whose due date is today (subset of dueToday). */
    completedDueToday: number;
    trash: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
  streak: {
    current: number;
    lastActive: string | null;
  };
  weeklyCompletions: Array<{ date: string; count: number }>;
};

type ApiMeta = { total: number; page: number; limit: number };

export type ApiResponse<T> =
  | { success: true; data: T; meta: ApiMeta }
  | {
      success: false;
      error: {
        code: string;
        message: string;
        fields?: Record<string, string>;
      };
    };
