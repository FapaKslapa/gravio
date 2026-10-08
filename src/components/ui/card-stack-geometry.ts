import { INSTANT, SPRING } from "./card-stack-constants";

type GeometryArgs = {
  isFan: boolean;
  depth: number;
  count: number;
  offset: number;
  scaleFactor: number;
  visibleLayers: number;
  fanAngle: number;
  collapsed: boolean;
};

export function layerAnimate({
  isFan,
  depth,
  count,
  offset,
  scaleFactor,
  visibleLayers,
  fanAngle,
  collapsed,
}: GeometryArgs) {
  const geometryDepth = collapsed ? 0 : depth;
  const visible = depth < visibleLayers && !collapsed;
  const common = {
    scale: 1 - geometryDepth * scaleFactor,
    zIndex: count - depth,
  };
  if (isFan) {
    return {
      ...common,
      x: geometryDepth * offset,
      y: geometryDepth * -offset,
      rotate: -Math.min(geometryDepth, visibleLayers) * fanAngle,
      opacity: visible ? 1 : 0,
    };
  }
  return {
    ...common,
    top: geometryDepth * -offset,
    opacity: visible ? 1 - Math.min(depth, 3) * 0.12 : 0,
  };
}

export function layerTransition(reduceMotion: boolean, collapsed: boolean) {
  if (reduceMotion) return INSTANT;
  return {
    ...SPRING,
    opacity: {
      duration: collapsed ? 0.1 : 0.3,
      delay: collapsed ? 0.05 : 0,
    },
  };
}
