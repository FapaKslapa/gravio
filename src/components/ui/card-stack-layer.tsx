import { m } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BareLayerBody, SurfaceLayerBody } from "./card-stack-bodies";
import { useLayerDrag } from "./card-stack-drag";
import { layerAnimate, layerTransition } from "./card-stack-geometry";
import type { CardStackItem, CardStackVariant } from "./card-stack-types";

type StackLayerProps = {
  depth: number;
  count: number;
  offset: number;
  scaleFactor: number;
  visibleLayers: number;
  cardHeight: string;
  variant: CardStackVariant;
  hideLayers: boolean;
  fanAngle: number;
  reduceMotion: boolean;
  onAdvance: () => void;
  onSwipe: (direction: 1 | -1) => void;
  dismissOnSwipe: boolean;
  exitDirection: 0 | 1 | -1 | 2;
  item: CardStackItem;
  children: ReactNode;
};

const exitVariants = {
  exit: (direction: 0 | 1 | -1 | 2) =>
    direction === 0 || direction === 2
      ? { opacity: 0, transition: { duration: 0 } }
      : { x: direction * 360, rotate: direction * 14, opacity: 0 },
};

export function StackLayer({
  depth,
  count,
  offset,
  scaleFactor,
  visibleLayers,
  cardHeight,
  variant,
  hideLayers,
  fanAngle,
  reduceMotion,
  onAdvance,
  onSwipe,
  dismissOnSwipe,
  exitDirection,
  item,
  children,
}: StackLayerProps) {
  const drag = useLayerDrag({
    isTop: depth === 0,
    reduceMotion,
    dismissOnSwipe,
    onSwipe,
  });
  const isFan = variant === "fan";
  const collapsed = hideLayers && depth > 0;
  const Body = item.bare ? BareLayerBody : SurfaceLayerBody;

  return (
    <m.div
      className={cn(
        "absolute inset-x-0 top-0",
        depth !== 0 && "pointer-events-none",
      )}
      style={{
        height: cardHeight,
        transformOrigin: isFan ? "0% 100%" : "top center",
      }}
      initial={false}
      variants={exitVariants}
      custom={exitDirection}
      exit="exit"
      animate={layerAnimate({
        isFan,
        depth,
        count,
        offset,
        scaleFactor,
        visibleLayers,
        fanAngle,
        collapsed,
      })}
      transition={layerTransition(reduceMotion, collapsed)}
    >
      <Body
        depth={depth}
        isFan={isFan}
        item={item}
        drag={drag}
        onAdvance={onAdvance}
      >
        {children}
      </Body>
    </m.div>
  );
}
