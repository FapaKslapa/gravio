import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  AnimatePresence,
  animate,
  type HTMLMotionProps,
  type MotionStyle,
  m,
  type PanInfo,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;
const SPRING = { type: "spring", stiffness: 260, damping: 26 } as const;
const INSTANT = { duration: 0 } as const;

const DEFAULT_LABELS = {
  previous: "Precedente",
  dismiss: "Scarta",
  next: "Successivo",
  position: (current: number, total: number, _item: CardStackItem) =>
    `${current} di ${total}`,
};

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

type LayerDrag = {
  style: Pick<MotionStyle, "x" | "rotate">;
  props: Pick<
    HTMLMotionProps<"div">,
    | "drag"
    | "dragDirectionLock"
    | "dragElastic"
    | "dragConstraints"
    | "onDragStart"
    | "onDragEnd"
    | "onClickCapture"
  >;
};

function useLayerDrag({
  isTop,
  reduceMotion,
  dismissOnSwipe,
  onSwipe,
}: {
  isTop: boolean;
  reduceMotion: boolean;
  dismissOnSwipe: boolean;
  onSwipe: (direction: 1 | -1) => void;
}): LayerDrag {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-6, 0, 6]);
  const dragged = useRef(false);

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    setTimeout(() => {
      dragged.current = false;
    }, 60);
    const flicked = Math.abs(info.velocity.x) > SWIPE_VELOCITY;
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || flicked) {
      onSwipe(info.offset.x < 0 ? -1 : 1);
      if (dismissOnSwipe) return;
    }
    animate(x, 0, reduceMotion ? INSTANT : SPRING);
  };

  return {
    style: { x, rotate: reduceMotion ? 0 : rotate },
    props: {
      drag: isTop ? "x" : false,
      dragDirectionLock: true,
      dragElastic: 0.9,
      dragConstraints: { left: 0, right: 0 },
      onDragStart: () => {
        dragged.current = true;
      },
      onDragEnd: handleDragEnd,
      onClickCapture: (event) => {
        if (dragged.current) {
          event.stopPropagation();
          event.preventDefault();
        }
      },
    },
  };
}

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
function SurfaceLayerBody({
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
function BareLayerBody({
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

function StackLayer({
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
  const geometryDepth = collapsed ? 0 : depth;
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
      animate={
        isFan
          ? {
              x: geometryDepth * offset,
              y: geometryDepth * -offset,
              rotate: -Math.min(geometryDepth, visibleLayers) * fanAngle,
              scale: 1 - geometryDepth * scaleFactor,
              zIndex: count - depth,
              opacity: depth < visibleLayers && !collapsed ? 1 : 0,
            }
          : {
              top: geometryDepth * -offset,
              scale: 1 - geometryDepth * scaleFactor,
              zIndex: count - depth,
              opacity:
                depth < visibleLayers && !collapsed
                  ? 1 - Math.min(depth, 3) * 0.12
                  : 0,
            }
      }
      transition={
        reduceMotion
          ? INSTANT
          : {
              ...SPRING,
              opacity: {
                duration: collapsed ? 0.1 : 0.3,
                delay: collapsed ? 0.05 : 0,
              },
            }
      }
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
  const reduceMotion = useReducedMotion() ?? false;
  const [innerIndex, setInnerIndex] = useState(defaultIndex);
  const [dismissed, setDismissed] = useState<ReadonlySet<CardStackItem["id"]>>(
    new Set(),
  );
  const [exitDirection, setExitDirection] = useState<0 | 1 | -1>(0);
  const [collapsed, setCollapsed] = useState(false);
  const hadItems = useRef(false);
  const hadMany = useRef(false);
  const deckX = useMotionValue(0);
  const canHint = swipeHint && items.length > 1 && !reduceMotion;
  const showControls = controls === "visible" || reduceMotion;

  useEffect(() => {
    if (!canHint) return;
    const controls = animate(deckX, [0, -10, 0], {
      duration: 0.9,
      delay: 0.7,
      ease: [0.4, 0, 0.2, 1],
    });
    return () => controls.stop();
  }, [canHint, deckX]);
  const isDismiss = mode === "dismiss";
  const stack = isDismiss
    ? items.filter((item) => !dismissed.has(item.id))
    : items;
  const count = stack.length;

  if (items.length > 0) hadItems.current = true;
  if (items.length > 1) hadMany.current = true;
  if (!hadItems.current || collapsed) return null;
  if (count === 1 && !isDismiss && !hadMany.current) {
    return (
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl bg-card elevation-2 [&>*]:grow",
          className,
        )}
        style={{ minHeight: cardHeight, ...stack[0]?.layerStyle }}
      >
        {stack[0]?.content}
      </div>
    );
  }

  const text = { ...DEFAULT_LABELS, ...labels };
  const current =
    count > 0 ? (((index ?? innerIndex) % count) + count) % count : 0;
  const layers = Math.max(1, Math.min(visibleLayers, count));
  const isFan = variant === "fan";
  const reserve = (layers - 1) * offset;
  const fanRise =
    Math.sin((Math.min(layers - 1, visibleLayers) * fanAngle * Math.PI) / 180) *
    100;
  const layerHeight = cardAspectRatio ? "100%" : cardHeight;
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

  return (
    <div className={className}>
      <m.section
        aria-label={ariaLabel}
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
        initial={false}
        animate={isFan ? undefined : { paddingTop: reserve }}
        transition={transition}
        style={
          isFan
            ? {
                paddingTop: `calc(${reserve}px + ${fanRise}%)`,
                paddingRight: reserve,
              }
            : undefined
        }
      >
        <m.div
          className="relative w-full"
          onPointerDownCapture={() => deckX.stop()}
          style={{
            x: deckX,
            ...(cardAspectRatio
              ? { aspectRatio: cardAspectRatio }
              : { height: cardHeight }),
          }}
        >
          <AnimatePresence
            initial={false}
            custom={exitDirection}
            onExitComplete={() => {
              setExitDirection(0);
              if (count === 0) {
                setCollapsed(true);
                onEmpty?.();
              }
            }}
          >
            {stack.map((item) => (
              <StackLayer
                key={item.id}
                exitDirection={exitDirection}
                depth={ordered.indexOf(item)}
                count={count}
                offset={offset}
                scaleFactor={scaleFactor}
                visibleLayers={layers}
                cardHeight={layerHeight}
                variant={variant}
                hideLayers={hideLayers}
                fanAngle={fanAngle}
                reduceMotion={reduceMotion}
                onAdvance={next}
                onSwipe={handleSwipe}
                dismissOnSwipe={isDismiss}
                item={item}
              >
                {item.content}
              </StackLayer>
            ))}
          </AnimatePresence>
        </m.div>
        <div
          className={cn(
            "flex items-center justify-between gap-2",
            showControls
              ? "mt-2"
              : "sr-only focus-within:not-sr-only focus-within:absolute! focus-within:inset-x-2 focus-within:bottom-2 focus-within:z-50 focus-within:rounded-xl focus-within:bg-card focus-within:p-1 focus-within:shadow-md",
          )}
        >
          {isDismiss ? (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="gap-1"
              onClick={() => discardTop()}
            >
              <X aria-hidden />
              {text.dismiss}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="gap-1"
              onClick={previous}
            >
              <ChevronLeft aria-hidden />
              {text.previous}
            </Button>
          )}
          {count > 1 && (
            <p
              aria-live="polite"
              className={
                showControls
                  ? "text-center text-sm font-medium tabular-nums text-muted-foreground"
                  : "sr-only"
              }
            >
              {text.position(current + 1, count, ordered[0] as CardStackItem)}
            </p>
          )}
          {count > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="gap-1"
              onClick={next}
            >
              {text.next}
              <ChevronRight aria-hidden />
            </Button>
          )}
        </div>
      </m.section>
      {indicator !== "none" &&
        count > 1 &&
        !(showControls && indicator === "count") && (
          <div
            aria-hidden
            className="mt-2 flex h-3 items-center justify-center"
          >
            {indicator === "dots" ? (
              <div className="flex gap-1.5">
                {stack.map((item, i) => (
                  <span
                    key={item.id}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-200 motion-reduce:transition-none",
                      i === current
                        ? "w-4 bg-foreground/50"
                        : "w-1.5 bg-foreground/20",
                    )}
                  />
                ))}
              </div>
            ) : (
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {current + 1}/{count}
              </span>
            )}
          </div>
        )}
    </div>
  );
}
