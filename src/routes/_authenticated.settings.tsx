import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { User, Tag as TagIcon, Plus, Trash2, Pencil } from "lucide-react";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTag, useDeleteTag, useUpdateTag } from "@/hooks/useTagMutations";
import { useTags } from "@/hooks/useTags";
import { authLayoutRouteApi } from "@/lib/auth-layout-route-api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { session } = authLayoutRouteApi.useRouteContext();
  const u = session.user;
  const displayName = u.name?.trim() || u.email?.split("@")[0] || "You";
  const { tags, refetch } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <DashboardShell
      session={session}
      title="Settings"
      subtitle="Profile and tag colors — tuned to your workspace."
    >
      <div className="grid gap-6 max-w-2xl w-full min-w-0">
        <section className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <User className="size-4 text-[var(--primary)]" />
            Profile
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            {u.image ? (
              <img
                src={u.image}
                alt=""
                className="size-16 rounded-2xl object-cover ring-2 ring-[var(--primary)]/30"
              />
            ) : (
              <div className="size-16 rounded-2xl bg-elevated grid place-items-center text-lg font-semibold text-muted-foreground">
                {displayName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-base font-medium">{displayName}</div>
              <div className="text-sm text-muted-foreground">{u.email ?? ""}</div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Signed in with Google — name and avatar sync from your account.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 space-y-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <TagIcon className="size-4 text-[var(--primary)]" />
            Tags
          </div>
          <p className="text-xs text-muted-foreground">
            Create labels for filters and task dialog. Names unique per workspace.
          </p>

          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!newName.trim()) return;
              createTag.mutate(
                { name: newName.trim() },
                {
                  onSuccess: () => {
                    setNewName("");
                    toast.success("Tag created");
                    void refetch();
                  },
                  onError: (err) =>
                    toast.error(err instanceof Error ? err.message : "Could not create tag"),
                },
              );
            }}
          >
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New tag name"
              className="max-w-xs rounded-xl border-border bg-background"
            />
            <Button
              type="submit"
              disabled={createTag.isPending || !newName.trim()}
              className="rounded-xl glow-primary"
            >
              <Plus className="size-4" />
              Add tag
            </Button>
          </form>

          <ul className="space-y-2">
            {tags.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-elevated/40 px-3 py-2.5"
              >
                <span
                  className="size-3 rounded-full shrink-0 ring-2 ring-border"
                  style={{ backgroundColor: t.color }}
                />
                {editingId === t.id ? (
                  <form
                    className="flex flex-1 flex-wrap gap-2 items-center"
                    onSubmit={(e) => {
                      e.preventDefault();
                      updateTag.mutate(
                        { id: t.id, data: { name: editName.trim() } },
                        {
                          onSuccess: () => {
                            setEditingId(null);
                            toast.success("Tag updated");
                            void refetch();
                          },
                          onError: (err) =>
                            toast.error(err instanceof Error ? err.message : "Update failed"),
                        },
                      );
                    }}
                  >
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 min-w-[120px] rounded-lg border-border bg-background h-8 text-sm"
                    />
                    <Button type="submit" size="sm" className="rounded-lg h-8">
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium truncate">{t.name}</span>
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {t.taskCount} tasks
                    </span>
                    <button
                      type="button"
                      aria-label={`Rename ${t.name}`}
                      className="size-8 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-elevated"
                      onClick={() => {
                        setEditingId(t.id);
                        setEditName(t.name);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${t.name}`}
                      className="size-8 grid place-items-center rounded-lg text-muted-foreground hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                      onClick={() => setDeleteId(t.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="sm:rounded-2xl border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete tag?</AlertDialogTitle>
            <AlertDialogDescription>
              Removes the tag from the library. Tasks keep their other tags.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn("rounded-xl bg-[var(--destructive)] text-destructive-foreground")}
              onClick={() => {
                if (!deleteId) return;
                deleteTag.mutate(deleteId, {
                  onSuccess: () => {
                    toast.success("Tag removed");
                    setDeleteId(null);
                    void refetch();
                  },
                  onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
                });
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardShell>
  );
}
