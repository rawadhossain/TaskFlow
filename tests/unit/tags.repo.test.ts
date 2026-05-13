import { Prisma } from "@/generated/prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const tagFns = vi.hoisted(() => ({
  count: vi.fn(),
  create: vi.fn(),
  findFirst: vi.fn(),
  deleteMany: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    tag: tagFns,
  },
}));

import { createTagForUser, deleteTagForUser } from "@/lib/tasks.repo";

describe("tags.repo (mocked prisma)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createTagForUser succeeds", async () => {
    tagFns.count.mockResolvedValue(0 as never);
    tagFns.create.mockResolvedValue({
      id: "tag-new",
      userId: "user-1",
      name: "alpha",
      color: "#fff",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const tag = await createTagForUser("user-1", { name: "alpha" });

    expect(tag.name).toBe("alpha");
    expect(tagFns.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "user-1", name: "alpha" }),
      }),
    );
  });

  it("createTagForUser maps duplicate (P2002) to readable error", async () => {
    tagFns.count.mockResolvedValue(0 as never);

    tagFns.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint", {
        code: "P2002",
        clientVersion: "test",
        meta: {},
      }),
    );

    await expect(createTagForUser("user-1", { name: "dup" })).rejects.toThrow(/already exists/i);
  });

  it("deleteTagForUser throws when tag absent", async () => {
    tagFns.findFirst.mockResolvedValue(null as never);

    await expect(deleteTagForUser("user-1", "missing")).rejects.toThrow(/not found/);
    expect(tagFns.deleteMany).not.toHaveBeenCalled();
  });

  it("deleteTagForUser removes owned tag", async () => {
    tagFns.findFirst.mockResolvedValue({ id: "tag-1" } as never);
    tagFns.deleteMany.mockResolvedValue({ count: 1 } as never);

    await deleteTagForUser("user-1", "tag-1");

    expect(tagFns.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "tag-1", userId: "user-1" } }),
    );
  });
});
