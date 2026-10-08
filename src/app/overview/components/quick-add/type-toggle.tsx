import { cn } from "@/lib/utils";
import { type FormState, TYPES } from "./quick-add-types";

export function TypeToggle({
  type,
  onChange,
}: {
  type: FormState["type"];
  onChange: (type: FormState["type"]) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Tipo di operazione"
      className="grid h-11 grid-cols-2 gap-1 rounded-full bg-muted p-1"
    >
      {TYPES.map(({ value, label, Icon }) => {
        const active = type === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: segmented radio
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-colors active:scale-[0.97]",
              active
                ? value === "expense"
                  ? "bg-expense text-background"
                  : "bg-income text-background"
                : "text-muted-foreground",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
