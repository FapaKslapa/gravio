import {
  animate,
  type HTMLMotionProps,
  type MotionStyle,
  type PanInfo,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import {
  INSTANT,
  SPRING,
  SWIPE_DISTANCE,
  SWIPE_VELOCITY,
} from "./card-stack-constants";

export type LayerDrag = {
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

export function useLayerDrag({
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
