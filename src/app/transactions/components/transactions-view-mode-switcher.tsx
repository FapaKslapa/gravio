"use client";

import { Repeat, Rows3, Table2 } from "lucide-react";
import { m } from "motion/react";
import { useSwipeNav } from "@/hooks/use-swipe-nav";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { ViewMode } from "./transactions-utils";

type PillOption<T extends string> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

export function PillSegments<T extends string>({
  value,
  onChange,
  options,
  layoutId,
  label,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: PillOption<T>[];
  layoutId: string;
  label: string;
  className?: string;
}) {
  const index = options.findIndex((o) => o.value === value);
  const go = (i: number) => {
    const next = options[i];
    if (next) onChange(next.value);
  };
  const { bind, style } = useSwipeNav({
    onPrev: index > 0 ? () => go(index - 1) : undefined,
    onNext: index < options.length - 1 ? () => go(index + 1) : undefined,
  });
  return (
    <m.div
      {...bind}
      style={style}
      role="group"
      aria-label={label}
      className={cn(
        "elevation-1 flex w-full gap-1 rounded-full bg-card p-1 select-none",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]",
              active
                ? "text-brand-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <m.span
                layoutId={layoutId}
                transition={springs.snappy}
                className="absolute inset-0 rounded-full bg-brand"
              />
            )}
            <span className="relative flex items-center gap-1.5 [&_svg]:size-4">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </m.div>
  );
}

const VIEW_MODES: PillOption<ViewMode>[] = [
  { value: "timeline", label: "Timeline", icon: <Rows3 aria-hidden="true" /> },
  { value: "table", label: "Tabella", icon: <Table2 aria-hidden="true" /> },
  {
    value: "recurrent",
    label: "Ricorrenti",
    icon: <Repeat aria-hidden="true" />,
  },
];

interface TransactionsViewModeSwitcherProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function TransactionsViewModeSwitcher({
  viewMode,
  onViewModeChange,
}: TransactionsViewModeSwitcherProps) {
  return (
    <PillSegments
      value={viewMode}
      onChange={onViewModeChange}
      options={VIEW_MODES}
      layoutId="transactions-view-pill"
      label="Vista transazioni"
      className="md:max-w-md"
    />
  );
}
