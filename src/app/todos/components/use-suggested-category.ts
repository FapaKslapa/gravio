import { useMemo } from "react";
import { useCategorySuggestion } from "@/hooks/use-category-suggestion";
import type { BulkTodoItem } from "./todo-bulk-convert-types";

export function useSuggestedCategory(
  txCategoryId: string,
  selectedTodos: BulkTodoItem[],
) {
  const suggest = useCategorySuggestion();
  return useMemo(() => {
    if (txCategoryId) return null;
    const votes = new Map<string, number>();
    for (const todo of selectedTodos) {
      if (todo.categoryId) continue;
      const id = suggest(todo.title);
      if (id) votes.set(id, (votes.get(id) ?? 0) + 1);
    }
    let best: string | null = null;
    let bestN = 0;
    for (const [id, n] of votes) {
      if (n > bestN) {
        best = id;
        bestN = n;
      }
    }
    return best;
  }, [txCategoryId, selectedTodos, suggest]);
}
