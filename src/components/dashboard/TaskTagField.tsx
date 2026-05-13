"use client";

import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCreateTag } from "@/hooks/useTagMutations";
import { useTags } from "@/hooks/useTags";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type Props = {
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
};

export function TaskTagField({ value, onChange, disabled }: Props) {
  const { tags } = useTags();
  const createMut = useCreateTag();
  const [open, setOpen] = useState(false);

  const [draft, setDraft] = useState("");
  const trimmed = draft.trim();

  const byId = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags]);

  const filtered = useMemo(() => {
    const q = trimmed.toLowerCase();
    if (!q) return tags;
    return tags.filter((t) => t.name.toLowerCase().includes(q));
  }, [tags, trimmed]);

  const exactMatch =
    trimmed.length > 0 && tags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase());

  const selectedList = value.map((id) => byId.get(id)).filter(Boolean);

  function toggle(id: string) {
    const set = new Set(value);
    if (set.has(id)) set.delete(id);
    else if (set.size < 10) set.add(id);
    onChange([...set]);
  }

  async function handleCreate(raw: string) {
    const name = raw.trim();
    if (!name || name.length > 30) return;
    if (tags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      toast.error("A tag with this name already exists");
      return;
    }
    try {
      const created = await createMut.mutateAsync({ name });
      const next = new Set(value);
      if (next.size < 10) next.add(created.id);
      onChange([...next]);
      setDraft("");
      toast.success(`Tag “${name}” added`);
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create tag");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[1.5rem] items-center">
        {selectedList.length === 0 ? (
          <span className="text-xs text-muted-foreground">No tags · use picker below.</span>
        ) : (
          selectedList.map((t) => (
            <div
              key={t!.id}
              className={cn(
                badgeVariants({ variant: "outline" }),
                "inline-flex gap-2 px-2 py-1 font-normal max-w-[16rem]",
              )}
              style={{
                borderColor: t!.color,
                backgroundColor: `color-mix(in oklab, ${t!.color} 14%, transparent)`,
              }}
            >
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: t!.color }}
              />
              <span className="truncate text-foreground">{t!.name}</span>
              <button
                type="button"
                aria-label={`Remove tag ${t!.name}`}
                disabled={disabled}
                className="grid place-items-center rounded-md size-5 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={() => toggle(t!.id)}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between rounded-xl border-border bg-background font-normal"
          >
            <span className="text-muted-foreground">Add or create tags</span>
            <ChevronDown className="size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[min(100vw-1.25rem,20rem)] p-0 rounded-xl border-border shadow-lg"
          align="start"
        >
          <Command className="rounded-xl [&_[cmdk-input-wrapper]_svg]:size-4" shouldFilter={false}>
            <CommandInput
              placeholder="Search tags or type new name…"
              value={draft}
              onValueChange={setDraft}
              onKeyDown={(e) => {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (filtered.length === 1 && trimmed) {
                  const only = filtered[0];
                  if (only && only.name.toLowerCase() === trimmed.toLowerCase()) {
                    toggle(only.id);
                    setDraft("");
                    return;
                  }
                }
                if (!exactMatch && trimmed) {
                  void handleCreate(trimmed);
                  return;
                }
              }}
            />
            <CommandList>
              {!trimmed && tags.length === 0 ? (
                <div className="px-3 py-6 text-xs text-muted-foreground text-center leading-relaxed">
                  No tags yet. Type a label and press{" "}
                  <kbd className="px-1 py-px rounded border border-border bg-muted text-[10px]">
                    Enter
                  </kbd>{" "}
                  to create.
                </div>
              ) : null}
              {trimmed.length > 0 && filtered.length === 0 ? (
                <div className="px-3 py-3 text-xs text-muted-foreground leading-relaxed">
                  No matching tag. Press{" "}
                  <kbd className="px-1 py-px rounded border border-border bg-muted text-[10px]">
                    Enter
                  </kbd>{" "}
                  or use Create below.
                </div>
              ) : null}
              {tags.length > 0 ? (
                <CommandGroup heading="Existing tags">
                  {filtered.map((t) => {
                    const on = value.includes(t.id);
                    return (
                      <CommandItem
                        key={t.id}
                        value={t.id}
                        keywords={[t.name, t.color]}
                        onSelect={() => {
                          toggle(t.id);
                          setDraft("");
                        }}
                      >
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="truncate flex-1">{t.name}</span>
                        <Check className={cn("size-4 shrink-0", !on && "opacity-0")} />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ) : null}
              {trimmed && !exactMatch ? (
                <div className="border-t border-border px-2 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled || createMut.isPending || trimmed.length > 30}
                    className="w-full gap-2 justify-start rounded-lg text-xs font-medium h-9"
                    onClick={() => void handleCreate(trimmed)}
                  >
                    <Plus className="size-4 shrink-0" />
                    Create &quot;{trimmed}&quot;
                  </Button>
                </div>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <p className="text-[11px] text-muted-foreground">
        Selected tags attach when you save. Up to 10 per task.
      </p>
    </div>
  );
}
