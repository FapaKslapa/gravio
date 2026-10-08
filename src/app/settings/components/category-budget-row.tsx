import { CategoryIcon } from "@/components/icon-helper";
import { MoneyInput } from "@/components/ui/money-input";
import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS = ["a", "b", "c", "d"];

export function CategoryBudgetSkeleton() {
  return SKELETON_ROWS.map((id) => (
    <div key={id} className="flex min-h-16 items-center gap-3 px-4">
      <Skeleton className="size-9 rounded-sm" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-11 w-32 rounded-md" />
    </div>
  ));
}

type CategoryBudgetRowProps = {
  category: { id: string; name: string; icon: string; color: string };
  value: string;
  currency: string;
  onChange: (val: string) => void;
};

export function CategoryBudgetRow({
  category: cat,
  value,
  currency,
  onChange,
}: CategoryBudgetRowProps) {
  return (
    <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-sm"
          style={{
            backgroundColor: `color-mix(in oklab, ${cat.color} 15%, transparent)`,
            color: cat.color,
          }}
        >
          <CategoryIcon name={cat.icon} size={18} />
        </span>
        <span className="truncate text-sm font-semibold">{cat.name}</span>
      </div>
      <MoneyInput
        label={`Budget ${cat.name}`}
        value={value}
        onChange={onChange}
        currency={currency}
        className="h-11 w-36 shrink-0 px-3"
        inputClassName="text-base"
      />
    </div>
  );
}
