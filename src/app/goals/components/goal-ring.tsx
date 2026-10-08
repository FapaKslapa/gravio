"use client";

import { Check } from "lucide-react";
import { m } from "motion/react";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

type GoalRingProps = {
  percent: number;
  color: string;
  achieved: boolean;
  size?: number;
  className?: string;
};

export function GoalRing({
  percent,
  color,
  achieved,
  size = 72,
  className,
}: GoalRingProps) {
  const stroke = Math.max(6, Math.round(size / 10));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${percent}% raggiunto`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <m.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset:
              circumference * (1 - Math.min(percent, 100) / 100),
          }}
          transition={springs.gentle}
        />
      </svg>
      {achieved && (
        <m.span
          aria-hidden
          className="absolute inset-0 rounded-full border-2"
          style={{ borderColor: color }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.35, opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        {achieved ? (
          <m.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={springs.snappy}
            className="flex size-[44%] items-center justify-center rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            <Check className="size-3/5" strokeWidth={3} aria-hidden />
          </m.span>
        ) : (
          <span
            className="num-display font-bold"
            style={{ fontSize: Math.round(size * 0.24) }}
          >
            {percent}%
          </span>
        )}
      </div>
    </div>
  );
}
