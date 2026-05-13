"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { TaskStatus } from "@/generated/prisma/enums";
import {
  bulkPermanentDeleteTrashFn,
  bulkSoftDeleteCompletedFn,
  createTaskFn,
  deleteTaskFn,
  permanentDeleteTaskFn,
  reorderTasksFn,
  restoreTaskFn,
  toggleTaskFn,
  updateTaskFn,
} from "@/lib/tasks.functions";
import { createTaskSchema, updateTaskSchema } from "@/lib/validations/task.schema";
import type { TaskQueryParams } from "@/lib/validations/task-query.schema";
import type { ApiTaskRow } from "@/types";
import type { z } from "zod";

type TasksPack = {
  tasks: ApiTaskRow[];
  meta: { total: number; page: number; limit: number };
};

type PrevSnapshot = Array<[readonly unknown[], TasksPack | undefined]>;

export function cycleTaskStatus(status: TaskStatus): TaskStatus {
  switch (status) {
    case "PENDING":
      return "IN_PROGRESS";
    case "IN_PROGRESS":
      return "COMPLETED";
    case "COMPLETED":
      return "PENDING";
    default:
      return "PENDING";
  }
}

function snapshotTaskQueries(queryClient: ReturnType<typeof useQueryClient>): PrevSnapshot {
  return queryClient.getQueriesData<TasksPack>({
    queryKey: ["tasks"],
    exact: false,
  }) as PrevSnapshot;
}

function restoreSnapshots(queryClient: ReturnType<typeof useQueryClient>, previous: PrevSnapshot) {
  for (const [queryKey, data] of previous) {
    queryClient.setQueryData(queryKey, data);
  }
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: z.input<typeof createTaskSchema>) => createTaskFn({ data }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.input<typeof updateTaskSchema> }) =>
      updateTaskFn({ data: { id, ...data } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useRestoreTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => restoreTaskFn({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"], exact: false });
      const previous = snapshotTaskQueries(queryClient);

      queryClient.setQueriesData<TasksPack>(
        {
          predicate: (query) => {
            if (!Array.isArray(query.queryKey) || query.queryKey[0] !== "tasks") {
              return false;
            }
            const qp = query.queryKey[1] as TaskQueryParams | undefined;
            return qp?.trashOnly === true;
          },
        },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.filter((t) => t.id !== id),
            meta: {
              ...old.meta,
              total: Math.max(0, old.meta.total - 1),
            },
          };
        },
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) restoreSnapshots(queryClient, ctx.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useToggleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => toggleTaskFn({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"], exact: false });
      const previous = snapshotTaskQueries(queryClient);

      queryClient.setQueriesData<TasksPack>({ queryKey: ["tasks"], exact: false }, (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === id ? { ...t, status: cycleTaskStatus(t.status) } : t,
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        restoreSnapshots(queryClient, ctx.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const restoreMutation = useRestoreTask();

  return useMutation({
    mutationFn: (id: string) => deleteTaskFn({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"], exact: false });
      const previous = snapshotTaskQueries(queryClient);

      queryClient.setQueriesData<TasksPack>({ queryKey: ["tasks"], exact: false }, (old) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.filter((t) => t.id !== id),
          meta: {
            ...old.meta,
            total: Math.max(0, old.meta.total - 1),
          },
        };
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        restoreSnapshots(queryClient, ctx.previous);
      }
    },
    onSuccess: (_void, deletedId) => {
      toast("Task deleted", {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => restoreMutation.mutate(deletedId),
        },
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function usePermanentDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => permanentDeleteTaskFn({ data: { id } }),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"], exact: false });
      const previous = snapshotTaskQueries(queryClient);

      queryClient.setQueriesData<TasksPack>(
        {
          predicate: (query) => {
            if (!Array.isArray(query.queryKey) || query.queryKey[0] !== "tasks") {
              return false;
            }
            const qp = query.queryKey[1] as TaskQueryParams | undefined;
            return qp?.trashOnly === true;
          },
        },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks.filter((t) => t.id !== id),
            meta: {
              ...old.meta,
              total: Math.max(0, old.meta.total - 1),
            },
          };
        },
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) restoreSnapshots(queryClient, ctx.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useBulkSoftDeleteCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bulkSoftDeleteCompletedFn({ data: { filter: "completed" } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useBulkPermanentDeleteTrash() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bulkPermanentDeleteTrashFn({ data: { filter: "trash" } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => reorderTasksFn({ data: { ids } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
    },
  });
}
