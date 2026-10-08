import { m } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { LayerDrag } from "./card-stack-drag";
import type { CardStackItem } from "./card-stack-types";

type LayerBodyProps = {
  depth: number;
  isFan: boolean;
  item: CardStackItem;
  drag: LayerDrag;
  onAdvance: () => void;
  children: ReactNode;
};

const SURFACE = "overflow-hidden bg-card elevation-2";

// Surface stays on every layer: only the content fades between top and stacked.
export function SurfaceLayerBody({
  depth,
  isFan,
  item,
  drag,
  onAdvance,
  children,
}: LayerBodyProps) {
  const isTop = depth === 0;
  return (
    <m.div
      className={cn(
        "h-full rounded-2xl",
        SURFACE,
        depth === 1 && "pointer-events-auto cursor-pointer",
        isFan && depth > 0 && "bg-secondary",
        item.layerClassName,
      )}
      style={{ ...item.layerStyle, ...drag.style }}
      {...drag.props}
      onClick={depth === 1 ? onAdvance : undefined}
    >
      <div
        className={cn(
          "h-full transition-opacity duration-200",
          !isTop && "opacity-0",
        )}
        aria-hidden={!isTop}
        inert={!isTop}
      >
        {children}
      </div>
    </m.div>
  );
}

// The top card draws its own face, stacked ones draw a surface placeholder.
// Both swap in the same frame, with no fade, so there is never a see-through gap.
export function BareLayerBody({
  depth,
  isFan,
  item,
  drag,
  onAdvance,
  children,
}: LayerBodyProps) {
  const isTop = depth === 0;
  return (
    <m.div
      className={cn(
        "h-full rounded-2xl",
        isTop ? "overflow-visible" : SURFACE,
        depth === 1 && "pointer-events-auto cursor-pointer",
        isFan && depth > 0 && "bg-secondary",
        !isTop && item.layerClassName,
      )}
      style={{ ...(isTop ? undefined : item.layerStyle), ...drag.style }}
      {...drag.props}
      onClick={depth === 1 ? onAdvance : undefined}
    >
      <div
        className={cn("h-full", !isTop && "opacity-0")}
        aria-hidden={!isTop}
        inert={!isTop}
      >
        {children}
      </div>
    </m.div>
  );
}
