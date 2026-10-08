import { m } from "motion/react";
import { CategorySelect } from "@/components/ui/category-select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { MoneyInput } from "@/components/ui/money-input";
import { springs } from "@/lib/motion";
import type { FormState } from "./todo-form-state";
import type { Category } from "./todo-types";

type TodoFormDetailsProps = {
  categories: Category[];
  categoryId: string;
  amount: string;
  currency: string;
  onField: (field: keyof FormState, value: unknown) => void;
};

export function TodoFormDetails({
  categories,
  categoryId,
  amount,
  currency,
  onField,
}: TodoFormDetailsProps) {
  return (
    <m.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={springs.smooth}
      className="overflow-hidden"
    >
      <div className="flex flex-col gap-2 px-1 pt-1 pb-1 sm:flex-row">
        <div className="sm:w-48">
          <CategorySelect
            value={categoryId}
            onChange={(v) => onField("todoCategoryId", v)}
            categories={categories}
            triggerClassName="h-11 w-full text-sm"
          />
        </div>
        <div className="flex flex-1 items-center gap-2">
          <div className="min-w-0 flex-1">
            <MoneyInput
              value={amount}
              onChange={(v) => onField("todoEstAmount", v)}
              currency={currency}
              placeholder="Prezzo stimato"
              inputClassName="tabular text-sm font-semibold"
            />
          </div>
          <div className="w-20 shrink-0">
            <CurrencySelect
              value={currency}
              onChange={(v) => onField("todoEstCurrency", v)}
              triggerClassName="h-11 w-full text-sm font-semibold"
            />
          </div>
        </div>
      </div>
    </m.div>
  );
}
