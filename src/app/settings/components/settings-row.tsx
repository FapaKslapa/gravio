"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { IconTile, type Tone } from "./icon-tile";

type SettingsRowProps = {
  icon?: LucideIcon;
  tone?: Tone;
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  chevron?: boolean;
  htmlFor?: string;
  className?: string;
  children?: React.ReactNode;
};

export function SettingsRow({
  icon,
  tone,
  leading,
  title,
  subtitle,
  trailing,
  onClick,
  selected,
  chevron,
  htmlFor,
  className,
  children,
}: SettingsRowProps) {
  const head = (
    <>
      {leading ?? (icon && <IconTile icon={icon} tone={tone} />)}
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="truncate text-sm font-semibold">{title}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </span>
      {trailing}
      {chevron && (
        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground"
        />
      )}
    </>
  );

  const base = "flex min-h-14 w-full items-center gap-3 px-4 py-2.5";

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-current={selected ? "page" : undefined}
        className={cn(
          base,
          "cursor-pointer outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          selected && "md:bg-brand-soft md:hover:bg-brand-soft",
          className,
        )}
      >
        {head}
      </button>
    );
  }

  const Wrapper = htmlFor ? "label" : "div";
  return (
    <div className={cn("flex flex-col", className)}>
      <Wrapper
        {...(htmlFor ? { htmlFor } : {})}
        className={cn(base, htmlFor && "cursor-pointer")}
      >
        {head}
      </Wrapper>
      {children && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}
