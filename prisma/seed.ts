/**
 * Seeds the database with a demo user and sample tasks. Loads env from `.env` via dotenv.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Priority, PrismaClient, TaskStatus } from "@/generated/prisma/client";

function requireDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.length === 0) {
    throw new Error("DATABASE_URL is required for seed");
  }
  return databaseUrl;
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }),
});

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

async function main() {
  const email = "dev@taskflow.local";

  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      name: "Dev User",
      emailVerified: true,
      currentStreak: 0,
    },
  });

  const userId = user.id;

  const tagWork = await prisma.tag.create({
    data: { userId, name: "Work", color: "#3b82f6" },
  });
  const tagHome = await prisma.tag.create({
    data: { userId, name: "Home", color: "#22c55e" },
  });
  const tagFocus = await prisma.tag.create({
    data: { userId, name: "Focus", color: "#f59e0b" },
  });

  const today = startOfDay(new Date());

  await prisma.task.createMany({
    data: [
      {
        userId,
        title: "Review quarterly goals",
        description: "Prep notes before the sync.",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.HIGH,
        dueDate: addDays(today, -2),
        position: 0,
        isDeleted: false,
      },
      {
        userId,
        title: "Inbox cleanup",
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: today,
        position: 1,
        isDeleted: false,
      },
      {
        userId,
        title: "Read API design docs",
        status: TaskStatus.PENDING,
        priority: Priority.LOW,
        dueDate: addDays(today, 1),
        position: 2,
        isDeleted: false,
      },
      {
        userId,
        title: "Book dentist appointment",
        status: TaskStatus.COMPLETED,
        priority: Priority.MEDIUM,
        dueDate: addDays(today, -10),
        position: 3,
        isDeleted: false,
      },
      {
        userId,
        title: "Write release notes draft",
        status: TaskStatus.PENDING,
        priority: Priority.HIGH,
        dueDate: addDays(today, 4),
        position: 4,
        isDeleted: false,
      },
      {
        userId,
        title: "Plan weekend groceries",
        status: TaskStatus.IN_PROGRESS,
        priority: Priority.LOW,
        dueDate: addDays(today, 6),
        position: 5,
        isDeleted: false,
      },
      {
        userId,
        title: "Refactor helper utilities",
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: null,
        position: 6,
        isDeleted: false,
      },
      {
        userId,
        title: "Archive old drafts",
        status: TaskStatus.COMPLETED,
        priority: Priority.LOW,
        dueDate: addDays(today, -1),
        position: 7,
        isDeleted: false,
      },
      {
        userId,
        title: "Update budget spreadsheet",
        status: TaskStatus.COMPLETED,
        priority: Priority.HIGH,
        dueDate: today,
        position: 8,
        isDeleted: false,
      },
      {
        userId,
        title: "Soft-deleted example — ignore in product views",
        status: TaskStatus.PENDING,
        priority: Priority.MEDIUM,
        dueDate: addDays(today, 2),
        position: 9,
        isDeleted: true,
        deletedAt: new Date(),
      },
    ],
  });

  const tasks = await prisma.task.findMany({
    where: { userId, isDeleted: false },
    orderBy: { position: "asc" },
  });

  const titles = new Map<string, string>(tasks.map((t) => [t.title, t.id]));

  async function link(title: string, tagId: string) {
    const taskId = titles.get(title);
    if (!taskId) throw new Error(`Missing seeded task titled: "${title}"`);
    await prisma.taskTag.create({
      data: { taskId, tagId },
    });
  }

  await link("Review quarterly goals", tagWork.id);
  await link("Review quarterly goals", tagFocus.id);
  await link("Inbox cleanup", tagWork.id);
  await link("Read API design docs", tagFocus.id);
  await link("Write release notes draft", tagWork.id);
  await link("Plan weekend groceries", tagHome.id);
  await link("Refactor helper utilities", tagFocus.id);

  const reviewId = titles.get("Review quarterly goals");
  const inboxId = titles.get("Inbox cleanup");
  const refactorId = titles.get("Refactor helper utilities");

  if (!reviewId || !inboxId || !refactorId) {
    throw new Error("Failed to resolve seeded task IDs for subtasks");
  }

  await prisma.subtask.createMany({
    data: [
      { taskId: reviewId, title: "Gather metrics from dashboard" },
      { taskId: reviewId, title: "Draft 3 bullets for leadership" },
      { taskId: reviewId, title: "Attach link to roadmap", isCompleted: true },
      { taskId: inboxId, title: "Respond to flagged threads" },
      {
        taskId: refactorId,
        title: "Split date helpers",
        isCompleted: true,
      },
      {
        taskId: refactorId,
        title: "Add unit smoke tests",
        isCompleted: true,
      },
    ],
  });
}

main()
  .catch((error: unknown) => {
    console.error("[seed]", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
