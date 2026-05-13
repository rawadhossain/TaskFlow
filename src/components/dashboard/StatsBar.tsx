"use client";

import {
  AlarmClock,
  CheckCircle2,
  CircleDot,
  Layers,
  ListTodo,
  type LucideIcon,
} from "lucide-react";

import type { StatsData } from "@/types";
import { TaskStatus as TaskStatusEnum } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";
import type { TaskQueryParams } from "@/lib/validations/task-query.schema";

type ChipId = "total" | "pending" | "progress" | "completed" | "overdue";

const chips: {
  id: ChipId;
  label: string;
  icon: LucideIcon;
  countKey: keyof StatsData["counts"];
  patch: Partial<TaskQueryParams>;
}[] = [
  {
    id: "total",
    label: "Total",
    icon: Layers,
    countKey: "total",
    patch: { status: [], due: undefined, page: 1 },
  },
  {
    id: "pending",
    label: "Pending",
    icon: CircleDot,
    countKey: "pending",
    patch: {
      status: [TaskStatusEnum.PENDING],
      due: undefined,
      page: 1,
    },
  },
  {
    id: "progress",
    label: "In progress",
    icon: AlarmClock,
    countKey: "inProgress",
    patch: {
      status: [TaskStatusEnum.IN_PROGRESS],
      due: undefined,
      page: 1,
    },
  },
  {
    id: "completed",
    label: "Completed",
    icon: CheckCircle2,
    countKey: "completed",
    patch: {
      status: [TaskStatusEnum.COMPLETED],
      due: undefined,
      page: 1,
    },
  },
  {
    id: "overdue",
    label: "Overdue",
    icon: ListTodo,
    countKey: "overdue",
    patch: { status: [], due: "overdue", page: 1 },
  },
];

function chipActive(chip: ChipId, params: TaskQueryParams): boolean {
  switch (chip) {
    case "total":
      return params.status.length === 0 && params.due === undefined;
    case "pending":
      return (
        params.status.length === 1 &&
        params.status[0] === TaskStatusEnum.PENDING &&
        params.due === undefined
      );
    case "progress":
      return (
        params.status.length === 1 &&
        params.status[0] === TaskStatusEnum.IN_PROGRESS &&
        params.due === undefined
      );
    case "completed":
      return (
        params.status.length === 1 &&
        params.status[0] === TaskStatusEnum.COMPLETED &&
        params.due === undefined
      );
    case "overdue":
      return params.due === "overdue" && params.status.length === 0;
    default:
      return false;
  }
}

type Props = {
  counts: StatsData["counts"];
  params: TaskQueryParams;
  patch: (partial: Partial<TaskQueryParams>) => void;
  isLoading?: boolean;
};

export function StatsBar({ counts, params, patch, isLoading }: Props) {
  return (
    <div role="toolbar" aria-label="Quick stats filters" className="-mx-1 px-1 sm:mx-0 sm:px-0">
      <div className="flex gap-2 overflow-x-auto pb-1.5 snap-x snap-mandatory rounded-2xl border border-border bg-card/60 px-3 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-x-visible sm:pb-3 sm:snap-none sm:px-4">
        {chips.map((c) => {
          const active = chipActive(c.id, params);
          const Icon = c.icon;
          const raw = counts[c.countKey];

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => patch(c.patch)}
              className={cn(
                "snap-start shrink-0 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-[13px] font-medium transition motion-reduce:transition-none",
                "hover:bg-elevated/80 motion-safe:active:scale-[0.99] motion-reduce:active:scale-100",
                active
                  ? "border-[var(--primary)]/40 bg-[var(--primary)]/12 text-[var(--primary)] shadow-[inset_0_0_0_1px_rgba(255,122,0,0.12)]"
                  : "border-border bg-elevated/40 text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
              <span className="whitespace-nowrap">{c.label}</span>
              <span
                className={cn(
                  "tabular-nums rounded-md px-2 py-0.5 text-[11px]",
                  active
                    ? "bg-[var(--primary)]/18 text-[var(--primary)]"
                    : "bg-elevated/80 text-muted-foreground",
                )}
              >
                {isLoading ? "…" : raw}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
