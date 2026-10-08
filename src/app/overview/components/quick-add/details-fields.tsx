import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "@/components/ui/category-picker";
import { CustomDatePicker } from "@/components/ui/custom-datepicker";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CategoryType, SetField } from "./quick-add-types";

export function DetailsFields({
  categories,
  categoryId,
  suggestedId,
  desc,
  today,
  yesterday,
  effectiveDate,
  set,
}: {
  categories: CategoryType[];
  categoryId: string;
  suggestedId: string | null;
  desc: string;
  today: string;
  yesterday: string;
  effectiveDate: string;
  set: SetField;
}) {
  return (
    <FieldGroup>
      {categories.length > 0 && (
        <Field>
          <FieldLabel>Categoria</FieldLabel>
          <CategoryPicker
            categories={categories}
            value={categoryId}
            onChange={(id) => set("categoryId", id)}
            suggestedId={suggestedId}
          />
        </Field>
      )}

      <Field>
        <FieldLabel>Data</FieldLabel>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={effectiveDate === today ? "secondary" : "outline"}
            aria-pressed={effectiveDate === today}
            className="h-11 rounded-full px-4"
            onClick={() => set("date", "")}
          >
            Oggi
          </Button>
          <Button
            type="button"
            variant={effectiveDate === yesterday ? "secondary" : "outline"}
            aria-pressed={effectiveDate === yesterday}
            className="h-11 rounded-full px-4"
            onClick={() => set("date", yesterday)}
          >
            Ieri
          </Button>
          <CustomDatePicker
            value={effectiveDate}
            max={dayjs().format("YYYY-MM-DD")}
            onChange={(v) => set("date", v)}
            className="min-w-40 flex-1"
            triggerClassName="h-11 text-sm"
          />
        </div>
      </Field>

      <Field>
        <FieldLabel htmlFor="quick-add-desc">Descrizione</FieldLabel>
        <Input
          id="quick-add-desc"
          placeholder="Facoltativa, es. cena fuori"
          value={desc}
          onChange={(e) => set("desc", e.target.value)}
          className="h-11"
        />
      </Field>
    </FieldGroup>
  );
}
