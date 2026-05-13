"use client";

import { format, parseISO } from "date-fns";
import { useMemo, useRef, useState } from "react";

import type { StatsData } from "@/types";
import { cn } from "@/lib/utils";

export function WeeklySparkline({
  week,
  showHeader = true,
}: {
  week: StatsData["weeklyCompletions"];
  /** Hide title / summary row when embedding inside another card. */
  showHeader?: boolean;
}) {
  const [tip, setTip] = useState<{ x: number; y: number; label: string } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const normalized = useMemo(() => week.map((d) => ({ ...d })), [week]);
  const max = useMemo(() => Math.max(1, ...normalized.map((d) => d.count)), [normalized]);
  const weekSum = useMemo(() => normalized.reduce((s, d) => s + d.count, 0), [normalized]);

  return (
    <div className="space-y-3">
      {showHeader ? (
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Last 7 days</h3>
            <div className="text-[11px] text-muted-foreground tabular-nums">
              {weekSum} completions logged
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-muted-foreground tabular-nums">
          {weekSum} completions in last 7 days
        </div>
      )}

      <div
        ref={wrapRef}
        className="relative flex items-end gap-1.5 h-[5.25rem] px-0.5"
        onMouseLeave={() => setTip(null)}
      >
        {normalized.map((d, i) => {
          const h = `${Math.max(8, (d.count / max) * 100)}%`;
          const dayShort = format(parseISO(d.date), "EEE");
          const line = `${dayShort} · ${d.count}`;
          const isTodayRow = i === normalized.length - 1;

          return (
            <div
              key={d.date}
              className="relative flex flex-1 flex-col items-center justify-end gap-1.5 h-full group"
            >
              <button
                type="button"
                aria-label={`${dayShort}: ${d.count} completed`}
                className={cn(
                  "relative w-full min-h-[6px] max-h-full rounded-md transition-colors motion-safe:transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isTodayRow
                    ? "bg-[var(--primary)] glow-primary"
                    : "bg-elevated group-hover:bg-elevated/90",
                )}
                style={{ height: h }}
                onMouseEnter={(e) => {
                  const r = wrapRef.current?.getBoundingClientRect();
                  const bx = e.currentTarget.getBoundingClientRect();
                  if (!r) return;
                  setTip({
                    x: bx.left - r.left + bx.width / 2,
                    y: bx.top - r.top - 8,
                    label: `${format(parseISO(d.date), "EEEE")} — ${d.count} task${d.count === 1 ? "" : "s"}`,
                  });
                }}
                onFocus={(e) => {
                  const r = wrapRef.current?.getBoundingClientRect();
                  const bx = e.currentTarget.getBoundingClientRect();
                  if (!r) return;
                  setTip({
                    x: bx.left - r.left + bx.width / 2,
                    y: bx.top - r.top - 8,
                    label: `${format(parseISO(d.date), "EEEE")} — ${d.count} task${d.count === 1 ? "" : "s"}`,
                  });
                }}
                onBlur={() => setTip(null)}
              />
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  isTodayRow ? "text-[var(--primary)] font-medium" : "text-muted-foreground",
                )}
              >
                {dayShort}
              </span>
              <span className="sr-only">{line}</span>
            </div>
          );
        })}

        {tip ? (
          <div
            role="tooltip"
            className="pointer-events-none absolute z-10 rounded-lg border border-border bg-card px-2 py-1 text-[11px] text-foreground shadow-md -translate-x-1/2 -translate-y-full whitespace-nowrap"
            style={{ left: tip.x, top: tip.y }}
          >
            {tip.label}
          </div>
        ) : null}
      </div>
    </div>
  );
}
