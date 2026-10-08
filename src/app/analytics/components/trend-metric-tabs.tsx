import { m } from "motion/react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { METRICS, type Metric } from "./trend-metrics";

export function TrendMetricTabs({
  metric,
  onChange,
}: {
  metric: Metric;
  onChange: (metric: Metric) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Metrica del trend"
      className="flex w-full rounded-full bg-muted p-1 sm:w-fit"
    >
      {METRICS.map((x) => {
        const selected = x.id === metric;
        return (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(x.id)}
            className={cn(
              "relative h-11 flex-1 rounded-full px-4 text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:flex-none",
              selected
                ? "text-brand-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {selected && (
              <m.span
                layoutId="trend-metric-pill"
                transition={springs.snappy}
                className="absolute inset-0 rounded-full bg-brand"
              />
            )}
            <span className="relative">{x.label}</span>
          </button>
        );
      })}
    </div>
  );
}
