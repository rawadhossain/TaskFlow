"use client";

import type { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";
import { Check, GripVertical, Pencil, Trash2, AlertCircle, Calendar } from "lucide-react";
import type { Task } from "@/lib/mock-tasks";
import { formatDue, relativeTime } from "@/lib/mock-tasks";
import { TaskStatusBadge } from "@/components/dashboard/TaskStatusBadge";
import { cn } from "@/lib/utils";

const priorityColor: Record<Task["priority"], string> = {
  LOW: "var(--success)",
  MEDIUM: "var(--warning)",
  HIGH: "var(--destructive)",
};

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  sortable?: {
    setActivatorNodeRef: (element: HTMLElement | null) => void;
    listeners?: DraggableSyntheticListeners;
    attributes: DraggableAttributes;
    isDragging: boolean;
  };
}

export function TaskCard({ task, onToggle, onDelete, onEdit, sortable }: Props) {
  const due = formatDue(task.dueDate);
  const completed = task.status === "COMPLETED";
  const subDone = task.subtasks.filter((s) => s.isCompleted).length;
  const subTotal = task.subtasks.length;
  const subPct = subTotal ? (subDone / subTotal) * 100 : 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-all sm:flex-row sm:items-start sm:gap-4 sm:pl-5",
        "hover:border-[var(--primary)]/30 hover:shadow-[var(--shadow-card)] motion-safe:hover:-translate-y-px",
        completed && "opacity-60",
        due.overdue && !completed && "border-l-[3px] border-l-[var(--destructive)]",
        sortable?.isDragging &&
          "shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-[var(--primary)]/50 scale-[1.02]",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
        {sortable ? (
          <button
            type="button"
            ref={sortable.setActivatorNodeRef}
            aria-label="Drag to reorder"
            className={cn(
              "mt-1 shrink-0 cursor-grab touch-none text-muted-foreground transition-all hover:text-[var(--primary)] active:cursor-grabbing",
              "opacity-65 sm:opacity-0 motion-safe:sm:transition-opacity sm:group-hover:opacity-100",
              sortable.isDragging && "opacity-100 text-[var(--primary)]",
            )}
            {...sortable.listeners}
            {...sortable.attributes}
          >
            <GripVertical
              className={cn(
                "size-[18px] sm:size-4 pointer-events-none motion-safe:transition-transform",
                sortable.isDragging && "scale-110",
              )}
              aria-hidden
            />
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={completed ? "Mark as pending" : "Mark as completed"}
          className={cn(
            "mt-1 size-[22px] shrink-0 rounded-full border-2 grid place-items-center transition-all motion-safe:active:scale-95 sm:size-5",
            completed
              ? "bg-[var(--primary)] border-[var(--primary)] glow-primary"
              : "border-border hover:border-[var(--primary)]",
          )}
        >
          {completed && <Check className="size-3 text-primary-foreground" strokeWidth={3} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <span
              className="mt-2 size-2 shrink-0 rounded-full"
              style={{ backgroundColor: priorityColor[task.priority] }}
              aria-label={`Priority ${task.priority}`}
            />
            <h3
              className={cn(
                "break-words text-sm font-medium leading-snug sm:pr-0",
                completed && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </h3>
          </div>

          {task.description && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 sm:line-clamp-1 ml-5 sm:ml-4">
              {task.description}
            </p>
          )}

          {subTotal > 0 && (
            <div className="mt-3 ml-5 flex flex-wrap items-center gap-2 sm:ml-4">
              <div className="h-1 min-w-[5rem] max-w-full flex-[1_1_8rem] rounded-full bg-elevated overflow-hidden sm:max-w-[180px]">
                <div
                  className={cn(
                    "h-full transition-all",
                    subDone === subTotal ? "bg-[var(--success)]" : "bg-[var(--primary)]",
                  )}
                  style={{ width: `${subPct}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {subDone}/{subTotal}
              </span>
            </div>
          )}

          <div className="mt-3 ml-5 flex flex-wrap items-center gap-2 sm:ml-4">
            {task.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="inline-flex max-w-full items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md border border-border bg-elevated/50"
              >
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="truncate">{tag.name}</span>
              </span>
            ))}
            <span className="text-[11px] text-muted-foreground/70">·</span>
            <span className="text-[11px] text-muted-foreground">
              Created {relativeTime(task.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-row flex-wrap items-center justify-between gap-3 border-t border-border/55 pt-3 sm:w-auto sm:flex-col sm:items-end sm:justify-start sm:border-t-0 sm:pt-0">
        <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
          <div
            className={cn(
              "inline-flex min-h-[32px] items-center gap-1.5 px-2 py-1 text-[11px] rounded-md border",
              due.overdue && !completed
                ? "border-[var(--destructive)]/30 bg-[var(--destructive)]/10 text-[var(--destructive)]"
                : "border-border bg-elevated/50 text-muted-foreground",
            )}
          >
            {due.overdue && !completed ? (
              <AlertCircle className="size-3 shrink-0" />
            ) : (
              <Calendar className="size-3 shrink-0" />
            )}
            <span className="max-w-[10rem] truncate sm:max-w-none">{due.label}</span>
          </div>
          <TaskStatusBadge status={task.status} />
        </div>

        <div
          className={cn(
            "flex items-center gap-0.5 rounded-lg border border-border/40 bg-elevated/30 p-0.5 motion-safe:transition-opacity",
            "opacity-100 sm:opacity-0 sm:border-transparent sm:bg-transparent sm:p-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100",
          )}
        >
          <button
            type="button"
            aria-label="Edit task"
            onClick={() => onEdit?.(task.id)}
            className="min-h-10 min-w-10 grid place-items-center rounded-md text-muted-foreground hover:bg-elevated hover:text-foreground sm:min-h-0 sm:min-w-0 sm:size-8"
          >
            <Pencil className="size-4 sm:size-3.5" />
          </button>
          <button
            type="button"
            aria-label="Delete task"
            onClick={() => onDelete(task.id)}
            className="min-h-10 min-w-10 grid place-items-center rounded-md text-muted-foreground hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] sm:min-h-0 sm:min-w-0 sm:size-8"
          >
            <Trash2 className="size-4 sm:size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
