import { createFileRoute } from "@tanstack/react-router";
import { useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { CalendarDays, CheckCircle2, Flame, RefreshCw } from "lucide-react";

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
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/today")({
  component: TodayPage,
});

const baseList: TaskQueryParams = {
  status: [],
  priority: [],
  tag: [],
  sort: "dueDate",
  order: "asc",
  page: 1,
  limit: 80,
  trashOnly: false,
};

function TodayProgressRing({ pct }: { pct: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const dash = c * (1 - pct / 100);
  return (
    <div className="relative flex items-center justify-center size-36 shrink-0">
      <svg className="size-36 -rotate-90" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={r} fill="none" className="stroke-elevated" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          className="stroke-[var(--primary)] transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={dash}
          style={{ filter: "drop-shadow(0 0 10px rgba(255,122,0,0.45))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-bold tabular-nums text-foreground">{pct}%</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">today</div>
      </div>
    </div>
  );
}

function TodayPage() {
  const { session } = authLayoutRouteApi.useRouteContext();
  const displayName = session.user.name?.trim() || session.user.email?.split("@")[0] || "there";

  const todayQ = useMemo(() => ({ ...baseList, due: "today" as const }), []);
  const overdueQ = useMemo(() => ({ ...baseList, due: "overdue" as const }), []);

  const { tasks: todayRaw, isLoading: l1, isError: e1, refetch: r1 } = useTasks(todayQ);
  const { tasks: overdueApi, isLoading: l2, isError: e2, refetch: r2 } = useTasks(overdueQ);
  const { stats } = useStats();
  const toggleMut = useToggleTask();
  const deleteMut = useDeleteTask();

  const todayApi = todayRaw;
  const openDueToday = useMemo(
    () => todayApi.filter((t) => t.status !== "COMPLETED").map(apiTaskToDashboardTask),
    [todayApi],
  );
  const doneDueTodayCount = useMemo(
    () => todayApi.filter((t) => t.status === "COMPLETED").length,
    [todayApi],
  );
  const denom = openDueToday.length + doneDueTodayCount;
  const ringPct = denom <= 0 ? 0 : Math.round((doneDueTodayCount / denom) * 100);

  const overdueTasks = useMemo(() => overdueApi.map(apiTaskToDashboardTask), [overdueApi]);
  const loading = l1 || l2;
  const err = e1 || e2;

  const reduceMotion = useReducedMotion();
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) return;
    if (ringPct < 100) return;
    if (confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    let cancelled = false;
    void import("canvas-confetti").then((confettiMod) => {
      if (cancelled) return;
      confettiMod.default({ particleCount: 110, spread: 68, origin: { y: 0.62 } });
    });
    return () => {
      cancelled = true;
    };
  }, [reduceMotion, ringPct]);

  return (
    <DashboardShell
      session={session}
      title="Today"
      subtitle={`${displayName}, here is what the calendar is asking for.`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Due today"
          value={stats?.counts.dueToday ?? "—"}
          icon={CalendarDays}
          accent
        />
        <StatCard label="Overdue" value={stats?.counts.overdue ?? "—"} trend="down" icon={Flame} />
        <StatCard
          label="Completed (all)"
          value={stats?.counts.completed ?? "—"}
          icon={CheckCircle2}
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row gap-8 items-center">
        <TodayProgressRing pct={ringPct} />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <h2 className="text-lg font-semibold tracking-tight">Momentum ring</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Share of tasks due today already completed. Knock out small wins — ring fills as you
            close items due today.
          </p>
        </div>
      </div>

      {err ? (
        <div className="rounded-2xl border border-destructive/30 bg-card/40 p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Could not load tasks.</p>
          <button
            type="button"
            onClick={() => {
              void r1();
              void r2();
            }}
            className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--primary)] text-primary-foreground hover:brightness-110 transition"
          >
            <RefreshCw className="size-3.5" /> Retry
          </button>
        </div>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight">Due today</h3>
          {!loading && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {openDueToday.length} open
            </span>
          )}
        </div>
        {loading ? (
          <div className="space-y-2.5" aria-busy aria-label="Loading tasks">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={String(i)}
                className="h-[4.75rem] w-full rounded-2xl border border-border/50 bg-elevated/40"
              />
            ))}
          </div>
        ) : openDueToday.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center text-sm text-muted-foreground">
            Nothing due today. Check Upcoming or add a task with a due date.
          </div>
        ) : (
          <div className="space-y-2.5">
            {openDueToday.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onToggle={(id) => toggleMut.mutate(id, { onError: (e) => toast.error(String(e)) })}
                onDelete={(id) => deleteMut.mutate(id, { onError: (e) => toast.error(String(e)) })}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-[var(--destructive)]">
            Overdue
          </h3>
          {!loading && (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {overdueTasks.length}
            </span>
          )}
        </div>
        {loading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton
                key={String(i)}
                className="h-[4.75rem] w-full rounded-2xl border border-border/50 bg-elevated/40"
              />
            ))}
          </div>
        ) : overdueTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground">No overdue tasks. Nice discipline.</p>
        ) : (
          <div className="space-y-2.5">
            {overdueTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onToggle={(id) => toggleMut.mutate(id, { onError: (e) => toast.error(String(e)) })}
                onDelete={(id) => deleteMut.mutate(id, { onError: (e) => toast.error(String(e)) })}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
