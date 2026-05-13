/* eslint-disable @typescript-eslint/no-explicit-any --
   Prisma client shapes in tests mocked loosely to match mapTaskRow input. */

import type { Priority, TaskStatus } from "@/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const taskFns = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deleteMany: vi.fn(),
}));

const tagFns = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  findFirst: vi.fn(),
  deleteMany: vi.fn(),
}));

const userFns = vi.hoisted(() => ({
  findUnique: vi.fn(),
  findUniqueOrThrow: vi.fn(),
  update: vi.fn(),
}));

const $transaction = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  default: {
    task: taskFns,
    tag: tagFns,
    user: userFns,
    subtask: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    taskTag: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    $transaction,
  },
}));

function makeDbTaskRow(overrides: Partial<any> = {}): any {
  const now = new Date("2026-05-01T12:00:00.000Z");
  return {
    id: "task-1",
    title: "Demo",
    description: null,
    status: "PENDING" as TaskStatus,
    priority: "MEDIUM" as Priority,
    dueDate: null,
    position: 0,
    userId: "user-1",
    isDeleted: false,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    subtasks: [],
    tags: [],
    ...overrides,
  };
}

import {
  createTaskForUser,
  listTasksForUser,
  restoreTaskForUser,
  softDeleteTaskForUser,
  toggleTaskForUser,
  updateTaskForUser,
} from "@/lib/tasks.repo";
import { taskQuerySchema } from "@/lib/validations/task-query.schema";

describe("tasks.repo (mocked prisma)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listTasksForUser scopes queries to userId", async () => {
    taskFns.count.mockResolvedValue(0 as never);
    taskFns.findMany.mockResolvedValue([] as never);

    await listTasksForUser("user-alpha", taskQuerySchema.parse({ trashOnly: false }));

    expect(taskFns.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-alpha", isDeleted: false }),
      }),
    );
    expect(taskFns.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: "user-alpha", isDeleted: false }),
      }),
    );
  });

  it("createTaskForUser persists with next position", async () => {
    taskFns.findFirst.mockResolvedValue({ position: 2 } as never);
    taskFns.create.mockResolvedValue(makeDbTaskRow({ title: "New", position: 3 }));

    const row = await createTaskForUser("user-1", {
      title: "New",
      tagIds: [],
      subtasks: [],
    });

    expect(row.title).toBe("New");
    expect(taskFns.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", position: 3, title: "New" }),
      }),
    );
  });

  it("createTaskForUser rejects when tag ids are not all owned by user", async () => {
    tagFns.findMany.mockResolvedValue([{ id: "only-one" }] as never);

    await expect(
      createTaskForUser("user-1", {
        title: "X",
        tagIds: ["a", "b"],
        subtasks: [],
      }),
    ).rejects.toThrow(/tags are invalid/i);
    expect(taskFns.create).not.toHaveBeenCalled();
  });

  it("updateTaskForUser throws when task missing for user", async () => {
    taskFns.findFirst.mockResolvedValue(null as never);

    await expect(updateTaskForUser("user-1", "gone", { title: "Nope" })).rejects.toThrow(
      /Task not found/,
    );
    expect($transaction).not.toHaveBeenCalled();
  });

  it("updateTaskForUser succeeds", async () => {
    taskFns.findFirst.mockResolvedValue({ id: "task-1" } as never);
    const updated = makeDbTaskRow({ title: "Updated" });

    ($transaction as any).mockImplementation(async (fn: any) =>
      fn({
        taskTag: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        subtask: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        task: { update: vi.fn().mockResolvedValue(updated) },
      }),
    );

    const out = await updateTaskForUser("user-1", "task-1", { title: "Updated" });
    expect(out.title).toBe("Updated");
  });

  it("toggleTaskForUser moves PENDING -> IN_PROGRESS", async () => {
    taskFns.findFirst.mockResolvedValue({ isDeleted: false, status: "PENDING" } as never);
    const updated = makeDbTaskRow({ status: "IN_PROGRESS" });

    ($transaction as any).mockImplementation(async (fn: any) =>
      fn({
        user: {
          findUniqueOrThrow: userFns.findUniqueOrThrow,
          update: userFns.update,
        },
        task: { update: vi.fn().mockResolvedValue(updated) },
      }),
    );

    const out = await toggleTaskForUser("user-1", "task-1");
    expect(out.status).toBe("IN_PROGRESS");
  });

  it("toggleTaskForUser moves COMPLETED -> PENDING without streak churn", async () => {
    taskFns.findFirst.mockResolvedValue({ isDeleted: false, status: "COMPLETED" } as never);
    const updated = makeDbTaskRow({ status: "PENDING" });

    ($transaction as any).mockImplementation(async (fn: any) =>
      fn({
        user: {
          findUniqueOrThrow: userFns.findUniqueOrThrow,
          update: userFns.update,
        },
        task: { update: vi.fn().mockResolvedValue(updated) },
      }),
    );

    await toggleTaskForUser("user-1", "task-1");
    expect(userFns.update).not.toHaveBeenCalled();
    expect(updated.status).toBe("PENDING");
  });

  it("softDeleteTaskForUser sets isDeleted true", async () => {
    taskFns.findFirst.mockResolvedValue({ isDeleted: false } as never);
    const deletedRow = makeDbTaskRow({
      isDeleted: true,
      deletedAt: new Date("2026-05-02T08:00:00.000Z"),
    });

    taskFns.update.mockResolvedValue(deletedRow as never);

    const out = await softDeleteTaskForUser("user-1", "task-1");

    expect(out.isDeleted).toBe(true);
    expect(taskFns.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "task-1" },
        data: expect.objectContaining({ isDeleted: true }),
      }),
    );
  });

  it("restoreTaskForUser clears delete flags when task is in trash", async () => {
    taskFns.findFirst.mockResolvedValue({ isDeleted: true } as never);
    const restored = makeDbTaskRow({ isDeleted: false, deletedAt: null });

    taskFns.update.mockResolvedValue(restored as never);

    const out = await restoreTaskForUser("user-1", "task-1");
    expect(out.isDeleted).toBe(false);
    expect(out.deletedAt).toBeNull();
  });
});
