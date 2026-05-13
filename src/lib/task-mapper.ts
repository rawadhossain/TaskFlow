import type { ApiTaskRow } from "@/types";
import type { Task } from "@/lib/mock-tasks";

export function apiTaskToDashboardTask(api: ApiTaskRow): Task {
  return {
    id: api.id,
    title: api.title,
    description: api.description ?? undefined,
    priority: api.priority,
    status: api.status,
    dueDate: api.dueDate ?? undefined,
    deletedAt: api.deletedAt ?? undefined,
    tags: api.tags.map((t) => ({ id: t.id, name: t.name, color: t.color })),
    subtasks: api.subtasks.map((s) => ({
      id: s.id,
      title: s.title,
      isCompleted: s.isCompleted,
    })),
    createdAt: api.createdAt,
  };
}
