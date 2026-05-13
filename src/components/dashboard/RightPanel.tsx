"use client";

import { Link } from "@tanstack/react-router";
import { Calendar, CheckCircle2, Clock, Flame, Plus } from "lucide-react";

import { WeeklySparkline } from "@/components/dashboard/WeeklySparkline";
import { TaskStatus as TaskStatusEnum } from "@/generated/prisma/enums";
import { useStats } from "@/hooks/useStats";
import { taskQuerySchema } from "@/lib/validations/task-query.schema";

export function RightPanel() {
  const { stats, isLoading, isError, refetch } = useStats();

  const circumference = 2 * Math.PI * 42;

  const doneToday = stats?.counts.completedDueToday ?? 0;
  const dueTodayTotal = stats?.counts.dueToday ?? 0;
  const pct = dueTodayTotal <= 0 ? 0 : (doneToday / dueTodayTotal) * 100;
  const offset = circumference - (pct / 100) * circumference;

  const streak = stats?.streak.current ?? 0;
  const week = stats?.weeklyCompletions ?? [];

  return (
    <aside className="hidden xl:flex flex-col min-h-0 max-h-[100dvh] w-[340px] shrink-0 gap-4 overflow-y-auto overscroll-contain border-l border-border bg-sidebar/50 p-5">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
        <div className="absolute inset-0 opacity-50 pointer-events-none [background:radial-gradient(circle_at_50%_0%,rgba(255,122,0,0.18),transparent_60%)]" />
        <div className="relative flex items-center gap-5">
          <div className="relative size-[110px] shrink-0">
            <svg
              viewBox="0 0 100 100"
              className="size-full -rotate-90 motion-reduce:transition-none"
            >
              <circle cx="50" cy="50" r="42" fill="none" stroke="var(--elevated)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#ringGradRight)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={isLoading ? circumference : offset}
                className={
                  isLoading
                    ? "opacity-60"
                    : "motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500"
                }
              />
              <defs>
                <linearGradient id="ringGradRight" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.17 50)" />
                  <stop offset="100%" stopColor="oklch(0.65 0.21 38)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="text-xl font-semibold tabular-nums">
                  {isLoading ? "—" : `${doneToday}/${dueTodayTotal}`}
                </div>
                <div className="text-[10px] text-muted-foreground">due today done</div>
              </div>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground mb-1">Today&apos;s progress</div>
            <div className="text-base font-semibold mb-2">Momentum</div>
            {isError ? (
              <button
                type="button"
                onClick={() => void refetch()}
                className="text-[11px] text-[var(--primary)] hover:underline"
              >
                Could not load — retry
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)]">
                <Flame className="size-3" />
                {streak > 0 ? `${streak} day streak` : "Lets grind"}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Shortcuts</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Link
            to="/tasks"
            search={taskQuerySchema.parse({
              trashOnly: false,
            })}
            className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border border-border bg-elevated/50 hover:bg-elevated hover:border-[var(--primary)]/30 transition motion-reduce:transition-none text-center text-foreground"
          >
            <Plus className="size-4 text-[var(--primary)]" aria-hidden />
            <span className="text-[11px] font-medium">All tasks</span>
          </Link>
          <Link
            to="/today"
            className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border border-border bg-elevated/50 hover:bg-elevated hover:border-[var(--primary)]/30 transition motion-reduce:transition-none text-center text-foreground"
          >
            <Calendar className="size-4 text-[var(--primary)]" aria-hidden />
            <span className="text-[11px] font-medium">Today</span>
          </Link>
          <Link
            to="/tasks"
            search={taskQuerySchema.parse({
              status: [TaskStatusEnum.PENDING],
              trashOnly: false,
              page: 1,
            })}
            className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border border-border bg-elevated/50 hover:bg-elevated hover:border-[var(--primary)]/30 transition motion-reduce:transition-none text-center text-foreground"
          >
            <Clock className="size-4 text-[var(--primary)]" aria-hidden />
            <span className="text-[11px] font-medium">Pending</span>
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        {isError ? (
          <p className="text-xs text-muted-foreground">Weekly chart unavailable.</p>
        ) : (
          <WeeklySparkline week={week} />
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Health</h3>
        </div>
        <ul className="space-y-2 text-[12px] text-muted-foreground">
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="size-3.5 shrink-0 text-[var(--success)]" aria-hidden />
              <span className="truncate">Completed (all time)</span>
            </span>
            <span className="tabular-nums font-medium text-foreground">
              {isLoading ? "—" : stats?.counts.completed}
            </span>
          </li>
          <li className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 min-w-0">
              <Clock className="size-3.5 shrink-0 text-[var(--warning)]" aria-hidden />
              <span className="truncate">Needs attention</span>
            </span>
            <span className="tabular-nums font-medium text-foreground">
              {isLoading ? "—" : stats?.counts.overdue}
            </span>
          </li>
        </ul>
      </div>
    </aside>
  );
}
