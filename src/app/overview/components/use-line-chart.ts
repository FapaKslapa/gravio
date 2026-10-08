import type React from "react";
import { useEffect, useRef, useState } from "react";

export function useChartWidth() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(480);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(240, Math.round(entry.contentRect.width)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { containerRef, width };
}

export function useChartHover(xs: number[], width: number) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  const findClosest = (clientX: number, rect: DOMRect): number | null => {
    const mouseX = ((clientX - rect.left) / rect.width) * width;
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < xs.length; i++) {
      const diff = Math.abs(xs[i] - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = i;
      }
    }
    return minDiff < 30 ? closestIdx : null;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const idx = findClosest(e.clientX, e.currentTarget.getBoundingClientRect());
    setHoveredIndex(idx);
    setTooltipPos(idx !== null ? { x: e.clientX, y: e.clientY } : null);
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    const touch = e.touches[0];
    const idx = findClosest(
      touch.clientX,
      e.currentTarget.getBoundingClientRect(),
    );
    setHoveredIndex(idx);
    setTooltipPos(idx !== null ? { x: touch.clientX, y: touch.clientY } : null);
  };

  const handleLeave = () => {
    setHoveredIndex(null);
    setTooltipPos(null);
  };

  return {
    hoveredIndex,
    tooltipPos,
    handleMouseMove,
    handleTouchMove,
    handleLeave,
  };
}
