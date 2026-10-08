import { m } from "motion/react";
import { cn } from "@/lib/utils";
import { DEFAULT_LABELS } from "./card-stack-constants";
import { CardStackControls } from "./card-stack-controls";
import { CardStackDeck } from "./card-stack-deck";
import { CardStackIndicator } from "./card-stack-indicator";
import { CardStackSingle } from "./card-stack-single";
import type { CardStackItem, CardStackProps } from "./card-stack-types";
import { useCardStack } from "./use-card-stack";

export type {
  CardStackControls,
  CardStackIndicator,
  CardStackItem,
  CardStackLabels,
  CardStackMode,
  CardStackProps,
  CardStackVariant,
} from "./card-stack-types";

export function CardStack({
  items,
  mode = "loop",
  variant = "stack",
  swipeHint = true,
  hideLayers = false,
  fanAngle = 2.5,
  cardAspectRatio,
  onDismiss,
  onEmpty,
  offset = variant === "fan" ? 7 : 10,
  scaleFactor = variant === "fan" ? 0.02 : 0.06,
  visibleLayers = 3,
  cardHeight = "12rem",
  controls = "hidden",
  indicator = "dots",
  labels,
  ariaLabel,
  index,
  defaultIndex = 0,
  onIndexChange,
  className,
}: CardStackProps) {
  const s = useCardStack({
    items,
    mode,
    swipeHint,
    controls,
    index,
    defaultIndex,
    onIndexChange,
    onDismiss,
    visibleLayers,
  });
  const { stack, count, ordered, current, showControls, isDismiss } = s;

  if (s.hidden) return null;
  if (count === 1 && !isDismiss && !s.nowHasMany) {
    return (
      <CardStackSingle
        className={className}
        minHeight={cardHeight}
        layerStyle={stack[0]?.layerStyle}
      >
        {stack[0]?.content}
      </CardStackSingle>
    );
  }

  const text = { ...DEFAULT_LABELS, ...labels };
  const isFan = variant === "fan";
  const reserve = (s.layers - 1) * offset;
  const fanRise =
    Math.sin(
      (Math.min(s.layers - 1, visibleLayers) * fanAngle * Math.PI) / 180,
    ) * 100;

  return (
    <div className={className}>
      <m.section
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={s.handleKeyDown}
        className={cn(
          "relative rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        initial={false}
        animate={isFan ? undefined : { paddingTop: reserve }}
        transition={s.transition}
        style={
          isFan
            ? {
                paddingTop: `calc(${reserve}px + ${fanRise}%)`,
                paddingRight: reserve,
              }
            : undefined
        }
      >
        <CardStackDeck
          s={s}
          offset={offset}
          scaleFactor={scaleFactor}
          cardHeight={cardHeight}
          fanAngle={fanAngle}
          hideLayers={hideLayers}
          variant={variant}
          cardAspectRatio={cardAspectRatio}
          onEmpty={onEmpty}
        />
        <CardStackControls
          text={text}
          isDismiss={isDismiss}
          showControls={showControls}
          count={count}
          current={current}
          top={ordered[0] as CardStackItem}
          onDiscard={() => s.discardTop()}
          onPrevious={s.previous}
          onNext={s.next}
        />
      </m.section>
      {indicator !== "none" &&
        count > 1 &&
        !(showControls && indicator === "count") && (
          <CardStackIndicator
            variant={indicator}
            stack={stack}
            current={current}
            count={count}
          />
        )}
    </div>
  );
}
