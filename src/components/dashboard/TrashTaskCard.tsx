"use client";

import { useState } from "react";
import { ArchiveRestore, Trash2, AlertCircle, Calendar } from "lucide-react";

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
import { TaskStatusBadge } from "@/components/dashboard/TaskStatusBadge";
import type { Task } from "@/lib/mock-tasks";
import { formatDue, relativeTime } from "@/lib/mock-tasks";
import { cn } from "@/lib/utils";

const priorityColor: Record<Task["priority"], string> = {
  LOW: "var(--success)",
  MEDIUM: "var(--warning)",
  HIGH: "var(--destructive)",
};

interface Props {
  task: Task;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export function TrashTaskCard({ task, onRestore, onPermanentDelete }: Props) {
  const [hover, setHover] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const due = formatDue(task.dueDate);

  return (
    <>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={cn(
          "group relative flex items-start gap-4 rounded-2xl border border-border bg-card/80 p-4 pl-5 transition-all",
          "hover:border-[var(--primary)]/25 hover:shadow-[var(--shadow-card)]",
        )}
      >
        <div
          className="mt-0.5 size-5 rounded-full border-2 border-dashed border-muted-foreground/40 shrink-0"
          aria-hidden
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span
              className="mt-1.5 size-2 rounded-full shrink-0 opacity-70"
              style={{ backgroundColor: priorityColor[task.priority] }}
              aria-label={`Priority ${task.priority}`}
            />
            <h3 className="text-sm font-medium leading-snug text-muted-foreground line-through decoration-muted-foreground/60">
              {task.title}
            </h3>
          </div>

          <div className="mt-3 ml-4 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-muted-foreground">
              Deleted · {relativeTime(task.deletedAt ?? task.createdAt)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <TaskStatusBadge status={task.status} />
          <div
            className={cn(
              "inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md border text-muted-foreground border-border bg-elevated/50",
            )}
          >
            <Calendar className="size-3" />
            {due.label}
          </div>

          <div
            className={cn(
              "flex items-center gap-1 transition-opacity",
              hover ? "opacity-100" : "opacity-0",
            )}
          >
            <button
              type="button"
              aria-label="Restore task"
              onClick={() => onRestore(task.id)}
              className="size-8 grid place-items-center rounded-lg text-muted-foreground hover:text-[var(--success)] hover:bg-[var(--success)]/10"
            >
              <ArchiveRestore className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Delete permanently"
              onClick={() => setConfirmOpen(true)}
              className="size-8 grid place-items-center rounded-lg text-muted-foreground hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="sm:rounded-2xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-base">
              <AlertCircle className="size-4 text-[var(--destructive)]" />
              Delete forever?
            </AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{task.title}&quot; will be permanently removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-[var(--destructive)] text-destructive-foreground hover:brightness-110"
              onClick={() => {
                onPermanentDelete(task.id);
                setConfirmOpen(false);
              }}
            >
              Delete permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
