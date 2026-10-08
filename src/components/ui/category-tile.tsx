import { Ban, Check } from "lucide-react";
import { m } from "motion/react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "./category-badge";
import type { PickerCategory } from "./category-picker-utils";

type Props = {
  cat: PickerCategory | null;
  active: boolean;
  tabStop: boolean;
  noneLabel: string;
  onSelect: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
};

export function CategoryTile({
  cat,
  active,
  tabStop,
  noneLabel,
  onSelect,
  onKeyDown,
}: Props) {
  const id = cat?.id ?? "";
  return (
    // biome-ignore lint/a11y/useSemanticElements: tile button acts as radio
    <button
      type="button"
      role="radio"
      aria-checked={active}
      data-cat-id={id}
      tabIndex={tabStop ? 0 : -1}
      onClick={() => onSelect(id)}
      onKeyDown={(e) => onKeyDown(e, id)}
      className={cn(
        "relative flex min-h-[4.5rem] min-w-0 cursor-pointer flex-col items-center justify-start gap-1.5 rounded-md border px-1.5 py-2.5 text-center outline-none transition-[transform,background-color] active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-transparent bg-brand-soft ring-2 ring-brand"
          : "bg-card hover:bg-muted/60",
      )}
    >
      {cat ? (
        <CategoryBadge cat={cat} />
      ) : (
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-full border border-dashed bg-muted text-muted-foreground"
        >
          <Ban className="size-[18px]" />
        </span>
      )}
      <span className="w-full text-balance text-[13px] font-medium leading-tight text-foreground [hyphens:none] [overflow-wrap:normal]">
        {cat ? cat.name : noneLabel}
      </span>
      {active && (
        <m.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={springs.snappy}
          className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground"
        >
          <Check className="size-3" aria-hidden />
        </m.span>
      )}
    </button>
  );
}
