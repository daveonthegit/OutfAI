// apps/web/hooks/use-__resource__.ts
"use client";

import { trpc } from "@/lib/trpc";

export function use__Resource__() {
  const utils = trpc.useUtils();

  const listQuery = trpc.__resource__.list.useQuery();

  const createMutation = trpc.__resource__.create.useMutation({
    onSuccess: async () => {
      await utils.__resource__.list.invalidate();
    },
  });

  const deleteMutation = trpc.__resource__.delete.useMutation({
    onSuccess: async () => {
      await utils.__resource__.list.invalidate();
    },
  });

  return {
    data: listQuery.data,
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    create: (input: any) => createMutation.mutateAsync(input),
    remove: (id: string) => deleteMutation.mutateAsync({ id }),
  };
}
