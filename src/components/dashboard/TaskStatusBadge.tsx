"use client";

import { Badge } from "@/components/ui/badge";
import type { Task } from "@/lib/mock-tasks";
import { cn } from "@/lib/utils";

import { TASK_STATUS_LABEL } from "./task-status.styles";

export type TaskStatusValue = Task["status"];

export function TaskStatusBadge({
  status,
  className,
}: {
  status: TaskStatusValue;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md border px-2 py-0 text-[11px] font-semibold tabular-nums shadow-none whitespace-nowrap",
        status === "PENDING" && "border-sky-400/40 bg-sky-500/[0.12] text-sky-200 border",
        status === "IN_PROGRESS" &&
          "border-[var(--primary)]/45 bg-[var(--primary)]/14 text-[var(--primary)] border",
        status === "COMPLETED" &&
          "border-[color-mix(in_oklch,var(--success)_48%,transparent)] bg-[color-mix(in_oklch,var(--success)_12%,transparent)] text-[color-mix(in_oklch,var(--success)_92%,white)] border",
        className,
      )}
      aria-label={`Status: ${TASK_STATUS_LABEL[status]}`}
    >
      {TASK_STATUS_LABEL[status]}
    </Badge>
  );
}
