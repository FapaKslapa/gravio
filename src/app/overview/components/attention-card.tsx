import { ArrowRight, type Wallet } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "brand" | "warning" | "expense" | "income";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand",
  warning: "bg-warning/25 text-foreground",
  expense: "bg-expense-soft text-expense",
  income: "bg-income-soft text-income",
};

export function AttentionCard({
  Icon,
  tone,
  title,
  detail,
  href,
  action,
}: {
  Icon: typeof Wallet;
  tone: Tone;
  title: string;
  detail: ReactNode;
  href: string;
  action: string;
}) {
  return (
    <div className="flex h-full items-center gap-3 p-4">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          TONES[tone],
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="font-display line-clamp-2 text-base leading-tight font-semibold">
          {title}
        </p>
        <p className="tabular line-clamp-2 text-sm leading-snug text-muted-foreground">
          {detail}
        </p>
      </div>
      <Link
        href={href}
        className="inline-flex h-11 shrink-0 items-center gap-1 rounded-full bg-foreground px-4 text-sm font-semibold text-background active:scale-[0.97]"
      >
        {action}
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
