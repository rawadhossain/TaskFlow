"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTagFn, deleteTagFn, updateTagFn } from "@/lib/tasks.functions";
import type { createTagSchema, updateTagSchema } from "@/lib/validations/tag.schema";
import type { z } from "zod";

export type CreateTagBody = z.input<typeof createTagSchema>;
export type UpdateTagBody = z.input<typeof updateTagSchema>;

export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateTagBody) => createTagFn({ data: body }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tags"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}

export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagBody }) =>
      updateTagFn({ data: { id, ...data } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tags"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
    },
  });
}

export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTagFn({ data: { id } }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tags"] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"], exact: false });
      void queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });
}
