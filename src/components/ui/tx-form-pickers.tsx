"use client";

import {
  CategoryPicker,
  type PickerCategory,
} from "@/components/ui/category-picker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TX_CURRENCIES } from "./tx-currencies";

export function TxCurrencySelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  const list = TX_CURRENCIES.some((c) => c.code === value)
    ? TX_CURRENCIES
    : [...TX_CURRENCIES, { code: value, name: value }];
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="h-11 w-full rounded-lg">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72">
        <SelectGroup>
          {list.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.code} · {c.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function TxCategoryChips({
  categories,
  value,
  onChange,
  generalLabel = "Nessuna categoria",
  label = "Categoria",
  suggestedId,
  onCreateNew,
}: {
  categories: PickerCategory[];
  value: string;
  onChange: (id: string) => void;
  generalLabel?: string;
  label?: string;
  suggestedId?: string | null;
  onCreateNew?: () => void;
}) {
  return (
    <CategoryPicker
      categories={categories}
      value={value}
      onChange={onChange}
      noneLabel={generalLabel}
      label={label}
      suggestedId={suggestedId}
      onCreateNew={onCreateNew}
    />
  );
}
