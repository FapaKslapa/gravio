"use client";

import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { type PointerEvent, useRef } from "react";
import { springs } from "@/lib/motion";

type SwipeNavOptions = {
  /** Swipe right (finger moves right): go to the previous item. */
  onPrev?: () => void;
  /** Swipe left (finger moves left): go to the next item. */
  onNext?: () => void;
  disabled?: boolean;
  /** Minimum horizontal distance in px (default 56). */
  distance?: number;
  /** Minimum velocity in px/ms for a short flick (default 0.5). */
  velocity?: number;
};

const IGNORE =
  "[data-vaul-no-drag],[data-no-swipe],input,textarea,select,[contenteditable='true'],[role='slider']";
const LOCK_PX = 10;
const RATIO = 1.5;
const MAX_FOLLOW = 36;

type Gesture = {
  id: number;
  x: number;
  y: number;
  t: number;
  locked: boolean;
};

function hasHorizontalScroll(el: HTMLElement) {
  if (el.scrollWidth <= el.clientWidth) return false;
  const ox = getComputedStyle(el).overflowX;
  return ox === "auto" || ox === "scroll";
}

/** True when the gesture started on something that owns horizontal input. */
function startsOnBlocker(target: EventTarget | null, root: HTMLElement) {
  let el = target instanceof HTMLElement ? target : null;
  while (el && el !== root) {
    if (el.matches(IGNORE) || hasHorizontalScroll(el)) return true;
    el = el.parentElement;
  }
  return false;
}

/**
 * Horizontal swipe navigation for touch devices. Spread `bind` on a motion
 * element and pass `x` as its style so content follows the finger slightly.
 * Vertical scroll wins (|dx| must exceed 1.5 * |dy|), mouse is ignored.
 */
export function useSwipeNav({
  onPrev,
  onNext,
  disabled,
  distance = 56,
  velocity = 0.5,
}: SwipeNavOptions) {
  const x = useMotionValue(0);
  const reduce = useReducedMotion();
  const gesture = useRef<Gesture | null>(null);
  const active = !disabled && (onPrev || onNext);

  const reset = () => {
    gesture.current = null;
    if (x.get() !== 0) animate(x, 0, springs.snappy);
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (!active || e.pointerType === "mouse" || !e.isPrimary) return;
    if (startsOnBlocker(e.target, e.currentTarget)) return;
    e.stopPropagation();
    gesture.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      t: e.timeStamp,
      locked: false,
    };
  };

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.locked) {
      if (Math.abs(dy) > LOCK_PX && Math.abs(dy) * RATIO > Math.abs(dx)) {
        gesture.current = null;
        return;
      }
      if (Math.abs(dx) < LOCK_PX || Math.abs(dx) < Math.abs(dy) * RATIO) return;
      g.locked = true;
    }
    if (reduce) return;
    const allowed = dx < 0 ? onNext : onPrev;
    const follow = allowed ? dx * 0.25 : dx * 0.08;
    x.set(Math.max(-MAX_FOLLOW, Math.min(MAX_FOLLOW, follow)));
  };

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    const v = Math.abs(dx) / Math.max(1, e.timeStamp - g.t);
    const horizontal = Math.abs(dx) > Math.abs(dy) * RATIO;
    const far = Math.abs(dx) >= distance;
    const flick = Math.abs(dx) >= 24 && v >= velocity;
    reset();
    if (!g.locked || !horizontal || !(far || flick)) return;
    if (dx < 0) onNext?.();
    else onPrev?.();
  };

  const bind = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: reset,
  };

  return {
    bind,
    x,
    style: active ? { x, touchAction: "pan-y" as const } : { x },
  };
}
