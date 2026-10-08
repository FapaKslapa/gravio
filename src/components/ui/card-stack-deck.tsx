import { AnimatePresence, m } from "motion/react";
import { StackLayer } from "./card-stack-layer";
import type { CardStackProps } from "./card-stack-types";
import type { useCardStack } from "./use-card-stack";

type Props = {
  s: ReturnType<typeof useCardStack>;
  offset: number;
  scaleFactor: number;
  cardHeight: string;
  fanAngle: number;
  hideLayers: boolean;
  variant: NonNullable<CardStackProps["variant"]>;
  cardAspectRatio?: string;
  onEmpty?: () => void;
};

export function CardStackDeck({
  s,
  offset,
  scaleFactor,
  cardHeight,
  fanAngle,
  hideLayers,
  variant,
  cardAspectRatio,
  onEmpty,
}: Props) {
  const layerHeight = cardAspectRatio ? "100%" : cardHeight;
  return (
    <m.div
      className="relative w-full"
      onPointerDownCapture={() => s.deckX.stop()}
      style={{
        x: s.deckX,
        ...(cardAspectRatio
          ? { aspectRatio: cardAspectRatio }
          : { height: cardHeight }),
      }}
    >
      <AnimatePresence
        initial={false}
        custom={s.exitDirection}
        onExitComplete={() => s.handleExitComplete(onEmpty)}
      >
        {s.stack.map((item) => (
          <StackLayer
            key={item.id}
            exitDirection={s.exitDirection}
            depth={s.ordered.indexOf(item)}
            count={s.count}
            offset={offset}
            scaleFactor={scaleFactor}
            visibleLayers={s.layers}
            cardHeight={layerHeight}
            variant={variant}
            hideLayers={hideLayers}
            fanAngle={fanAngle}
            reduceMotion={s.reduceMotion}
            onAdvance={s.next}
            onSwipe={s.handleSwipe}
            dismissOnSwipe={s.isDismiss}
            item={item}
          >
            {item.content}
          </StackLayer>
        ))}
      </AnimatePresence>
    </m.div>
  );
}
