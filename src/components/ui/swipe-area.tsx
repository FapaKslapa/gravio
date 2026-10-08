"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { useSwipeNav } from "@/hooks/use-swipe-nav";

type SwipeAreaProps = {
  onPrev?: () => void;
  onNext?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
};

/** Wrapper that turns horizontal touch swipes into prev/next callbacks. */
export function SwipeArea({
  onPrev,
  onNext,
  disabled,
  className,
  children,
}: SwipeAreaProps) {
  const { bind, style } = useSwipeNav({ onPrev, onNext, disabled });
  return (
    <m.div {...bind} style={style} className={className}>
      {children}
    </m.div>
  );
}
