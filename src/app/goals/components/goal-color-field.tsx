import { Check } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { APPLE_COLORS } from "@/lib/constants";

export const GOAL_COLORS = APPLE_COLORS.slice(0, 12);

type GoalColorFieldProps = {
  value: string;
  onChange: (color: string) => void;
};

export function GoalColorField({
  value: color,
  onChange: setColor,
}: GoalColorFieldProps) {
  return (
    <Field>
      <FieldLabel>Colore</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {GOAL_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={color === c}
            aria-label={`Colore ${c}`}
            onClick={() => setColor(c)}
            className="flex size-11 items-center justify-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            style={{ backgroundColor: c }}
          >
            {color === c && (
              <Check
                className="size-5 text-white"
                strokeWidth={3}
                aria-hidden
              />
            )}
          </button>
        ))}
      </div>
    </Field>
  );
}
