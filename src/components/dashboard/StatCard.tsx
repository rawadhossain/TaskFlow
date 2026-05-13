import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  accent?: boolean;
}

export function StatCard({ label, value, delta, trend = "up", icon: Icon, accent }: StatCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5",
        accent && "bg-gradient-to-br from-[oklch(0.22_0.04_45)] to-[oklch(0.17_0.005_270)]",
      )}
    >
      {accent && (
        <div className="pointer-events-none absolute inset-0 opacity-50 [background:radial-gradient(circle_at_85%_0%,rgba(255,122,0,0.35),transparent_55%)]" />
      )}
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs text-muted-foreground mb-2">{label}</div>
          <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
        </div>
        <div
          className={cn(
            "size-10 rounded-xl grid place-items-center border border-border",
            accent
              ? "bg-[var(--primary)]/15 text-[var(--primary)]"
              : "bg-elevated text-muted-foreground",
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      {delta && delta !== "—" && (
        <div className="relative mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md bg-elevated/60 border border-border">
          <span
            className={cn(
              "size-1.5 rounded-full",
              trend === "up" && "bg-[var(--success)]",
              trend === "down" && "bg-[var(--destructive)]",
              trend === "neutral" && "bg-muted-foreground",
            )}
          />
          <span
            className={cn(
              trend === "up" && "text-[var(--success)]",
              trend === "down" && "text-[var(--destructive)]",
            )}
          >
            {delta}
          </span>
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </div>
  );
}
