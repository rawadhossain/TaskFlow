import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatCard } from "@/components/dashboard/StatCard";
import { TrashTaskCard } from "@/components/dashboard/TrashTaskCard";
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
import {
  useBulkPermanentDeleteTrash,
  usePermanentDeleteTask,
  useRestoreTask,
} from "@/hooks/useTaskMutations";
import { useStats } from "@/hooks/useStats";
import { useTasks } from "@/hooks/useTasks";
import { authLayoutRouteApi } from "@/lib/auth-layout-route-api";
import { apiTaskToDashboardTask } from "@/lib/task-mapper";
import type { TaskQueryParams } from "@/lib/validations/task-query.schema";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/trash")({
  component: TrashPage,
});

const q: TaskQueryParams = {
  status: [],
  priority: [],
  tag: [],
  sort: "deletedAt",
  order: "desc",
  page: 1,
  limit: 150,
  trashOnly: true,
};

function TrashPage() {
  const { session } = authLayoutRouteApi.useRouteContext();
  const { tasks: api, isLoading, isError, refetch } = useTasks(q);
  const { stats } = useStats();
  const restoreMut = useRestoreTask();
  const permanentMut = usePermanentDeleteTask();
  const emptyTrash = useBulkPermanentDeleteTrash();
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  const tasks = api.map(apiTaskToDashboardTask);

  return (
    <DashboardShell
      session={session}
      title="Trash"
      subtitle="Empty trash to purge taskspermanently."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatCard label="In trash" value={stats?.counts.trash ?? "—"} icon={Trash2} accent />
        <Button
          type="button"
          variant="outline"
          className="rounded-xl border-destructive/40 text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
          disabled={emptyTrash.isPending || tasks.length === 0}
          onClick={() => setConfirmEmpty(true)}
        >
          Empty trash
        </Button>
      </div>

      <AlertDialog open={confirmEmpty} onOpenChange={setConfirmEmpty}>
        <AlertDialogContent className="sm:rounded-2xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Empty trash permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              Deletes every task in trash forever. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-[var(--destructive)] text-destructive-foreground"
              onClick={() => {
                emptyTrash.mutate(undefined, {
                  onSuccess: (data) => {
                    toast.success(`Removed ${data.count} tasks`);
                    setConfirmEmpty(false);
                  },
                  onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
                });
              }}
            >
              Empty trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-card/40 p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Could not load trash.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--primary)] text-primary-foreground hover:brightness-110 transition"
          >
            <RefreshCw className="size-3.5" /> Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-2.5" aria-busy aria-label="Loading trash">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={String(i)}
              className="h-[4.75rem] w-full rounded-2xl border border-border/50 bg-elevated/40"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center text-sm text-muted-foreground">
          Trash is empty.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tasks.map((t) => (
            <TrashTaskCard
              key={t.id}
              task={t}
              onRestore={(id) =>
                restoreMut.mutate(id, {
                  onError: (e) => toast.error(e instanceof Error ? e.message : "Restore failed"),
                })
              }
              onPermanentDelete={(id) =>
                permanentMut.mutate(id, {
                  onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
                })
              }
            />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
