import { cn } from "@/lib/utils";
import type { DateRangePreset, DateRangeValue } from "./datepicker-range";

type Props = {
  presets: DateRangePreset[];
  value: DateRangeValue;
  onSelect: (preset: DateRangePreset) => void;
};

export function DatePresets({ presets, value, onSelect }: Props) {
  return (
    <div className="mx-auto flex w-[calc(var(--cell-size)*7)] flex-wrap gap-1.5">
      {presets.map((p) => {
        const active = p.from === value.from && p.to === value.to;
        return (
          <button
            key={p.label}
            type="button"
            aria-pressed={active}
            onClick={() => onSelect(p)}
            className={cn(
              "inline-flex h-9 cursor-pointer items-center rounded-full border px-3 text-sm outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
              active
                ? "border-transparent bg-brand text-brand-foreground"
                : "bg-card text-foreground hover:bg-muted",
            )}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
