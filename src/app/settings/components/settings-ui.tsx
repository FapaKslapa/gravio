"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { m } from "motion/react";
import type * as React from "react";
import { fadeUp, springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type Tone = "brand" | "income" | "expense" | "warning" | "muted";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand",
  income: "bg-income-soft text-income",
  expense: "bg-expense-soft text-expense",
  warning: "bg-warning/20 text-warning-foreground dark:text-warning",
  muted: "bg-muted text-muted-foreground",
};

export function IconTile({
  icon: Icon,
  tone = "brand",
  className,
}: {
  icon: LucideIcon;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-sm [&_svg]:size-[18px]",
        TONES[tone],
        className,
      )}
    >
      <Icon />
    </span>
  );
}

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

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  layoutId,
}: {
  value: T | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: LucideIcon }[];
  label: string;
  layoutId: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex w-full gap-1 rounded-full bg-muted p-1"
    >
      {options.map(({ value: v, label: l, icon: Icon }) => {
        const active = v === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: radio personalizzato
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={cn(
              "relative flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <m.span
                layoutId={layoutId}
                transition={springs.snappy}
                className="elevation-1 absolute inset-0 rounded-full bg-card"
              />
            )}
            <span className="relative flex items-center gap-2">
              {Icon && <Icon aria-hidden className="size-4" />}
              {l}
            </span>
          </button>
        );
      })}
    </div>
  );
}
