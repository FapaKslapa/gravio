import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Tone = "brand" | "income" | "expense" | "warning" | "muted";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand",
  income: "bg-income-soft text-income",
  expense: "bg-expense-soft text-expense",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
  muted: "bg-muted text-muted-foreground",
};

export function IconTile({
  icon: Icon,
  tone = "brand",
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-sm [&_svg]:size-[18px]",
        TONES[tone],
        className,
      )}
    >
      <Icon />
    </span>
  );
}
