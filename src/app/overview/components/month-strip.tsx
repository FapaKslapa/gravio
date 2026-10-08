"use client";

import { m, useReducedMotion } from "motion/react";
import { springs } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";

type MonthStripProps = {
  daily: number[];
  today: number;
  allowed: number | null;
  displayCurrency: string;
  className?: string;
};

export function MonthStrip({
  daily,
  today,
  allowed,
  displayCurrency,
  className,
}: MonthStripProps) {
  const reduce = useReducedMotion();
  const days = daily.length;
  const past = daily.slice(0, today);
  const peak = Math.max(...past, allowed ? allowed * 1.3 : 0, 1);
  const overDays = allowed ? past.filter((v) => v > allowed + 0.005).length : 0;
  const rows = past.map((value, i) => ({ day: i + 1, value }));
  const total = past.reduce((s, v) => s + v, 0);

  const label = `Spesa giornaliera del mese: ${formatCurrency(total, displayCurrency)} in ${today} giorni${
    allowed
      ? `, ${overDays} ${overDays === 1 ? "giorno" : "giorni"} sopra i ${formatCurrency(allowed, displayCurrency)} consentiti`
      : ""
  }`;

  const axis = [1, 15, days].filter(
    (d, i, a) => a.indexOf(d) === i && Math.abs(d - today) > 2,
  );
  const pos = (d: number) =>
    `${Math.min(Math.max(((d - 0.5) / days) * 100, 4), 96)}%`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="img"
        aria-label={label}
        className="relative flex h-32 items-end gap-[3px] md:h-44 xl:h-56"
      >
        {daily
          .map((value, i) => ({ day: i + 1, value }))
          .map(({ day, value }) => {
            const future = day > today;
            const over = allowed !== null && value > allowed + 0.005;
            const height = future
              ? 30
              : value > 0
                ? Math.max((value / peak) * 100, 4)
                : 2;
            return (
              <div
                key={day}
                className="flex h-full min-w-0 flex-1 items-end justify-center"
              >
                {future ? (
                  <span
                    className="h-[30%] border-l-2 border-dashed border-brand-foreground/40"
                    aria-hidden="true"
                  />
                ) : (
                  <m.span
                    className={cn(
                      "w-full rounded-t-[3px]",
                      over ? "bg-warning" : "bg-brand-foreground",
                      value === 0 && "opacity-50",
                    )}
                    style={{ height: `${height}%`, originY: 1 }}
                    initial={reduce ? false : { scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ ...springs.snappy, delay: (day - 1) * 0.012 }}
                  />
                )}
              </div>
            );
          })}
        {allowed !== null && allowed > 0 && (
          <span
            className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-brand-foreground/70"
            style={{ bottom: `${(allowed / peak) * 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>

      <div className="relative h-8 text-xs font-medium" aria-hidden="true">
        {axis.map((d) => (
          <span
            key={d}
            className="tabular absolute top-0 -translate-x-1/2 opacity-80"
            style={{ left: pos(d) }}
          >
            {d}
          </span>
        ))}
        <span
          className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-0.5 font-semibold"
          style={{ left: pos(today) }}
        >
          <span className="size-2 rounded-full bg-brand-foreground" />
          oggi
        </span>
      </div>

      {allowed !== null && allowed > 0 && (
        <p className="tabular flex items-center gap-2 text-xs opacity-90">
          <span
            className="w-5 border-t-2 border-dashed border-brand-foreground/70"
            aria-hidden="true"
          />
          Spesa giornaliera consentita:{" "}
          {formatCurrency(allowed, displayCurrency)}
        </p>
      )}

      <table className="sr-only">
        <caption>Spesa per giorno</caption>
        <thead>
          <tr>
            <th scope="col">Giorno</th>
            <th scope="col">Speso</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ day, value }) => (
            <tr key={day}>
              <th scope="row">{day}</th>
              <td>{formatCurrency(value, displayCurrency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
