import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ListTodo,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { TaskFlowMark } from "@/components/branding/TaskFlowLogo";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { FocusCard } from "@/components/dashboard/FocusCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { SortableTaskCard } from "@/components/dashboard/SortableTaskCard";
import { StatsBar } from "@/components/dashboard/StatsBar";
import { StaggerItem } from "@/components/dashboard/StaggerItem";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { TaskFormDialog } from "@/components/dashboard/TaskFormDialog";
import { TasksExplorerToolbar } from "@/components/dashboard/TasksExplorerToolbar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { consumeOpenNewTaskFromStorage } from "@/hooks/useDashboardKeyboardShortcuts";
import { useDragReorder } from "@/hooks/useDragReorder";
import {
  useCreateTask,
  useDeleteTask,
  useReorderTasks,
  useToggleTask,
} from "@/hooks/useTaskMutations";
import { useStats } from "@/hooks/useStats";
import { useTags } from "@/hooks/useTags";
import { useTasks } from "@/hooks/useTasks";
import { authLayoutRouteApi } from "@/lib/auth-layout-route-api";
import { apiTaskToDashboardTask } from "@/lib/task-mapper";
import { parseTasksRouteSearch } from "@/lib/tasks-route-search";
import { taskQuerySchema, type TaskQueryParams } from "@/lib/validations/task-query.schema";
import type { Task } from "@/lib/mock-tasks";
import type { ApiTaskRow } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/tasks")({
  validateSearch: (raw: Record<string, unknown>) => parseTasksRouteSearch(raw),
  component: Dashboard,
});

function Dashboard() {
  const { session } = authLayoutRouteApi.useRouteContext();
  const params = Route.useSearch();
  const navigate = useNavigate({ from: "/tasks" });
  const displayName = session.user.name?.trim() || session.user.email?.split("@")[0] || "there";

  const [quick, setQuick] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState<ApiTaskRow | null>(null);
  const [searchInput, setSearchInput] = useState(params.search ?? "");

  useEffect(() => {
    if (consumeOpenNewTaskFromStorage()) {
      setEditTask(null);
      setDialogOpen(true);
    }
  }, []);

  useEffect(() => {
    const onOpenNew = () => {
      setEditTask(null);
      setDialogOpen(true);
    };
    window.addEventListener("taskflo:open-new-task", onOpenNew);
    return () => window.removeEventListener("taskflo:open-new-task", onOpenNew);
  }, []);

  useEffect(() => {
    setSearchInput(params.search ?? "");
  }, [params.search]);

  const debouncedSearch = useDebouncedValue(searchInput, 400);
  useEffect(() => {
    const next = debouncedSearch.trim();
    if (next === (params.search ?? "").trim()) return;
    void navigate({
      search: (prev) =>
        taskQuerySchema.parse({
          ...prev,
          search: next.length > 0 ? next : undefined,
          page: 1,
        }),
      replace: true,
    });
  }, [debouncedSearch, navigate, params.search]);

  const patchParams = useCallback(
    (patch: Partial<TaskQueryParams>) => {
      void navigate({
        search: (prev) => {
          const merged = { ...prev, ...patch };
          if (!("page" in patch)) {
            merged.page = 1;
          }
          return taskQuerySchema.parse(merged);
        },
        replace: true,
      });
    },
    [navigate],
  );

  const listQuery = useMemo(
    (): TaskQueryParams => ({
      ...params,
      trashOnly: false,
    }),
    [params],
  );

  const {
    tasks: apiTasks,
    meta,
    isLoading: listLoading,
    isError: listError,
    refetch: refetchTasks,
  } = useTasks(listQuery);
  const { tags } = useTags();
  const {
    stats: statsData,
    isError: statsError,
    refetch: refetchStats,
    isLoading: statsLoading,
  } = useStats();

  const createMut = useCreateTask();
  const toggleMut = useToggleTask();
  const deleteMut = useDeleteTask();
  const reorderMut = useReorderTasks();

  const reorderEnabled = useMemo(
    () =>
      params.sort === "manual" &&
      !listLoading &&
      meta != null &&
      meta.limit > 0 &&
      Math.ceil(meta.total / meta.limit) <= 1 &&
      apiTasks.length > 0,
    [apiTasks.length, listLoading, meta, params.sort],
  );

  const {
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    activeId,
    items: orderedApiTasks,
  } = useDragReorder({
    items: apiTasks,
    enabled: reorderEnabled,
    onReorder: () => {},
    persistOrder: async (ids) => {
      try {
        await reorderMut.mutateAsync(ids);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not reorder");
        throw err;
      }
    },
  });

  const displayedApiTasks = reorderEnabled ? orderedApiTasks : apiTasks;

  const tasks = useMemo<Task[]>(
    () => displayedApiTasks.map(apiTaskToDashboardTask),
    [displayedApiTasks],
  );

  const taskById = useMemo(() => {
    const m = new Map<string, ApiTaskRow>();
    for (const t of displayedApiTasks) m.set(t.id, t);
    return m;
  }, [displayedApiTasks]);

  const stats = useMemo(() => {
    const c = statsData?.counts;
    return {
      total: c?.total ?? 0,
      pending: c?.pending ?? 0,
      progress: c?.inProgress ?? 0,
      done: c?.completed ?? 0,
      overdue: c?.overdue ?? 0,
    };
  }, [statsData]);

  const barCounts = useMemo(
    () =>
      statsData?.counts ?? {
        total: 0,
        dueToday: 0,
        completedDueToday: 0,
        trash: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0,
      },
    [statsData],
  );

  const totalPages = meta && meta.limit > 0 ? Math.max(1, Math.ceil(meta.total / meta.limit)) : 1;
  const currentPage = meta?.page ?? 1;

  const onToggle = (id: string) => {
    toggleMut.mutate(id, {
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not update task");
      },
    });
  };

  const onDelete = (id: string) => {
    deleteMut.mutate(id, {
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not delete task");
      },
    });
  };

  const onQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quick.trim()) return;
    createMut.mutate(
      { title: quick.trim(), subtasks: [], tagIds: [] },
      {
        onSuccess: () => {
          setQuick("");
          toast.success("Task created");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Could not create task");
        },
      },
    );
  };

  const toolbar = (
    <TasksExplorerToolbar
      params={params}
      patch={patchParams}
      tags={tags}
      searchInput={searchInput}
      onSearchInputChange={setSearchInput}
      onOpenNewTask={() => {
        setEditTask(null);
        setDialogOpen(true);
      }}
    />
  );

  return (
    <>
      <DashboardShell
        session={session}
        title="Dashboard"
        subtitle={`Welcome back, ${displayName} — let's clear the deck.`}
        toolbar={toolbar}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 sm:gap-4">
          <StatCard label="Total tasks" value={stats.total} icon={ListTodo} accent />
          <StatCard label="In progress" value={stats.progress} icon={Clock} />
          <StatCard label="Completed" value={stats.done} icon={CheckCircle2} />
          <StatCard label="Overdue" value={stats.overdue} trend="down" icon={AlertCircle} />
        </div>

        <StatsBar counts={barCounts} params={params} patch={patchParams} isLoading={statsLoading} />

        <FocusCard />

        <form
          onSubmit={onQuickAdd}
          className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 focus-within:border-[var(--primary)]/40 focus-within:ring-2 focus-within:ring-[var(--primary)]/20 transition motion-reduce:transition-none motion-reduce:focus-within:ring-1 sm:flex-row sm:items-center sm:gap-3 sm:p-4"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <TaskFlowMark className="size-5 shrink-0 text-primary sm:size-4" aria-hidden />
            <input
              id="quick-add-task-input"
              value={quick}
              onChange={(e) => setQuick(e.target.value)}
              placeholder="Add a task and press Enter..."
              className="min-w-0 flex-1 bg-transparent text-[15px] sm:text-sm placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="min-h-[44px] shrink-0 w-full text-sm font-medium px-4 py-2.5 rounded-xl bg-[var(--primary)] text-primary-foreground hover:brightness-110 transition motion-reduce:transition-none active:scale-[0.97] motion-reduce:active:scale-100 disabled:opacity-50 glow-primary sm:h-auto sm:min-h-0 sm:w-auto sm:py-1.5 sm:text-xs sm:px-3 sm:rounded-lg"
            disabled={!quick.trim() || createMut.isPending}
          >
            Add
          </button>
        </form>

        <div className="space-y-2.5">
          {listError || statsError ? (
            <div className="rounded-2xl border border-destructive/30 bg-card/40 p-8 text-center space-y-3">
              <p className="text-sm text-muted-foreground">Could not load tasks. Try again.</p>
              <button
                type="button"
                onClick={() => {
                  void refetchTasks();
                  void refetchStats();
                }}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--primary)] text-primary-foreground hover:brightness-110 motion-safe:transition"
              >
                Retry
              </button>
            </div>
          ) : listLoading ? (
            <div className="space-y-2.5" aria-busy aria-label="Loading tasks">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={String(i)}
                  className="h-[4.75rem] w-full rounded-2xl border border-border/50 bg-elevated/40"
                />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
              <div className="size-12 mx-auto rounded-2xl bg-elevated grid place-items-center mb-3 motion-safe:animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="size-5 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-medium mb-1">Nothing here yet</h3>
              <p className="text-xs text-muted-foreground max-w-[20rem] mx-auto">
                No tasks match filters or search. Widen filters in the toolbar or add something
                above.
              </p>
            </div>
          ) : reorderEnabled ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={displayedApiTasks.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-2.5">
                  {tasks.map((t, i) => (
                    <SortableTaskCard
                      key={t.id}
                      id={t.id}
                      task={t}
                      listIndex={i}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onEdit={(id) => {
                        const row = taskById.get(id);
                        if (row) {
                          setEditTask(row);
                          setDialogOpen(true);
                        }
                      }}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {activeId ? (
                  <div className="opacity-90">
                    <TaskCard
                      task={tasks.find((t) => t.id === activeId)!}
                      onToggle={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="flex flex-col gap-2.5">
              {tasks.map((t, i) => (
                <StaggerItem key={t.id} index={i}>
                  <TaskCard
                    task={t}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onEdit={(id) => {
                      const row = taskById.get(id);
                      if (row) {
                        setEditTask(row);
                        setDialogOpen(true);
                      }
                    }}
                  />
                </StaggerItem>
              ))}
            </div>
          )}
        </div>

        {meta && meta.total > meta.limit ? (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              aria-label="Previous page"
              disabled={currentPage <= 1 || listLoading}
              onClick={() => patchParams({ page: Math.max(1, currentPage - 1) })}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-elevated disabled:opacity-40 disabled:pointer-events-none transition motion-safe:active:scale-[0.98]"
            >
              <ChevronLeft className="size-4" />
              Previous
            </button>
            <span className="text-xs tabular-nums text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
              <span className="mx-2 text-border">·</span>
              {meta.total} tasks
            </span>
            <button
              type="button"
              aria-label="Next page"
              disabled={currentPage >= totalPages || listLoading}
              onClick={() => patchParams({ page: Math.min(totalPages, currentPage + 1) })}
              className="inline-flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-elevated disabled:opacity-40 disabled:pointer-events-none transition motion-safe:active:scale-[0.98]"
            >
              Next
              <ChevronRight className="size-4" />
            </button>
          </div>
        ) : null}
      </DashboardShell>

      <TaskFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditTask(null);
        }}
        mode={editTask ? "edit" : "create"}
        task={editTask}
      />
    </>
  );
}
