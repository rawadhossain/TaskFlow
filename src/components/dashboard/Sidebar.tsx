import { Link, useLocation, useMatchRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Trash2,
  Settings,
  Flame,
  LogOut,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";

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
import { TaskFlowMark } from "@/components/branding/TaskFlowLogo";
import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";
import { locationSearchString } from "@/hooks/useTaskFilters";
import { useStats } from "@/hooks/useStats";
import { useTags } from "@/hooks/useTags";
import { parseTaskQueryFromSearchParams } from "@/lib/task-query-from-url";
import { cn } from "@/lib/utils";
import { taskQuerySchema } from "@/lib/validations/task-query.schema";

const mainNav = [
  { id: "all", label: "All Tasks", icon: LayoutDashboard, to: "/tasks" as const },
  { id: "today", label: "Today", icon: CalendarDays, to: "/today" as const },
  { id: "upcoming", label: "Upcoming", icon: CalendarRange, to: "/upcoming" as const },
  { id: "completed", label: "Completed", icon: CheckCircle2, to: "/completed" as const },
  { id: "trash", label: "Trash", icon: Trash2, to: "/trash" as const },
] as const;

function SidebarUserAvatar({
  imageUrl,
  displayName,
  isPending,
}: {
  imageUrl?: string | null;
  displayName: string;
  isPending: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const initial = displayName.trim().slice(0, 1).toUpperCase() || "?";
  const raw = typeof imageUrl === "string" && imageUrl.trim().length > 0 ? imageUrl.trim() : "";

  const showImg = Boolean(raw && !broken);

  useEffect(() => {
    setBroken(false);
  }, [raw]);

  return (
    <div className="size-9 shrink-0 rounded-full ring-1 ring-border overflow-hidden bg-elevated grid place-items-center">
      {showImg ? (
        <img
          src={raw}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="size-full object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <span className="text-xs font-semibold text-muted-foreground" aria-hidden>
          {isPending ? "…" : initial}
        </span>
      )}
    </div>
  );
}

export function Sidebar() {
  const matchRoute = useMatchRoute();
  const pathname = useLocation({ select: (l) => l.pathname });
  const searchQs = useLocation({ select: (l) => locationSearchString({ search: l.search }) });

  const { data: session, isPending } = authClient.useSession();
  const { stats, isLoading: statsLoading } = useStats();
  const { tags } = useTags();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const parsedTasksFilters = useMemo(
    () => parseTaskQueryFromSearchParams(new URLSearchParams(searchQs)),
    [searchQs],
  );

  const executeSignOut = () => {
    void authClient.signOut().then(() => {
      window.location.assign("/");
    });
  };

  const user = session?.user as
    | {
        name?: string | null;
        email?: string | null;
        image?: string | null;
        picture?: string | null;
      }
    | undefined;
  const oauthImageRaw = typeof user?.image === "string" && user.image ? user.image : user?.picture;
  const oauthImage =
    typeof oauthImageRaw === "string" && oauthImageRaw.trim() ? oauthImageRaw.trim() : null;
  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "You";
  const streak = stats?.streak.current ?? 0;

  const countFor = (id: (typeof mainNav)[number]["id"]) => {
    if (!stats || statsLoading) return "—";
    const c = stats.counts;
    switch (id) {
      case "all":
        return c.total;
      case "today":
        return c.dueToday;
      case "upcoming":
        return c.pending + c.inProgress;
      case "completed":
        return c.completed;
      case "trash":
        return c.trash;
      default:
        return 0;
    }
  };

  const isActivePath = (to: (typeof mainNav)[number]["to"]) => !!matchRoute({ to, fuzzy: false });

  return (
    <aside className="hidden lg:flex lg:fixed lg:top-0 lg:left-0 lg:z-30 h-[100dvh] w-[260px] flex-col shrink-0 border-r border-border bg-sidebar overflow-hidden">
      <div className="flex shrink-0 items-center gap-3 px-5 py-4">
        <div className="size-9 shrink-0 rounded-xl grid place-items-center border border-[var(--primary)]/35 bg-[var(--primary)]/15">
          <TaskFlowMark className="size-[22px] text-primary" aria-hidden />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight font-mono">
            Task-<span className="text-primary">Flow</span>
          </div>
        </div>
      </div>

      <div className="mx-3 mb-3 flex min-h-14 shrink-0 items-center gap-3 rounded-xl border border-border bg-elevated/60 px-3 py-2.5">
        <SidebarUserAvatar
          imageUrl={oauthImage ?? undefined}
          displayName={displayName}
          isPending={isPending}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium leading-snug">
            {isPending ? "…" : displayName}
          </div>
          <div className="flex items-center gap-1 text-[11px] leading-snug text-muted-foreground mt-0.5"></div>
        </div>
        <button
          type="button"
          onClick={() => setLogoutOpen(true)}
          aria-label="Sign out"
          title="Sign out"
          className="size-8 shrink-0 grid place-items-center rounded-lg border border-transparent text-muted-foreground hover:text-foreground hover:bg-elevated transition"
        >
          <LogOut className="size-4" />
        </button>
      </div>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="sm:rounded-2xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You&apos;ll need to sign back in to access your workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-[var(--destructive)] hover:bg-[var(--destructive)]/90"
              onClick={() => executeSignOut()}
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-2">
        <SectionLabel>Main</SectionLabel>
        <ul className="space-y-0.5 mb-5">
          {mainNav.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.to}
                icon={item.icon}
                label={item.label}
                count={countFor(item.id)}
                active={isActivePath(item.to)}
              />
            </li>
          ))}
        </ul>

        <SectionLabel>Tags</SectionLabel>
        <div className="mb-5 px-1 -mx-1">
          {tags.length === 0 ? (
            <div className="px-2 py-2 text-[11px] text-muted-foreground leading-relaxed">
              No tags yet. Add tags in the{" "}
              <Link
                to="/tasks"
                search={taskQuerySchema.parse({ page: 1 })}
                className="text-[var(--primary)] hover:underline"
              >
                New task
              </Link>{" "}
              form or manage them in{" "}
              <Link to="/settings" className="text-[var(--primary)] hover:underline">
                Settings
              </Link>
              .
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => {
                const tasksActive =
                  pathname === "/tasks" &&
                  parsedTasksFilters.tag.length === 1 &&
                  parsedTasksFilters.tag[0] === t.id;

                return (
                  <Link
                    key={t.id}
                    to="/tasks"
                    search={taskQuerySchema.parse({
                      tag: [t.id],
                      page: 1,
                      search: undefined,
                    })}
                    aria-label={`Filter tasks by tag ${t.name}`}
                    aria-current={tasksActive ? "page" : undefined}
                    className={cn(
                      "group inline-flex shrink-0 transition",
                      tasksActive && "scale-[1.02]",
                    )}
                  >
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-normal text-[10px] px-2 py-1 border shadow-sm transition hover:shadow-md cursor-pointer",
                        tasksActive
                          ? "opacity-100 ring-2 ring-[var(--primary)]/30"
                          : "opacity-90 hover:opacity-100",
                      )}
                      style={{
                        borderColor: t.color,
                        backgroundColor: `color-mix(in oklab, ${t.color} ${tasksActive ? "22" : "14"}%, transparent)`,
                      }}
                      title={`${t.name} (${t.taskCount})`}
                    >
                      <span
                        className="size-1.5 shrink-0 rounded-full mr-1.5 align-middle"
                        style={{ backgroundColor: t.color }}
                      />
                      <span className="truncate align-middle max-w-[7rem]">{t.name}</span>
                      <span className="tabular-nums text-muted-foreground/80 ml-1.5 text-[9px]">
                        {t.taskCount}
                      </span>
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-border/70 pt-2 mt-2">
          <Link
            to="/settings"
            className={cn(
              "flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
              matchRoute({ to: "/settings", fuzzy: false })
                ? "bg-[var(--primary)]/12 text-foreground shadow-[inset_0_0_0_1px_rgba(255,122,0,0.25)]"
                : "text-muted-foreground hover:text-foreground hover:bg-elevated/60",
            )}
          >
            <Settings
              className={cn(
                "size-4 shrink-0",
                matchRoute({ to: "/settings", fuzzy: false }) && "text-[var(--primary)]",
              )}
            />
            <span className="flex-1 text-left font-medium">Settings</span>
          </Link>
        </div>
      </nav>

      <div className="shrink-0 p-3 bg-sidebar">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="absolute inset-0 opacity-60 pointer-events-none [background:radial-gradient(circle_at_20%_0%,rgba(255,122,0,0.35),transparent_60%)]" />
          <div className="relative space-y-2">
            <div className="size-8 rounded-lg grid place-items-center bg-[var(--primary)]/20 border border-[var(--primary)]/25">
              <TaskFlowMark className="size-5 text-primary" aria-hidden />
            </div>
            <div className="text-sm font-semibold">Stay in flow</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Small daily wins beat big pushes.
            </p>
            <Link
              to="/today"
              className="inline-flex text-xs font-medium px-3 py-2 rounded-lg bg-[var(--primary)] text-primary-foreground hover:brightness-110 transition glow-primary"
            >
              Today&apos;s focus
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground/70 uppercase pt-3 first:pt-0">
      {children}
    </div>
  );
}

function NavLink({
  to,
  icon: Icon,
  label,
  count,
  active,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: string | number;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
        active
          ? "bg-[var(--primary)]/12 text-foreground shadow-[inset_0_0_0_1px_rgba(255,122,0,0.25)]"
          : "text-muted-foreground hover:text-foreground hover:bg-elevated/60",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r bg-[var(--primary)] glow-primary" />
      )}
      <Icon className={cn("size-4 shrink-0", active && "text-[var(--primary)]")} />
      <span className="flex-1 text-left truncate">{label}</span>
      {count !== undefined ? (
        <span
          className={cn(
            "text-[11px] tabular-nums px-1.5 py-0.5 rounded-md shrink-0",
            active ? "bg-[var(--primary)]/20 text-[var(--primary)]" : "text-muted-foreground/70",
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
