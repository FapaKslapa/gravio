"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";
import {
  animate,
  m,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { type ReactNode, useCallback, useRef } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { springs } from "@/lib/motion";

const LEFT_REVEAL = 144;
const RIGHT_REVEAL = 80;
const FLING_VELOCITY = 900;
const FLING_LEFT = 168;
const FLING_RIGHT = 104;

type SwipeRowProps = {
  children: ReactNode;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
};

export function SwipeRow({
  children,
  onEdit,
  onDelete,
  onDuplicate,
}: SwipeRowProps) {
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const openRef = useRef(false);
  const draggedRef = useRef(false);

  const leftOpacity = useTransform(x, [-LEFT_REVEAL, -16, 0], [1, 0.6, 0]);
  const rightOpacity = useTransform(x, [0, 16, RIGHT_REVEAL], [0, 0.6, 1]);

  const settle = useCallback(
    (target: number) => {
      openRef.current = target !== 0;
      animate(x, target, reduceMotion ? { duration: 0 } : springs.snappy);
    },
    [x, reduceMotion],
  );

  const buzz = () => {
    if (typeof navigator !== "undefined") navigator.vibrate?.(12);
  };

  if (!isMobile) return <>{children}</>;

  const run = (fn: () => void) => {
    settle(0);
    fn();
  };

  return (
    <div className="relative overflow-hidden">
      <m.div
        style={{ opacity: rightOpacity }}
        className="absolute inset-y-0 left-0 flex"
        aria-hidden="true"
      >
        <button
          type="button"
          tabIndex={-1}
          onClick={() => run(onEdit)}
          style={{ width: RIGHT_REVEAL }}
          className="flex flex-col items-center justify-center gap-1 bg-brand text-xs font-medium text-primary-foreground"
        >
          <Pencil className="size-4" />
          Modifica
        </button>
      </m.div>
      <m.div
        style={{ opacity: leftOpacity }}
        className="absolute inset-y-0 right-0 flex"
        aria-hidden="true"
      >
        <button
          type="button"
          tabIndex={-1}
          onClick={() => run(onDuplicate)}
          style={{ width: LEFT_REVEAL / 2 }}
          className="flex flex-col items-center justify-center gap-1 bg-muted text-xs font-medium text-foreground"
        >
          <Copy className="size-4" />
          Duplica
        </button>
        <button
          type="button"
          tabIndex={-1}
          onClick={() => run(onDelete)}
          style={{ width: LEFT_REVEAL / 2 }}
          className="flex flex-col items-center justify-center gap-1 bg-destructive text-xs font-medium text-white"
        >
          <Trash2 className="size-4" />
          Elimina
        </button>
      </m.div>
      <m.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -LEFT_REVEAL, right: RIGHT_REVEAL }}
        dragElastic={reduceMotion ? 0 : 0.35}
        dragMomentum={false}
        style={{ x }}
        onDragStart={() => {
          draggedRef.current = true;
        }}
        onDragEnd={(_, info) => {
          const pos = x.get();
          const vx = info.velocity.x;
          setTimeout(() => {
            draggedRef.current = false;
          }, 0);
          if (pos < -FLING_LEFT || (vx < -FLING_VELOCITY && pos < -60)) {
            buzz();
            run(onDelete);
          } else if (pos > FLING_RIGHT || (vx > FLING_VELOCITY && pos > 40)) {
            buzz();
            run(onEdit);
          } else if (pos < -LEFT_REVEAL / 2) {
            settle(-LEFT_REVEAL);
          } else if (pos > RIGHT_REVEAL / 2) {
            settle(RIGHT_REVEAL);
          } else {
            settle(0);
          }
        }}
        onClickCapture={(e) => {
          if (draggedRef.current || openRef.current) {
            e.preventDefault();
            e.stopPropagation();
            if (!draggedRef.current) settle(0);
          }
        }}
        className="relative bg-card"
      >
        {children}
      </m.div>
    </div>
  );
}
