import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTRPC } from "@/lib/trpc/client";
import { ACTIONS, filterEntries, PAGES } from "./palette-entries";
import { matches } from "./palette-utils";

const MAX_TX = 8;
const MAX_PEOPLE = 4;

export function usePaletteSearch(debounced: string) {
  const trpc = useTRPC();
  const hasQuery = debounced.length > 0;
  const numeric = /^[\d.,\s]+$/.test(debounced);
  const numericValue = Number(debounced.replace(/\s/g, "").replace(",", "."));

  const categoriesQuery = useQuery({
    ...trpc.category.list.queryOptions(),
    staleTime: 60_000,
  });
  const friendsQuery = useQuery({
    ...trpc.friend.listFriends.queryOptions(),
    staleTime: 60_000,
  });
  const listsQuery = useQuery({
    ...trpc.todo.listLists.queryOptions(),
    staleTime: 60_000,
  });

  const matchedCategories = useMemo(
    () =>
      hasQuery && !numeric
        ? (categoriesQuery.data ?? []).filter((c) => matches(c.name, debounced))
        : [],
    [categoriesQuery.data, debounced, hasQuery, numeric],
  );
  const categoryMap = useMemo(
    () => new Map((categoriesQuery.data ?? []).map((c) => [c.id, c])),
    [categoriesQuery.data],
  );

  const byText = useQuery({
    ...trpc.transaction.listPaginated.queryOptions({
      search: debounced,
      limit: MAX_TX,
    }),
    enabled: hasQuery && !numeric,
    placeholderData: (prev) => prev,
  });
  const byCategory = useQuery({
    ...trpc.transaction.listPaginated.queryOptions({
      categoryId: matchedCategories[0]?.id,
      limit: MAX_TX,
    }),
    enabled: matchedCategories.length > 0,
    placeholderData: (prev) => prev,
  });
  const byAmount = useQuery({
    ...trpc.transaction.listPaginated.queryOptions({ limit: 100 }),
    enabled: hasQuery && numeric && Number.isFinite(numericValue),
    staleTime: 30_000,
  });

  const transactions = useMemo(() => {
    if (!hasQuery) return [];
    const pool = numeric
      ? (byAmount.data?.items ?? []).filter((t) =>
          String(Number(t.amount)).includes(String(numericValue)),
        )
      : [...(byText.data?.items ?? []), ...(byCategory.data?.items ?? [])];
    const seen = new Set<string>();
    return pool
      .filter((t) => (seen.has(t.id) ? false : seen.add(t.id)))
      .slice(0, MAX_TX);
  }, [
    hasQuery,
    numeric,
    numericValue,
    byAmount.data,
    byText.data,
    byCategory.data,
  ]);

  const actions = filterEntries(ACTIONS, debounced);
  const pages = filterEntries(PAGES, debounced);
  const friends = hasQuery
    ? (friendsQuery.data ?? [])
        .filter((f) => matches(f.user.name ?? "", debounced))
        .slice(0, MAX_PEOPLE)
    : [];
  const lists = hasQuery
    ? (listsQuery.data ?? [])
        .filter((l) => matches(l.name, debounced))
        .slice(0, MAX_PEOPLE)
    : [];

  const loading =
    hasQuery &&
    (byText.isFetching || byCategory.isFetching || byAmount.isFetching);
  const total =
    actions.length +
    pages.length +
    transactions.length +
    friends.length +
    lists.length;

  return {
    hasQuery,
    categoryMap,
    transactions,
    actions,
    pages,
    friends,
    lists,
    loading,
    total,
  };
}

export type PaletteSearch = ReturnType<typeof usePaletteSearch>;
