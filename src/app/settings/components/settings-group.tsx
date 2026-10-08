"use client";

import { m } from "motion/react";
import type * as React from "react";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function SettingsGroup({
  title,
  description,
  index = 0,
  className,
  children,
}: {
  title?: string;
  description?: string;
  index?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <m.section
      variants={fadeUp}
      initial="hidden"
      animate="show"
      custom={index}
      className={cn("flex flex-col gap-2", className)}
    >
      {title && (
        <h3 className="px-4 text-sm font-semibold text-muted-foreground">
          {title}
        </h3>
      )}
      <div className="elevation-1 divide-y divide-border overflow-hidden rounded-lg bg-card">
        {children}
      </div>
      {description && (
        <p className="px-4 text-xs text-muted-foreground">{description}</p>
      )}
    </m.section>
  );
}
