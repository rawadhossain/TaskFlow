import { describe, expect, it } from "vitest";

import { createTaskSchema } from "@/lib/validations/task.schema";

describe("createTaskSchema", () => {
  it("accepts minimal valid payload", () => {
    const r = createTaskSchema.safeParse({ title: "  OK  ", subtasks: [], tagIds: [] });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.title).toBe("OK");
  });

  it("rejects empty trimmed title", () => {
    const r = createTaskSchema.safeParse({ title: "   ", subtasks: [], tagIds: [] });
    expect(r.success).toBe(false);
  });
});
