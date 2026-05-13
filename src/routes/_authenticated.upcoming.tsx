import { createFileRoute } from "@tanstack/react-router";
import { format, isSameDay, parseISO, startOfDay } from "date-fns";
import { useMemo } from "react";
import { CalendarRange, RefreshCw } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaskCard } from "@/components/dashboard/TaskCard";
import { useDeleteTask, useToggleTask } from "@/hooks/useTaskMutations";
import { useStats } from "@/hooks/useStats";
import { useTasks } from "@/hooks/useTasks";
import { authLayoutRouteApi } from "@/lib/auth-layout-route-api";
import { apiTaskToDashboardTask } from "@/lib/task-mapper";
import type { TaskQueryParams } from "@/lib/validations/task-query.schema";
import type { ApiTaskRow } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/upcoming")({
  component: UpcomingPage,
});

const q: TaskQueryParams = {
  status: [],
  priority: [],
  tag: [],
  due: "thisWeek",
  sort: "dueDate",
  order: "asc",
  page: 1,
  limit: 120,
  trashOnly: false,
};

function labelForDay(d: Date, now: Date): string {
  if (isSameDay(d, now)) return "Today";
  const tmr = new Date(now);
  tmr.setDate(tmr.getDate() + 1);
  if (isSameDay(d, tmr)) return "Tomorrow";
  return format(d, "EEE · MMM d");
}

function groupByDay(
  rows: ApiTaskRow[],
): Array<{ key: string; label: string; tasks: ReturnType<typeof apiTaskToDashboardTask>[] }> {
  const now = startOfDay(new Date());
  const buckets = new Map<
    string,
    { sort: number; label: string; tasks: ReturnType<typeof apiTaskToDashboardTask>[] }
  >();
  for (const row of rows) {
    if (row.status === "COMPLETED" || !row.dueDate) continue;
    const d = startOfDay(parseISO(row.dueDate));
    const key = format(d, "yyyy-MM-dd");
    const label = labelForDay(d, now);
    const b = buckets.get(key) ?? { sort: d.getTime(), label, tasks: [] };
    b.tasks.push(apiTaskToDashboardTask(row));
    buckets.set(key, b);
  }
  return [...buckets.entries()]
    .map(([key, v]) => ({ key, sort: v.sort, label: v.label, tasks: v.tasks }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ key, label, tasks }) => ({ key, label, tasks }));
}

function UpcomingPage() {
  const { session } = authLayoutRouteApi.useRouteContext();
  const { tasks: api, isLoading, isError, refetch } = useTasks(q);
  const { stats } = useStats();
  const toggleMut = useToggleTask();
  const deleteMut = useDeleteTask();

  const grouped = useMemo(() => groupByDay(api), [api]);
  const openCount = useMemo(
    () => api.filter((t) => t.status !== "COMPLETED" && t.dueDate).length,
    [api],
  );

  return (
    <DashboardShell
      session={session}
      title="Upcoming"
      subtitle="This week on your calendar — grouped by day."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard label="Open this week" value={openCount} icon={CalendarRange} accent />
        <StatCard label="Due today" value={stats?.counts.dueToday ?? "—"} icon={CalendarRange} />
      </div>

      {isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-card/40 p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Could not load upcoming tasks.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--primary)] text-primary-foreground hover:brightness-110 transition"
          >
            <RefreshCw className="size-3.5" /> Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-6" aria-busy aria-label="Loading upcoming tasks">
          {Array.from({ length: 3 }).map((_, g) => (
            <div key={String(g)} className="space-y-2.5">
              <Skeleton className="h-5 w-32 rounded-md" />
              {Array.from({ length: 2 }).map((__, i) => (
                <Skeleton
                  key={String(i)}
                  className="h-[4.75rem] w-full rounded-2xl border border-border/50 bg-elevated/40"
                />
              ))}
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center text-sm text-muted-foreground">
          No incomplete tasks with due dates in the next week.
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((g) => (
            <section key={g.key} className="space-y-3">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold tracking-tight">{g.label}</h3>
                <span className="h-px flex-1 bg-border" />
                <span className="text-[11px] text-muted-foreground tabular-nums">
                  {g.tasks.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {g.tasks.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onToggle={(id) =>
                      toggleMut.mutate(id, { onError: (e) => toast.error(String(e)) })
                    }
                    onDelete={(id) =>
                      deleteMut.mutate(id, { onError: (e) => toast.error(String(e)) })
                    }
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
