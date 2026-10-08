import { useState } from "react";
import type { PreviewItem } from "./csv-import-types";

export function usePreviewItems() {
  const [items, setItems] = useState<PreviewItem[]>([]);

  const patchItem = (id: number, patch: (i: PreviewItem) => PreviewItem) =>
    setItems((prev) => prev.map((i) => (i.id === id ? patch(i) : i)));

  return {
    items,
    setItems,
    toggle: (id: number, selected: boolean) =>
      patchItem(id, (i) => ({ ...i, selected })),
    toggleAll: (selected: boolean) =>
      setItems((prev) => prev.map((i) => ({ ...i, selected }))),
    flip: (id: number) => patchItem(id, (i) => ({ ...i, amount: -i.amount })),
    flipAll: () =>
      setItems((prev) => prev.map((i) => ({ ...i, amount: -i.amount }))),
    setCategory: (id: number, categoryId: string | null) =>
      patchItem(id, (i) => ({ ...i, categoryId })),
  };
}
