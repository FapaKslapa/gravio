import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { type KeyboardEvent, useEffect, useState } from "react";
import { INSTANT, SPRING } from "./card-stack-constants";
import type { CardStackItem, CardStackProps } from "./card-stack-types";

type Options = Pick<
  CardStackProps,
  | "items"
  | "mode"
  | "swipeHint"
  | "controls"
  | "index"
  | "defaultIndex"
  | "onIndexChange"
  | "onDismiss"
  | "visibleLayers"
>;

export function useCardStack({
  items,
  mode = "loop",
  swipeHint = true,
  controls = "hidden",
  index,
  defaultIndex = 0,
  onIndexChange,
  onDismiss,
  visibleLayers = 3,
}: Options) {
  const reduceMotion = useReducedMotion() ?? false;
  const [innerIndex, setInnerIndex] = useState(defaultIndex);
  const [dismissed, setDismissed] = useState<ReadonlySet<CardStackItem["id"]>>(
    new Set(),
  );
  const [exitDirection, setExitDirection] = useState<0 | 1 | -1>(0);
  const [collapsed, setCollapsed] = useState(false);
  const [hadItems, setHadItems] = useState(false);
  const [hadMany, setHadMany] = useState(false);
  const deckX = useMotionValue(0);
  const canHint = swipeHint && items.length > 1 && !reduceMotion;
  const showControls = controls === "visible" || reduceMotion;

  useEffect(() => {
    if (!canHint) return;
    const hint = animate(deckX, [0, -10, 0], {
      duration: 0.9,
      delay: 0.7,
      ease: [0.4, 0, 0.2, 1],
    });
    return () => hint.stop();
  }, [canHint, deckX]);
  const isDismiss = mode === "dismiss";
  const stack = isDismiss
    ? items.filter((item) => !dismissed.has(item.id))
    : items;
  const count = stack.length;

  const nowHasItems = hadItems || items.length > 0;
  const nowHasMany = hadMany || items.length > 1;
  if (nowHasItems !== hadItems) setHadItems(nowHasItems);
  if (nowHasMany !== hadMany) setHadMany(nowHasMany);

  const current =
    count > 0 ? (((index ?? innerIndex) % count) + count) % count : 0;
  const layers = Math.max(1, Math.min(visibleLayers, count));
  const ordered = stack.map(
    (_, i) => stack[(i + current) % count] as CardStackItem,
  );
  const transition = reduceMotion ? INSTANT : SPRING;

  const goTo = (target: number) => {
    const normalized = ((target % count) + count) % count;
    if (index === undefined) setInnerIndex(normalized);
    onIndexChange?.(normalized);
  };
  const next = () => goTo(current + 1);
  const previous = () => goTo(current - 1);

  const discardTop = (direction: 1 | -1 = 1) => {
    const top = ordered[0];
    if (!top) return;
    setExitDirection(direction);
    setDismissed((prev) => new Set(prev).add(top.id));
    onDismiss?.(top.id);
  };

  const handleSwipe = (direction: 1 | -1) =>
    isDismiss ? discardTop(direction) : next();

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      previous();
    } else if (
      isDismiss &&
      (event.key === "Delete" || event.key === "Backspace")
    ) {
      event.preventDefault();
      discardTop();
    }
  };

  const handleExitComplete = (onEmpty?: () => void) => {
    setExitDirection(0);
    if (count === 0) {
      setCollapsed(true);
      onEmpty?.();
    }
  };

  return {
    reduceMotion,
    deckX,
    showControls,
    isDismiss,
    stack,
    count,
    hidden: !nowHasItems || collapsed,
    nowHasMany,
    current,
    layers,
    ordered,
    transition,
    exitDirection,
    next,
    previous,
    discardTop,
    handleSwipe,
    handleKeyDown,
    handleExitComplete,
  };
}
