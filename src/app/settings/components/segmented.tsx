"use client";

import type { LucideIcon } from "lucide-react";
import { m } from "motion/react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  layoutId,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: LucideIcon }[];
  label: string;
  layoutId: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-full gap-1 rounded-full bg-muted p-1"
    >
      {options.map(({ value: v, label: l, icon: Icon }) => {
        const active = v === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: radio personalizzato
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={cn(
              "relative flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <m.span
                layoutId={layoutId}
                transition={springs.snappy}
                className="elevation-1 absolute inset-0 rounded-full bg-card"
              />
            )}
            <span className="relative flex items-center gap-2">
              {Icon && <Icon aria-hidden className="size-4" />}
              {l}
            </span>
          </button>
        );
      })}
    </div>
  );
}
