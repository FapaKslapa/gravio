"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { type HistoryItem, suggestCategory } from "@/lib/import/categorize";
import { useTRPC } from "@/lib/trpc/client";

export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function useCategorySuggestion(enabled = true) {
  const trpc = useTRPC();
  const { data } = useQuery(
    trpc.transaction.list.queryOptions(
      { limit: 3000, page: 1 },
      { enabled, staleTime: 5 * 60 * 1000 },
    ),
  );

  const history = useMemo<HistoryItem[]>(
    () =>
      (data ?? []).map((t) => ({
        description: t.description ?? "",
        categoryId: t.categoryId,
      })),
    [data],
  );

  return useCallback(
    (description: string): string | null =>
      description.trim().length < 2
        ? null
        : suggestCategory(description, history),
    [history],
  );
}
