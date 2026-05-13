"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateTask, useUpdateTask } from "@/hooks/useTaskMutations";
import { createTaskSchema, updateTaskSchema } from "@/lib/validations/task.schema";
import type { ApiTaskRow } from "@/types";
import { cn } from "@/lib/utils";
import { TaskStatusBadge } from "@/components/dashboard/TaskStatusBadge";
import { TASK_STATUS_LABEL } from "@/components/dashboard/task-status.styles";
import { TaskTagField } from "@/components/dashboard/TaskTagField";
import { toast } from "sonner";

const priorityOptions = ["LOW", "MEDIUM", "HIGH"] as const;
const statusOptions = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;

type CreateValues = z.input<typeof createTaskSchema>;
type UpdateValues = z.input<typeof updateTaskSchema>;

function isoToDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function dateToIso(date: Date | null | undefined): string | null | undefined {
  if (!date) return date === null ? null : undefined;
  return date.toISOString();
}

export function TaskFormDialog({
  open,
  onOpenChange,
  mode,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  task?: ApiTaskRow | null;
}) {
  const createMut = useCreateTask();
  const updateMut = useUpdateTask();

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createTaskSchema) as Resolver<CreateValues>,
    defaultValues: {
      title: "",
      description: undefined,
      dueDate: undefined,
      tagIds: [],
      subtasks: [],
      priority: "MEDIUM",
    },
  });

  const editForm = useForm<UpdateValues>({
    resolver: zodResolver(updateTaskSchema) as Resolver<UpdateValues>,
    defaultValues: {},
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "create") {
      createForm.reset({
        title: "",
        description: undefined,
        dueDate: undefined,
        tagIds: [],
        subtasks: [],
        priority: "MEDIUM",
        status: "PENDING",
      });
    } else if (task) {
      editForm.reset({
        title: task.title,
        description: task.description ?? null,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ?? undefined,
        tagIds: task.tags.map((t) => t.id),
      });
    }
  }, [open, mode, task, createForm, editForm]);

  const busy = createMut.isPending || updateMut.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-md gap-0 p-0 overflow-hidden border-border bg-card sm:rounded-2xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
        )}
      >
        <DialogHeader className="px-6 pt-6 pb-2 border-b border-border/80 bg-elevated/30">
          <DialogTitle className="text-base font-semibold tracking-tight">
            {mode === "create" ? "New task" : "Edit task"}
          </DialogTitle>
        </DialogHeader>

        {mode === "create" ? (
          <Form {...createForm}>
            <form
              onSubmit={createForm.handleSubmit((values) => {
                createMut.mutate(values, {
                  onSuccess: () => {
                    toast.success("Task created");
                    onOpenChange(false);
                  },
                  onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create"),
                });
              })}
              className="space-y-4 px-6 py-5"
            >
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="What needs doing?"
                        className="rounded-xl border-border bg-background"
                        autoFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || undefined)}
                        rows={3}
                        placeholder="Optional context…"
                        className="rounded-xl border-border bg-background resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={createForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? "MEDIUM"}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-border">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? "PENDING"}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-border">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s} value={s} textValue={TASK_STATUS_LABEL[s]}>
                              <TaskStatusBadge status={s} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={isoToDate(field.value)}
                        onDateChange={(date) => field.onChange(dateToIso(date))}
                        placeholder="No due date set"
                        disabled={busy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="tagIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <TaskTagField
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={busy}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2 gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-border"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy} className="rounded-xl glow-primary">
                  {busy ? "Saving…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        ) : (
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((values) => {
                if (!task) return;
                updateMut.mutate(
                  { id: task.id, data: values },
                  {
                    onSuccess: () => {
                      toast.success("Task updated");
                      onOpenChange(false);
                    },
                    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
                  },
                );
              })}
              className="space-y-4 px-6 py-5"
            >
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded-xl border-border bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value || null)}
                        rows={3}
                        className="rounded-xl border-border bg-background resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={editForm.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? task?.priority}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-border">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? task?.status}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl border-border">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s} value={s} textValue={TASK_STATUS_LABEL[s]}>
                              <TaskStatusBadge status={s} />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due date</FormLabel>
                    <FormControl>
                      <DatePicker
                        date={isoToDate(field.value)}
                        onDateChange={(date) => field.onChange(dateToIso(date))}
                        placeholder="No due date set"
                        disabled={busy}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="tagIds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <TaskTagField
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={busy}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-border"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy} className="rounded-xl glow-primary">
                  {busy ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
