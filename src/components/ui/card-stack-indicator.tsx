import { cn } from "@/lib/utils";
import type { CardStackItem } from "./card-stack-types";

type Props = {
  variant: "dots" | "count";
  stack: CardStackItem[];
  current: number;
  count: number;
};

export function CardStackIndicator({ variant, stack, current, count }: Props) {
  return (
    <div aria-hidden className="mt-2 flex h-3 items-center justify-center">
      {variant === "dots" ? (
        <div className="flex gap-1.5">
          {stack.map((item, i) => (
            <span
              key={item.id}
              className={cn(
                "h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none",
                i === current
                  ? "w-4 bg-foreground/50"
                  : "w-1.5 bg-foreground/20",
              )}
            />
          ))}
        </div>
      ) : (
        <span className="text-xs font-medium tabular-nums text-muted-foreground">
          {current + 1}/{count}
        </span>
      )}
    </div>
  );
}
