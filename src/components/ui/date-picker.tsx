"use client";

import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled,
}: {
  date?: Date | null;
  onDateChange: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal rounded-xl border-border bg-background transition-colors hover:bg-elevated",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" aria-hidden />
          {date ? format(date, "PPP 'at' p") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-border bg-card rounded-2xl shadow-xl"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={(newDate) => onDateChange(newDate ?? null)}
          initialFocus
          className="rounded-2xl"
        />
        {date && (
          <div className="border-t border-border/80 px-3 py-2.5 flex items-center justify-between bg-elevated/30">
            <span className="text-xs text-muted-foreground">{format(date, "PPP 'at' p")}</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs rounded-lg hover:bg-elevated"
              onClick={() => onDateChange(null)}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
