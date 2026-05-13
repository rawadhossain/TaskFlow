"use client";

import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { taskQuerySchema } from "@/lib/validations/task-query.schema";

const OPEN_NEW_TASK = "taskflo-open-new";

export function useDashboardKeyboardShortcuts({
  shortcutsOpen,
  setShortcutsOpen,
}: {
  shortcutsOpen: boolean;
  setShortcutsOpen: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const inField = (el: EventTarget | null) => {
      if (!el || !(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      if (el.closest("[data-radix-popper-content-wrapper]")) return true;
      if (el.closest('[role="dialog"]')) return true;
      return false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const field = inField(e.target);

      if (e.key === "Escape") {
        if (shortcutsOpen) {
          e.preventDefault();
          setShortcutsOpen(false);
        }
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        if (field) return;
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("taskflo:focus-search"));
        if (pathname !== "/tasks") {
          void navigate({ to: "/tasks", search: taskQuerySchema.parse({}) });
        }
        return;
      }

      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (field) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("taskflo:focus-search"));
        if (pathname !== "/tasks") {
          void navigate({ to: "/tasks", search: taskQuerySchema.parse({}) });
        }
        return;
      }

      if ((e.metaKey || e.ctrlKey || e.altKey) && e.key !== "k") return;

      if (field) return;

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        sessionStorage.setItem(OPEN_NEW_TASK, "1");
        if (pathname !== "/tasks") {
          void navigate({ to: "/tasks", search: taskQuerySchema.parse({}) });
        } else {
          window.dispatchEvent(new CustomEvent("taskflo:open-new-task"));
        }
        return;
      }

      if (e.key >= "1" && e.key <= "3") {
        e.preventDefault();
        const map = { "1": "/tasks", "2": "/today", "3": "/upcoming" } as const;
        void navigate({ to: map[e.key as "1" | "2" | "3"] });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, pathname, setShortcutsOpen, shortcutsOpen]);
}

export function consumeOpenNewTaskFromStorage(): boolean {
  if (sessionStorage.getItem(OPEN_NEW_TASK) !== "1") return false;
  sessionStorage.removeItem(OPEN_NEW_TASK);
  return true;
}
