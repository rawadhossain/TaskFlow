import { z } from "zod";

const hexColor = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createTagSchema = z.object({
  name: z.string().min(1).max(30).trim(),
  color: z.string().regex(hexColor).optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).max(30).trim().optional(),
  color: z.string().regex(hexColor).optional(),
});
