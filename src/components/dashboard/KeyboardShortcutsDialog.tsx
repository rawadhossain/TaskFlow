"use client";

import { Keyboard } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const rows: { keys: string; action: string }[] = [
  { keys: "N", action: "New task (dashboard)" },
  { keys: "/", action: "Focus search (opens All tasks)" },
  { keys: "Ctrl / ⌘ K", action: "Focus search" },
  { keys: "1 · 2 · 3", action: "All tasks · Today · Upcoming" },
  { keys: "?", action: "This panel" },
  { keys: "Esc", action: "Close panel / blur field" },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden border-border bg-card p-0 sm:rounded-2xl">
        <DialogHeader className="border-b border-border/80 bg-elevated/40 px-6 py-4 text-left">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl border border-border bg-card">
              <Keyboard className="size-4 text-[var(--primary)]" aria-hidden />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold tracking-tight">
                Keyboard shortcuts
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Works when focus is not inside a text field (except Ctrl/⌘ K).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <ul className="divide-y divide-border/70 px-2 py-2">
          {rows.map((r) => (
            <li key={r.keys} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
              <span className="text-muted-foreground">{r.action}</span>
              <kbd className="shrink-0 rounded-lg border border-border bg-elevated px-2 py-1 text-[11px] font-mono text-foreground">
                {r.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
