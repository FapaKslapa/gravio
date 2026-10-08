import { Field, FieldLabel } from "@/components/ui/field";
import { GOAL_ICONS } from "@/lib/schemas/savings-goal";
import { cn } from "@/lib/utils";
import { GOAL_ICON_MAP } from "../goals-helpers";
import type { GoalFormValues } from "./goal-form-types";

type GoalIconFieldProps = {
  value: GoalFormValues["icon"];
  onChange: (icon: GoalFormValues["icon"]) => void;
};

export function GoalIconField({
  value: icon,
  onChange: setIcon,
}: GoalIconFieldProps) {
  return (
    <Field>
      <FieldLabel>Icona</FieldLabel>
      <div className="flex flex-wrap gap-2">
        {GOAL_ICONS.map((key) => {
          const { Icon, label } = GOAL_ICON_MAP[key];
          const active = icon === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={active}
              aria-label={label}
              onClick={() => setIcon(key)}
              className={cn(
                "flex size-11 items-center justify-center rounded-lg border outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                active
                  ? "border-transparent bg-brand text-brand-foreground"
                  : "bg-card text-muted-foreground hover:bg-accent",
              )}
            >
              <Icon className="size-5" aria-hidden />
            </button>
          );
        })}
      </div>
    </Field>
  );
}
