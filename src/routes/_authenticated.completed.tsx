import { createFileRoute } from "@tanstack/react-router";
import { endOfWeek, format, isWithinInterval, parseISO, startOfWeek } from "date-fns";
import { useMemo, useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaskCard } from "@/components/dashboard/TaskCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useBulkSoftDeleteCompleted, useDeleteTask, useToggleTask } from "@/hooks/useTaskMutations";
import { useStats } from "@/hooks/useStats";
import { useTasks } from "@/hooks/useTasks";
import { authLayoutRouteApi } from "@/lib/auth-layout-route-api";
import { apiTaskToDashboardTask } from "@/lib/task-mapper";
import type { TaskQueryParams } from "@/lib/validations/task-query.schema";
import type { ApiTaskRow } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/completed")({
  component: CompletedPage,
});

const q: TaskQueryParams = {
  status: ["COMPLETED"],
  priority: [],
  tag: [],
  sort: "updatedAt",
  order: "desc",
  page: 1,
  limit: 200,
  trashOnly: false,
};

function bucketFor(row: ApiTaskRow, now: Date): string {
  const u = parseISO(row.updatedAt);
  const thisStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisEnd = endOfWeek(now, { weekStartsOn: 1 });
  const lastStart = startOfWeek(new Date(now.getTime() - 7 * 86400000), { weekStartsOn: 1 });
  const lastEnd = endOfWeek(new Date(now.getTime() - 7 * 86400000), { weekStartsOn: 1 });
  if (isWithinInterval(u, { start: thisStart, end: thisEnd })) return "This week";
  if (isWithinInterval(u, { start: lastStart, end: lastEnd })) return "Last week";
  return "Earlier";
}

function CompletedPage() {
  const { session } = authLayoutRouteApi.useRouteContext();
  const { tasks: api, isLoading, isError, refetch } = useTasks(q);
  const { stats } = useStats();
  const toggleMut = useToggleTask();
  const deleteMut = useDeleteTask();
  const bulkClear = useBulkSoftDeleteCompleted();
  const [confirmClear, setConfirmClear] = useState(false);

  const sections = useMemo(() => {
    const now = new Date();
    const order = ["This week", "Last week", "Earlier"] as const;
    const m = new Map<string, ReturnType<typeof apiTaskToDashboardTask>[]>();
    for (const label of order) m.set(label, []);
    for (const row of api) {
      const b = bucketFor(row, now);
      m.get(b)?.push(apiTaskToDashboardTask(row));
    }
    return order.map((title) => ({ title, tasks: m.get(title) ?? [] }));
  }, [api]);

  return (
    <DashboardShell
      session={session}
      title="Completed"
      subtitle="Archive of wins — grouped by when you closed them."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          <StatCard
            label="Total completed"
            value={stats?.counts.completed ?? "—"}
            icon={CheckCircle2}
            accent
          />
          <StatCard label="In trash" value={stats?.counts.trash ?? "—"} icon={CheckCircle2} />
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl border-border shrink-0"
          onClick={() => setConfirmClear(true)}
          disabled={bulkClear.isPending || (stats?.counts.completed ?? 0) === 0}
        >
          Clear completed
        </Button>
      </div>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent className="sm:rounded-2xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all completed?</AlertDialogTitle>
            <AlertDialogDescription>
              Moves every completed task to trash. You can restore from Trash later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-[var(--destructive)] text-destructive-foreground"
              onClick={() => {
                bulkClear.mutate(undefined, {
                  onSuccess: (data) => {
                    toast.success(`Moved ${data.count} tasks to trash`);
                    setConfirmClear(false);
                  },
                  onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
                });
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-card/40 p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Could not load completed tasks.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--primary)] text-primary-foreground hover:brightness-110 transition"
          >
            <RefreshCw className="size-3.5" /> Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-10" aria-busy aria-label="Loading completed tasks">
          {Array.from({ length: 2 }).map((_, g) => (
            <div key={String(g)} className="space-y-3">
              <Skeleton className="h-5 w-28 rounded-md" />
              {Array.from({ length: 3 }).map((__, i) => (
                <Skeleton
                  key={String(i)}
                  className="h-[4.75rem] w-full rounded-2xl border border-border/50 bg-elevated/40"
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {sections.map(
            (sec) =>
              sec.tasks.length > 0 && (
                <section key={sec.title} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold tracking-tight">{sec.title}</h3>
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[11px] text-muted-foreground">{sec.tasks.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {sec.tasks.map((t) => (
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
              ),
          )}
        </div>
      )}
    </DashboardShell>
  );
}
