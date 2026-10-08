import type { Transition, Variants } from "motion/react";

export const springs = {
  snappy: { type: "spring", stiffness: 520, damping: 34, mass: 0.8 },
  smooth: { type: "spring", stiffness: 350, damping: 35, mass: 1 },
  gentle: { type: "spring", stiffness: 220, damping: 26, mass: 1 },
} satisfies Record<string, Transition>;

export const STAGGER = 0.035;
export const MAX_STAGGER_ITEMS = 8;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      ...springs.gentle,
      delay: Math.min(i, MAX_STAGGER_ITEMS) * STAGGER,
    },
  }),
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: springs.snappy },
};
