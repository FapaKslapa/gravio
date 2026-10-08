import type { CSSProperties, ReactNode } from "react";

export type CardStackItem = {
  id: number | string;
  content: ReactNode;
  layerClassName?: string;
  layerStyle?: CSSProperties;
  bare?: boolean;
};

export type CardStackMode = "loop" | "dismiss";
export type CardStackIndicator = "dots" | "count" | "none";
export type CardStackVariant = "stack" | "fan";
export type CardStackControls = "hidden" | "visible";

export type CardStackLabels = {
  previous?: string;
  dismiss?: string;
  next?: string;
  position?: (current: number, total: number, item: CardStackItem) => string;
};

export type CardStackProps = {
  items: CardStackItem[];
  mode?: CardStackMode;
  variant?: CardStackVariant;
  swipeHint?: boolean;
  hideLayers?: boolean;
  fanAngle?: number;
  cardAspectRatio?: string;
  onDismiss?: (id: CardStackItem["id"]) => void;
  onEmpty?: () => void;
  offset?: number;
  scaleFactor?: number;
  visibleLayers?: number;
  cardHeight?: string;
  controls?: CardStackControls;
  indicator?: CardStackIndicator;
  labels?: CardStackLabels;
  ariaLabel?: string;
  index?: number;
  defaultIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
};
