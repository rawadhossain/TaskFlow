export const TASK_STATUS_LABEL = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
} as const;

export const taskQuickFilterSelectedClasses = {
  All: "border-[var(--primary)]/45 bg-[var(--primary)]/14 text-[var(--primary)] ring-2 ring-[var(--primary)]/12 shadow-[inset_0_0_0_1px_rgba(255,122,0,0.08)]",
  Pending:
    "border-sky-400/55 bg-sky-500/[0.16] text-sky-300 ring-2 ring-sky-500/14 shadow-[inset_0_0_0_1px_oklch(0.72_0.12_250/0.12)]",
  "In progress":
    "border-[var(--primary)]/50 bg-[var(--primary)]/16 text-[var(--primary)] ring-2 ring-[var(--primary)]/12 shadow-[inset_0_0_0_1px_rgba(255,122,0,0.1)]",
  Completed:
    "border-[color-mix(in_oklch,var(--success)_50%,transparent)] bg-[color-mix(in_oklch,var(--success)_14%,transparent)] text-[color-mix(in_oklch,var(--success)_94%,white)] ring-2 ring-[color-mix(in_oklch,var(--success)_18%,transparent)] shadow-[inset_0_0_0_1px_oklch(0.75_0.12_155/0.12)]",
  Overdue:
    "border-[color-mix(in_oklch,var(--destructive)_52%,transparent)] bg-[color-mix(in_oklch,var(--destructive)_14%,transparent)] text-[color-mix(in_oklch,var(--destructive)_90%,white)] ring-2 ring-[color-mix(in_oklch,var(--destructive)_18%,transparent)] shadow-[inset_0_0_0_1px_oklch(0.7_0.18_22/0.15)]",
} as const satisfies Record<"All" | "Pending" | "In progress" | "Completed" | "Overdue", string>;

export const taskQuickFilterIdleHintClasses = {
  All: "",
  Pending: "hover:border-sky-500/35 hover:bg-sky-500/[0.07] hover:text-sky-200/95",
  "In progress":
    "hover:border-[var(--primary)]/35 hover:bg-[var(--primary)]/[0.08] hover:text-[var(--primary-glow)]",
  Completed:
    "hover:border-[color-mix(in_oklch,var(--success)_40%,transparent)] hover:bg-[color-mix(in_oklch,var(--success)_08%,transparent)] hover:text-[var(--success)]",
  Overdue:
    "hover:border-[color-mix(in_oklch,var(--destructive)_42%,transparent)] hover:bg-[color-mix(in_oklch,var(--destructive)_08%,transparent)] hover:text-[var(--destructive)]",
} as const satisfies Record<"All" | "Pending" | "In progress" | "Completed" | "Overdue", string>;
