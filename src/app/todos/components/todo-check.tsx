"use client";

import { m } from "motion/react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

type TodoCheckMarkProps = {
  checked: boolean;
  square?: boolean;
};

export function TodoCheckMark({ checked, square }: TodoCheckMarkProps) {
  return (
    <m.span
      aria-hidden="true"
      animate={{ scale: checked ? [1, 1.18, 1] : 1 }}
      transition={springs.snappy}
      className={cn(
        "flex size-6 shrink-0 items-center justify-center border-2 transition-colors duration-150",
        square ? "rounded-md" : "rounded-full",
        checked
          ? "border-brand bg-brand text-brand-foreground"
          : "border-muted-foreground/60 bg-transparent",
      )}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <m.path
          d="M5 12.5l4.5 4.5L19 7.5"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
          transition={{ ...springs.smooth, delay: checked ? 0.04 : 0 }}
        />
      </svg>
    </m.span>
  );
}
