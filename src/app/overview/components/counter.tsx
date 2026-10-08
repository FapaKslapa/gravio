"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { formatCurrency } from "@/lib/utils";

export function Counter({
  value,
  currency,
}: {
  value: number;
  currency: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = formatCurrency(value, currency);
      return;
    }
    const controls = animate(0, value, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = formatCurrency(v, currency);
      },
    });
    return () => controls.stop();
  }, [value, currency, reduce]);

  return (
    <span ref={ref} className="tabular font-bold">
      {formatCurrency(value, currency)}
    </span>
  );
}
