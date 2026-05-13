"use client";

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Settings2 } from "lucide-react";

import { BottomNav } from "@/components/dashboard/BottomNav";
import { MobileMomentumStrip } from "@/components/dashboard/MobileMomentumStrip";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { KeyboardShortcutsDialog } from "@/components/dashboard/KeyboardShortcutsDialog";
import { useDashboardKeyboardShortcuts } from "@/hooks/useDashboardKeyboardShortcuts";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function DashboardShell({
  session,
  title,
  subtitle,
  toolbar,
  children,
  className,
}: {
  session: { user: SessionUser };
  title: string;
  subtitle?: string;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const displayName = session.user.name?.trim() || session.user.email?.split("@")[0] || "there";

  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  useDashboardKeyboardShortcuts({ shortcutsOpen, setShortcutsOpen });

  return (
    <>
      <div
        className={cn(
          "flex w-full min-h-[100dvh] bg-background text-foreground lg:min-h-0 lg:h-[100dvh] lg:overflow-hidden",
          className,
        )}
      >
        <Sidebar />

        <div className="flex flex-1 min-w-0 min-h-[100dvh] flex-col lg:min-h-0 lg:h-[100dvh] lg:ml-[260px] lg:overflow-hidden pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-0 pt-[env(safe-area-inset-top)] lg:pt-0">
          <header className="flex shrink-0 flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5 lg:px-6 sm:gap-4 sm:py-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
              {subtitle ? (
                <p className="text-xs text-muted-foreground line-clamp-2">{subtitle}</p>
              ) : (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  Welcome back, {displayName} — let&apos;s clear the deck.
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/settings"
                aria-label="Settings"
                className="size-9 grid place-items-center rounded-xl border border-border bg-card hover:bg-elevated transition"
              >
                <Settings2 className="size-4" />
              </Link>
            </div>
          </header>

          {toolbar ? (
            <div className="shrink-0 px-4 pt-4 sm:px-5 lg:px-6 sm:pt-5">{toolbar}</div>
          ) : null}

          <div className="flex min-h-0 flex-1 min-w-0 overflow-hidden">
            <section className="min-h-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto overscroll-y-contain px-4 py-4 sm:space-y-5 sm:px-5 sm:py-5 lg:px-6 touch-pan-y">
              <div className="xl:hidden">
                <MobileMomentumStrip />
              </div>
              {children}
            </section>
            <RightPanel />
          </div>

          <BottomNav />
        </div>
      </div>

      <Toaster
        theme="dark"
        position="bottom-right"
        offset={16}
        mobileOffset={{
          bottom: "calc(5.25rem + env(safe-area-inset-bottom))",
          right: "max(0.75rem, env(safe-area-inset-right))",
        }}
        toastOptions={{
          classNames: {
            toast:
              "rounded-xl border border-border bg-card shadow-lg backdrop-blur-sm text-[13px] sm:text-sm max-w-[min(100vw-1.75rem,24rem)]",
          },
        }}
      />
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}
