"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number | ReactNode;
  subtitle?: string | ReactNode;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
  valueClassName?: string;
  delayIndex?: number;
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = "bg-brand-soft",
  iconColor = "text-brand",
  className,
  valueClassName,
  delayIndex = 0,
}: StatCardProps) {
  const text = typeof value === "string" || typeof value === "number";
  const len = text ? String(value).length : 0;

  return (
    <m.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={delayIndex}
      className={cn(
        "elevation-1 flex min-w-0 flex-col justify-between gap-4 rounded-lg bg-card p-4 text-card-foreground",
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <div
          aria-hidden
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-sm [&_svg]:size-4",
            iconBgColor,
            iconColor,
          )}
        >
          {icon}
        </div>
      </div>
      <div className="w-full min-w-0">
        {text ? (
          <p
            className={cn(
              "num-display w-full truncate text-2xl font-bold text-foreground",
              len > 15 && "text-base",
              len > 11 && len <= 15 && "text-lg",
              valueClassName,
            )}
            title={String(value)}
          >
            {value}
          </p>
        ) : (
          value
        )}
        {subtitle && (
          <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </m.div>
  );
}
