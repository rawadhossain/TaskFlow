"use client";

import { useId } from "react";
import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStats } from "@/hooks/useStats";

export function MobileMomentumStrip() {
  const gradId = useId().replace(/:/g, "");
  const { stats, isLoading, isError, refetch } = useStats();

  const doneToday = stats?.counts.completedDueToday ?? 0;
  const dueTodayTotal = stats?.counts.dueToday ?? 0;
  const streak = stats?.streak.current ?? 0;

  const r = 20;
  const circumference = 2 * Math.PI * r;
  const pct = dueTodayTotal <= 0 ? 0 : (doneToday / dueTodayTotal) * 100;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="rounded-2xl border border-border/80 bg-card/55 backdrop-blur-sm px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative size-11 shrink-0">
          <svg viewBox="0 0 48 48" className="size-full -rotate-90" aria-hidden>
            <circle cx="24" cy="24" r={r} fill="none" stroke="var(--elevated)" strokeWidth="5" />
            <circle
              cx="24"
              cy="24"
              r={r}
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={isLoading ? circumference : offset}
              className={
                isLoading
                  ? "opacity-50"
                  : "motion-safe:transition-[stroke-dashoffset] motion-safe:duration-500"
              }
            />
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.78 0.17 50)" />
                <stop offset="100%" stopColor="oklch(0.65 0.21 38)" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold tabular-nums leading-none">
            {isLoading ? "…" : `${doneToday}/${dueTodayTotal}`}
          </span>
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Today&apos;s progress
          </div>
          {isError ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] text-primary hover:text-primary"
              onClick={() => void refetch()}
            >
              Could not load — retry
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-foreground">Momentum</span>
              <span
                className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                aria-live="polite"
              >
                <Flame className="size-3 shrink-0" aria-hidden />
                {streak > 0 ? `${streak} day streak` : "Build a streak"}
              </span>
            </div>
          )}
        </div>

        <Link
          to="/today"
          className="shrink-0 rounded-xl border border-border bg-elevated/60 px-2.5 py-1.5 text-[11px] font-semibold text-foreground hover:border-primary/40 hover:bg-elevated transition"
        >
          Today
        </Link>
      </div>
    </div>
  );
}
