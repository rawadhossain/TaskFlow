import { z } from "zod";

export const bulkCompletedDeleteSchema = z.object({
  filter: z.literal("completed"),
});

export const bulkTrashPermanentDeleteSchema = z.object({
  filter: z.literal("trash"),
});
