export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  dueDate?: string;
  /** When task is in trash (soft-deleted). */
  deletedAt?: string;
  tags: Tag[];
  subtasks: Subtask[];
  createdAt: string;
}

export const tags: Tag[] = [
  { id: "t1", name: "Design", color: "var(--primary)" },
  { id: "t2", name: "Engineering", color: "oklch(0.7 0.15 250)" },
  { id: "t3", name: "Research", color: "var(--success)" },
  { id: "t4", name: "Personal", color: "var(--warning)" },
  { id: "t5", name: "Urgent", color: "var(--destructive)" },
];

export const initialTasks: Task[] = [
  {
    id: "1",
    title: "Design new dashboard hero section",
    description: "Explore 3 directions with glowing accents",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: new Date().toISOString(),
    tags: [tags[0], tags[4]],
    subtasks: [
      { id: "s1", title: "Moodboard", isCompleted: true },
      { id: "s2", title: "Wireframes", isCompleted: true },
      { id: "s3", title: "Hi-fi mockups", isCompleted: false },
      { id: "s4", title: "Hand-off", isCompleted: false },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "2",
    title: "Review pull requests from team",
    priority: "MEDIUM",
    status: "PENDING",
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    tags: [tags[1]],
    subtasks: [
      { id: "s5", title: "PR #421", isCompleted: false },
      { id: "s6", title: "PR #422", isCompleted: false },
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "3",
    title: "User research interviews — round 2",
    description: "5 sessions across 3 segments",
    priority: "HIGH",
    status: "PENDING",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    tags: [tags[2]],
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "4",
    title: "Book flights for offsite",
    priority: "LOW",
    status: "COMPLETED",
    tags: [tags[3]],
    subtasks: [],
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "5",
    title: "Refactor authentication module",
    description: "Move to JWT + refresh tokens",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    tags: [tags[1], tags[4]],
    subtasks: [
      { id: "s7", title: "Audit current flow", isCompleted: true },
      { id: "s8", title: "Implement refresh", isCompleted: false },
      { id: "s9", title: "Write tests", isCompleted: false },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "6",
    title: "Prepare quarterly review deck",
    priority: "HIGH",
    status: "PENDING",
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    tags: [tags[0]],
    subtasks: [
      { id: "s10", title: "Outline", isCompleted: true },
      { id: "s11", title: "Charts", isCompleted: false },
    ],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export function formatDue(iso?: string): { label: string; overdue: boolean } {
  if (!iso) return { label: "No due date", overdue: false };
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86400000);
  const overdue = diffDays < 0;
  if (diffDays === 0) return { label: "Today", overdue: false };
  if (diffDays === 1) return { label: "Tomorrow", overdue: false };
  if (diffDays === -1) return { label: "Yesterday", overdue: true };
  if (diffDays > 1 && diffDays < 7) {
    return { label: d.toLocaleDateString("en-US", { weekday: "long" }), overdue: false };
  }
  return {
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    overdue,
  };
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks === 1) return "1 week ago";
  return `${weeks} weeks ago`;
}
