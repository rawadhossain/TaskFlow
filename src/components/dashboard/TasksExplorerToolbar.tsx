"use client";

import { useEffect } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  ChevronDown,
  Filter,
  Plus,
  Search,
  ArrowUpDown,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  taskQuickFilterIdleHintClasses,
  taskQuickFilterSelectedClasses,
} from "@/components/dashboard/task-status.styles";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Priority } from "@/generated/prisma/enums";
import { Priority as PriorityEnum, TaskStatus as TaskStatusEnum } from "@/generated/prisma/enums";
import { computeActiveFilterCount } from "@/hooks/useTaskFilters";
import { useSearchShortcutHint } from "@/hooks/useSearchShortcutHint";
import type { TagWithTaskCount } from "@/types";
import { cn } from "@/lib/utils";
import type { TaskQueryParams } from "@/lib/validations/task-query.schema";

type SortKey = TaskQueryParams["sort"];
type DueKey = NonNullable<TaskQueryParams["due"]>;

const PRIORITIES_LIST = [
  PriorityEnum.LOW,
  PriorityEnum.MEDIUM,
  PriorityEnum.HIGH,
] as const satisfies readonly Priority[];
const STATUS_SORT_PRESETS = ["Pending", "In progress", "Completed", "Overdue"] as const;
type QuickStatus = (typeof STATUS_SORT_PRESETS)[number];

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "manual", label: "Manual order" },
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
  { value: "title", label: "Title" },
  { value: "createdAt", label: "Created" },
  { value: "updatedAt", label: "Updated" },
];

const DUE_OPTIONS: { value: DueKey | "any"; label: string }[] = [
  { value: "any", label: "Any due" },
  { value: "today", label: "Due today" },
  { value: "thisWeek", label: "This week" },
  { value: "overdue", label: "Overdue" },
  { value: "noDate", label: "No date" },
];

function quickPillFromParams(params: TaskQueryParams): QuickStatus | "All" | null {
  const { status, due, priority, tag } = params;
  if (priority.length > 0 || tag.length > 0) return null;

  if (due === "overdue" && status.length === 0) return "Overdue";
  if (due !== undefined) return null;

  if (status.length === 0) return "All";
  if (status.length !== 1) return null;

  switch (status[0]) {
    case TaskStatusEnum.PENDING:
      return "Pending";
    case TaskStatusEnum.IN_PROGRESS:
      return "In progress";
    case TaskStatusEnum.COMPLETED:
      return "Completed";
    default:
      return null;
  }
}

function sortLabel(sort: SortKey): string {
  return SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Manual order";
}

type Props = {
  params: TaskQueryParams;
  patch: (patch: Partial<TaskQueryParams>) => void;
  tags: TagWithTaskCount[];
  searchInput: string;
  onSearchInputChange: (v: string) => void;
  onOpenNewTask: () => void;
};

export function TasksExplorerToolbar({
  params,
  patch,
  tags,
  searchInput,
  onSearchInputChange,
  onOpenNewTask,
}: Props) {
  const searchShortcutHint = useSearchShortcutHint();

  useEffect(() => {
    const focusSearch = () => {
      document.getElementById("dashboard-task-search")?.focus({ preventScroll: false });
    };
    window.addEventListener("taskflo:focus-search", focusSearch);
    return () => window.removeEventListener("taskflo:focus-search", focusSearch);
  }, []);

  const pillState = quickPillFromParams(params);
  const activeStructural = computeActiveFilterCount(params);
  const badgeCount = Math.min(99, activeStructural);

  const togglePriority = (p: Priority) => {
    const set = new Set(params.priority);
    if (set.has(p)) set.delete(p);
    else set.add(p);
    patch({ priority: [...set], page: 1 });
  };

  const setDue = (v: DueKey | "any") => {
    if (v === "any") patch({ due: undefined, page: 1 });
    else patch({ due: v, page: 1 });
  };

  const toggleTagId = (id: string) => {
    const set = new Set(params.tag);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    patch({ tag: [...set], page: 1 });
  };

  const applyQuickPreset = (key: QuickStatus | "All") => {
    if (key === "All") patch({ status: [], due: undefined, page: 1 });
    else if (key === "Pending")
      patch({ status: [TaskStatusEnum.PENDING], due: undefined, page: 1 });
    else if (key === "In progress")
      patch({ status: [TaskStatusEnum.IN_PROGRESS], due: undefined, page: 1 });
    else if (key === "Completed")
      patch({ status: [TaskStatusEnum.COMPLETED], due: undefined, page: 1 });
    else patch({ status: [], due: "overdue", page: 1 });
  };

  const clearSearchChip = () => {
    patch({ search: undefined, page: 1 });
    onSearchInputChange("");
  };

  const tagNameFor = (id: string) => tags.find((t) => t.id === id)?.name ?? id.slice(0, 6);

  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  for (const p of params.priority) {
    chips.push({
      key: `p-${p}`,
      label: `Priority: ${p}`,
      onRemove: () => togglePriority(p),
    });
  }
  if (params.tag.length > 0) {
    for (const id of params.tag) {
      chips.push({
        key: `t-${id}`,
        label: tagNameFor(id),
        onRemove: () =>
          patch({
            tag: params.tag.filter((x) => x !== id),
            page: 1,
          }),
      });
    }
  }
  if (params.due !== undefined && !(pillState === "Overdue" && params.due === "overdue")) {
    const label =
      params.due === "today"
        ? "Due: today"
        : params.due === "thisWeek"
          ? "Due: this week"
          : params.due === "overdue"
            ? "Due: overdue"
            : "Due: none";
    chips.push({
      key: `d-${params.due}`,
      label,
      onRemove: () => patch({ due: undefined, page: 1 }),
    });
  }

  const showStatusChip =
    params.status.length >= 2 || (params.status.length === 1 && pillState === null);
  if (showStatusChip) {
    const labels = params.status.map((s) =>
      s === TaskStatusEnum.IN_PROGRESS ? "In progress" : String(s),
    );
    chips.push({
      key: `s-${labels.join(",")}`,
      label: `Status: ${labels.join(", ")}`,
      onRemove: () => patch({ status: [], page: 1 }),
    });
  }

  if ((params.search?.length ?? 0) > 0) {
    chips.push({
      key: `q-${params.search}`,
      label: `“${params.search!.slice(0, 48)}${params.search!.length > 48 ? "…" : ""}”`,
      onRemove: clearSearchChip,
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:flex-wrap xl:overflow-visible xl:pb-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="group h-10 shrink-0 gap-2 rounded-xl border-border bg-card px-3 text-sm shadow-sm transition-all hover:bg-elevated active:scale-[0.985] motion-reduce:transition-none motion-reduce:active:scale-100 sm:px-3.5"
                aria-expanded={undefined}
              >
                <Filter className="size-4 text-muted-foreground transition group-hover:text-[var(--primary)] motion-reduce:transition-none" />
                Filters
                {badgeCount > 0 ? (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-[1.25rem] px-1.5 rounded-md bg-[var(--primary)]/18 text-[10px] font-semibold tabular-nums text-[var(--primary)] ring-1 ring-[var(--primary)]/25"
                  >
                    {badgeCount}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[min(100vw-1.5rem,22rem)] p-0 overflow-hidden rounded-2xl border-border bg-card shadow-xl motion-reduce:animate-none animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="border-b border-border/80 px-4 py-3 bg-elevated/40">
                <div className="text-sm font-semibold tracking-tight">Refine tasks</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">
                  Choices sync to URL so links stay sharable.
                </div>
              </div>
              <ScrollArea className="max-h-[min(72vh,24rem)] overflow-y-auto">
                <div className="space-y-4 p-4 pb-6">
                  <section>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80 mb-2">
                      Priority
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {PRIORITIES_LIST.map((p) => {
                        const on = params.priority.includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => togglePriority(p)}
                            className={cn(
                              "text-xs px-3 py-1.5 rounded-full border transition active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100",
                              on
                                ? "border-[var(--primary)]/45 bg-[var(--primary)]/15 text-[var(--primary)] ring-2 ring-[var(--primary)]/15 shadow-[inset_0_0_0_1px_rgba(255,122,0,0.08)]"
                                : "border-border bg-elevated/40 text-muted-foreground hover:bg-elevated hover:text-foreground",
                            )}
                          >
                            {p.charAt(0)}
                            {p.slice(1).toLowerCase()}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                  <Separator className="bg-border/70" />
                  <section className="space-y-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                      Due
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {DUE_OPTIONS.map(({ value, label }) => {
                        const sel =
                          value === "any" ? params.due === undefined : params.due === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setDue(value)}
                            className={cn(
                              "flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition-colors",
                              sel
                                ? "bg-[var(--primary)]/12 text-[var(--primary)] shadow-[inset_0_0_0_1px_rgba(255,122,0,0.2)]"
                                : "hover:bg-elevated/70 text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full shrink-0",
                                sel ? "bg-[var(--primary)]" : "bg-border",
                              )}
                              aria-hidden
                            />
                            {label}
                            {sel ? (
                              <Check className="size-3.5 ml-auto opacity-90" aria-hidden />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                  {tags.length > 0 ? (
                    <>
                      <Separator className="bg-border/70" />
                      <section className="space-y-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
                          Tags
                        </div>
                        <div className="flex flex-col gap-2">
                          {tags.map((t) => {
                            const on = params.tag.includes(t.id);
                            return (
                              <div
                                key={t.id}
                                className="flex items-center gap-2.5 rounded-xl border border-transparent px-1 py-0.5 transition hover:border-border hover:bg-elevated/40"
                              >
                                <Checkbox
                                  checked={on}
                                  onCheckedChange={() => toggleTagId(t.id)}
                                  className="rounded-md border-border data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)]"
                                  aria-label={t.name}
                                />
                                <span className="flex flex-1 items-center gap-2 text-xs min-w-0">
                                  <span
                                    className="size-2 shrink-0 rounded-full"
                                    style={{ backgroundColor: t.color }}
                                    aria-hidden
                                  />
                                  <span className="truncate">{t.name}</span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    </>
                  ) : null}
                </div>
              </ScrollArea>
              <div className="flex items-center justify-between gap-2 border-t border-border/80 px-3 py-2.5 bg-elevated/30">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-lg text-xs text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    patch({
                      status: [],
                      priority: [],
                      tag: [],
                      due: undefined,
                      search: undefined,
                      page: 1,
                    })
                  }
                >
                  Clear all filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="group h-10 shrink-0 gap-2 rounded-xl border-border bg-card px-3 text-sm shadow-sm transition-all hover:bg-elevated active:scale-[0.985] motion-reduce:active:scale-100 motion-reduce:transition-none sm:px-3.5"
              >
                <ArrowUpDown className="size-4 text-muted-foreground transition group-hover:text-[var(--primary)]" />
                <span className="max-w-[7rem] truncate sm:max-w-[9rem]">
                  {sortLabel(params.sort)}
                </span>
                {params.order === "desc" ? (
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">
                    Desc
                  </span>
                ) : (
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">
                    Asc
                  </span>
                )}
                <ChevronDown className="size-4 text-muted-foreground opacity-70" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-56 rounded-xl border-border bg-card p-1 shadow-xl"
            >
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  className="gap-2 rounded-lg text-sm cursor-pointer"
                  onClick={() => patch({ sort: opt.value, page: 1 })}
                >
                  {sortLabel(opt.value)}
                  {params.sort === opt.value ? (
                    <Check className="size-4 ml-auto text-[var(--primary)]" />
                  ) : null}
                </DropdownMenuItem>
              ))}
              <Separator className="my-1 bg-border/70" />
              <DropdownMenuItem
                className="gap-2 rounded-lg text-sm cursor-pointer"
                disabled={params.sort === "manual"}
                onClick={() => patch({ order: params.order === "asc" ? "desc" : "asc", page: 1 })}
              >
                {params.order === "asc" ? (
                  <>
                    <ArrowDownAZ className="size-4" />
                    Switch to descending
                  </>
                ) : (
                  <>
                    <ArrowUpAZ className="size-4" />
                    Switch to ascending
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            aria-label="Create new task"
            className="h-10 shrink-0 gap-2 rounded-xl bg-[var(--primary)] px-3 text-primary-foreground text-sm font-medium shadow-[0_0_20px_-4px_oklch(0.7_0.15_41)] transition-all hover:brightness-110 active:scale-[0.985] motion-reduce:shadow-none glow-primary motion-reduce:active:scale-100 motion-reduce:transition-none sm:gap-2 sm:px-4"
            onClick={onOpenNewTask}
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">New task</span>
          </Button>
        </div>

        <div className="relative w-full min-w-0 xl:max-w-none xl:flex-initial ml-auto xl:ml-0 sm:max-w-md xl:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground z-[1]" />
          <input
            id="dashboard-task-search"
            type="search"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Search tasks..."
            maxLength={512}
            aria-label="Search tasks"
            aria-keyshortcuts={searchShortcutHint === "⌘K" ? "Meta+K" : "Control+K"}
            title={`Focus shortcut: ${searchShortcutHint}`}
            className="w-full rounded-xl border border-border bg-card py-2 pl-10 pr-4 text-sm shadow-sm outline-none placeholder:text-muted-foreground transition-all focus-visible:border-[var(--primary)]/45 focus-visible:ring-4 focus-visible:ring-[var(--primary)]/12 motion-reduce:transition-none motion-reduce:focus-visible:ring-2 motion-reduce:focus-visible:ring-[var(--primary)]/20 sm:pr-[4.25rem]"
          />
          <kbd
            className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-muted/80 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-muted-foreground shadow-sm sm:inline-block"
            aria-hidden
          >
            {searchShortcutHint}
          </kbd>
        </div>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-x-visible">
        {(["All", ...STATUS_SORT_PRESETS] as const).map((f) => {
          const selected =
            f === "All" ? pillState === "All" || pillState === null : pillState === f;
          return (
            <button
              key={f}
              type="button"
              onClick={() => applyQuickPreset(f)}
              className={cn(
                "shrink-0 snap-start whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100 font-medium",
                selected
                  ? taskQuickFilterSelectedClasses[f]
                  : cn(
                      "border-border bg-card text-muted-foreground hover:bg-elevated/80 hover:text-foreground",
                      taskQuickFilterIdleHintClasses[f],
                    ),
              )}
            >
              {f}
            </button>
          );
        })}
      </div>

      {chips.length > 0 ? (
        <div
          role="list"
          aria-label="Active filters"
          className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-px sm:flex-wrap sm:overflow-x-visible"
        >
          {chips.map((c) => (
            <div
              key={c.key}
              role="listitem"
              className="inline-flex min-w-0 max-w-[min(18rem,calc(100vw-6rem))] items-center gap-1 rounded-xl border border-border bg-elevated/50 pl-3 pr-1 py-1 text-[11px] text-muted-foreground shadow-sm transition-colors hover:bg-elevated motion-reduce:transition-none motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-150 shrink-0"
            >
              <span className="truncate max-w-[14rem]" title={c.label}>
                {c.label}
              </span>
              <button
                type="button"
                aria-label={`Remove filter ${c.label}`}
                onClick={c.onRemove}
                className="grid place-items-center size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition active:scale-95 motion-reduce:active:scale-100"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
