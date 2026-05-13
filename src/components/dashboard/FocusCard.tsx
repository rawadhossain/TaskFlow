"use client";

import { Link } from "@tanstack/react-router";
import { ArrowRight, Timer } from "lucide-react";

import { WeeklySparkline } from "@/components/dashboard/WeeklySparkline";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats } from "@/hooks/useStats";
import { cn } from "@/lib/utils";

export function FocusCard() {
  const { stats, isLoading, isError, refetch } = useStats();
  const week = stats?.weeklyCompletions ?? [];
  const streak = stats?.streak.current ?? 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card shadow-sm",
        isError ? "border-destructive/30" : "border-border",
      )}
    >
      <div className="absolute inset-0 pointer-events-none opacity-50 [background:radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,122,0,0.12),transparent)]" />

      <div className="relative p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-elevated/60">
                <Timer className="size-4 text-[var(--primary)]" aria-hidden />
              </span>
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Productivity trends</h3>
                <p className="text-[11px] text-muted-foreground leading-snug max-w-xl">
                  Finish tasks to fill this chart
                </p>
              </div>
            </div>
          </div>

          {!isLoading && !isError ? (
            <div className="text-right shrink-0">
              <div className="text-[11px] text-muted-foreground">Current streak</div>
              <div className="text-lg font-semibold tabular-nums text-foreground">
                {streak > 0 ? `${streak}d` : "—"}
              </div>
            </div>
          ) : null}
        </div>

        {isLoading ? (
          <div className="space-y-3 pt-1" aria-busy aria-label="Loading productivity summary">
            <Skeleton className="h-4 w-40 rounded-md" />
            <div className="flex gap-2 h-[5.25rem] items-end">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton
                  key={String(i)}
                  className="flex-1 rounded-md bg-elevated/60"
                  style={{ height: `${30 + ((i * 23) % 70)}%` }}
                />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-border/80 bg-elevated/30 px-4 py-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Couldn&apos;t load activity for this widget.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => void refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <WeeklySparkline week={week} showHeader={false} />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-border/70">
          <p className="text-[11px] text-muted-foreground">
            Tip: use <span className="text-foreground/90 font-medium">Today</span> to knock out dues
            and grow the streak.
          </p>
          <Link to="/today">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:underline">
              Go to Today
              <ArrowRight className="size-3.5 shrink-0" aria-hidden />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
