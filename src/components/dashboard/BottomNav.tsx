"use client";

import { Link, useMatchRoute } from "@tanstack/react-router";
import { CalendarDays, CalendarRange, LayoutDashboard, Settings } from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { to: "/tasks" as const, label: "Tasks", Icon: LayoutDashboard },
  { to: "/today" as const, label: "Today", Icon: CalendarDays },
  { to: "/upcoming" as const, label: "Upcoming", Icon: CalendarRange },
  { to: "/settings" as const, label: "Me", Icon: Settings },
] as const;

export function BottomNav() {
  const matchRoute = useMatchRoute();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_28px_-12px_oklch(0_0_0/0.45)] motion-safe:transition-[box-shadow] pl-[max(0px,env(safe-area-inset-left))] pr-[max(0px,env(safe-area-inset-right))]"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 px-2">
        {items.map(({ to, label, Icon }) => {
          const active = !!matchRoute({ to, fuzzy: false });
          return (
            <li key={to} className="min-w-0 text-center">
              <Link
                to={to}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl py-1.5 mx-0.5 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center size-10 rounded-2xl border transition-colors motion-safe:transition-transform motion-safe:active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100",
                    active
                      ? "border-[var(--primary)]/35 bg-[var(--primary)]/15 text-[var(--primary)] shadow-[inset_0_0_0_1px_rgba(255,122,0,0.12)] glow-primary"
                      : "border-transparent bg-transparent text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                </span>
                <span
                  className={cn(
                    "mt-0.5 block max-w-full truncate px-1 text-[10px] font-medium leading-tight",
                    active ? "text-[var(--primary)]" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
