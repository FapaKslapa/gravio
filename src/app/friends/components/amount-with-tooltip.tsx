"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { cn, formatCurrency } from "@/lib/utils";

function formatCompact(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 10_000) return `${(amount / 1_000).toFixed(0)}k`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}k`;
  return amount.toFixed(2);
}

export function AmountWithTooltip({
  amount,
  currency,
  prefix,
  className,
}: {
  amount: number;
  currency: string;
  prefix: string;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const mounted = useIsMounted();

  useEffect(() => {
    if (!visible) return;
    const close = () => setVisible(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [visible]);

  const isRounded = amount >= 1000;
  const full = formatCurrency(amount, currency);

  if (!isRounded) {
    return (
      <span className={cn("tabular", className)}>
        {prefix}
        {full}
      </span>
    );
  }

  const compact = formatCompact(amount);

  return (
    <>
      <button
        type="button"
        className={cn(
          "tabular cursor-help border-0 bg-transparent p-0 font-[inherit] underline decoration-dotted underline-offset-2 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
        aria-label={`${prefix}${full}`}
        onMouseEnter={(e) => {
          setPos({ x: e.clientX, y: e.clientY });
          setVisible(true);
        }}
        onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setPos({ x: e.clientX, y: e.clientY });
          setVisible(true);
        }}
      >
        {prefix}≈{compact} {currency}
      </button>
      {mounted &&
        visible &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[9999] flex flex-col gap-0.5 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-2 text-background elevation-2"
            style={{
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, calc(-100% - 8px))",
            }}
          >
            <span className="text-[11px] font-medium opacity-70">
              Importo esatto
            </span>
            <span className="tabular text-sm font-bold">{full}</span>
          </div>,
          document.body,
        )}
    </>
  );
}
