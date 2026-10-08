"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useSavingsInsights() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const query = useQuery({
    ...trpc.insight.get.queryOptions(),
    staleTime: 10 * 60_000,
    retry: false,
  });
  const refresh = useMutation(
    trpc.insight.refresh.mutationOptions({
      onSuccess: (data) => {
        queryClient.setQueryData(trpc.insight.get.queryKey(), data);
      },
    }),
  );
  return { query, refresh };
}

export type SavingsInsights = ReturnType<typeof useSavingsInsights>;
