import type { CardStackItem } from "./card-stack-types";

export const SWIPE_DISTANCE = 80;
export const SWIPE_VELOCITY = 500;
export const SPRING = { type: "spring", stiffness: 260, damping: 26 } as const;
export const INSTANT = { duration: 0 } as const;

export const DEFAULT_LABELS = {
  previous: "Precedente",
  dismiss: "Scarta",
  next: "Successivo",
  position: (current: number, total: number, _item: CardStackItem) =>
    `${current} di ${total}`,
};
