import { CategoryPicker } from "@/components/ui/category-picker";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldLabel } from "@/components/ui/field";
import type { BulkCategory } from "./todo-bulk-convert-types";

type BulkCategoryDateProps = {
  categories: BulkCategory[];
  categoryId: string;
  suggestedId: string | null;
  date: string;
  onCategory: (val: string) => void;
  onDate: (val: string) => void;
};

export function BulkCategoryDate({
  categories,
  categoryId,
  suggestedId,
  date,
  onCategory,
  onDate,
}: BulkCategoryDateProps) {
  return (
    <div className="grid grid-cols-1 gap-5">
      <Field>
        <FieldLabel>Categoria</FieldLabel>
        <CategoryPicker
          categories={categories}
          value={categoryId}
          onChange={onCategory}
          suggestedId={suggestedId}
        />
      </Field>
      <Field>
        <FieldLabel>Data della spesa</FieldLabel>
        <CustomDatePicker value={date} onChange={onDate} />
      </Field>
    </div>
  );
}
