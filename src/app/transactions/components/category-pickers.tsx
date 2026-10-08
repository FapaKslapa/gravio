import { Check } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import { APPLE_COLORS, CURATED_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <fieldset
      aria-label="Colore categoria"
      className="m-0 grid min-w-0 border-0 grid-cols-7 gap-2"
    >
      {APPLE_COLORS.map((col) => {
        const selected = value === col;
        return (
          <button
            key={col}
            type="button"
            aria-pressed={selected}
            aria-label={`Colore ${col}`}
            onClick={() => onChange(col)}
            className="flex size-11 items-center justify-center rounded-full outline-none transition-transform active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-white transition-shadow",
                selected &&
                  "ring-2 ring-foreground ring-offset-2 ring-offset-background",
              )}
              style={{ backgroundColor: col }}
            >
              {selected && <Check className="size-4" aria-hidden />}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}

export function CategoryIconPicker({
  value,
  color,
  onChange,
}: {
  value: string;
  color: string;
  onChange: (icon: string) => void;
}) {
  return (
    <fieldset
      aria-label="Icona categoria"
      className="m-0 grid min-w-0 border-0 grid-cols-6 gap-2"
    >
      {CURATED_ICONS.map((ico) => {
        const selected = value === ico;
        return (
          <button
            key={ico}
            type="button"
            aria-pressed={selected}
            aria-label={`Icona ${ico}`}
            onClick={() => onChange(ico)}
            className={cn(
              "flex size-11 items-center justify-center rounded-md border outline-none transition-transform active:scale-95 focus-visible:ring-3 focus-visible:ring-ring/50",
              selected ? "border-transparent" : "border-border bg-card",
            )}
            style={
              selected
                ? {
                    backgroundColor: `${color}26`,
                    color,
                    boxShadow: `inset 0 0 0 2px ${color}`,
                  }
                : undefined
            }
          >
            <CategoryIcon name={ico} size={18} />
          </button>
        );
      })}
    </fieldset>
  );
}

export function CategoryPreview({
  name,
  icon,
  color,
}: {
  name: string;
  icon: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-md"
        style={{ backgroundColor: `${color}26`, color }}
      >
        <CategoryIcon name={icon} size={20} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {name.trim() || "Nome categoria"}
        </p>
        <p className="text-xs text-muted-foreground">Anteprima</p>
      </div>
      <span
        className="ml-auto h-6 w-1 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
    </div>
  );
}
