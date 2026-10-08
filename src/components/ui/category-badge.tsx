"use client";

import { CategoryIcon } from "@/components/icon-helper";
import { cn } from "@/lib/utils";
import { type PickerCategory, readableInk } from "./category-picker-utils";

export function CategoryBadge({
  cat,
  size = 36,
  className,
}: {
  cat: PickerCategory;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: cat.color,
        color: readableInk(cat.color),
      }}
    >
      <CategoryIcon name={cat.icon} size={Math.round(size * 0.5)} />
    </span>
  );
}
