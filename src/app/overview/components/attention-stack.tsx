"use client";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  ArrowRight,
  CalendarClock,
  ShoppingBasket,
  UserPlus,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useMemo } from "react";
import { CardStack, type CardStackItem } from "@/components/ui/card-stack";
import { useTRPC } from "@/lib/trpc/client";
import { cn, formatCurrency } from "@/lib/utils";

type Tone = "brand" | "warning" | "expense" | "income";

const TONES: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand",
  warning: "bg-warning/25 text-foreground",
  expense: "bg-expense-soft text-expense",
  income: "bg-income-soft text-income",
};

type AttentionStackProps = {
  categories: { id: string; name: string }[];
  categoryBudgets: { categoryId: string; amount: string }[];
  monthTransactions: {
    type: string;
    categoryId: string | null;
    amountNok: string;
  }[];
  todos: {
    completed: boolean;
    convertedToTransactionId: string | null;
  }[];
  displayCurrency: string;
  convertCurrency: (val: number, from: string, to: string) => number;
};

function AttentionCard({
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

export function AttentionStack({
  categories,
  categoryBudgets,
  monthTransactions,
  todos,
  displayCurrency,
  convertCurrency,
}: AttentionStackProps) {
  const trpc = useTRPC();
  const { data: pending } = useQuery(
    trpc.friend.listPendingRequests.queryOptions(),
  );
  const { data: recurrents } = useQuery(
    trpc.recurrentTransaction.list.queryOptions(),
  );

  const items = useMemo(() => {
    const result: CardStackItem[] = [];

    const incoming = pending?.incoming ?? [];
    if (incoming.length > 0) {
      const first = incoming[0]?.user.name;
      result.push({
        id: "friends",
        content: (
          <AttentionCard
            Icon={UserPlus}
            tone="brand"
            title={
              incoming.length === 1
                ? "Richiesta di amicizia"
                : `${incoming.length} richieste di amicizia`
            }
            detail={
              incoming.length === 1
                ? `${first} vuole aggiungerti`
                : `${first} e altri in attesa`
            }
            href="/friends"
            action="Rispondi"
          />
        ),
      });
    }

    const overBudget = categoryBudgets
      .map((b) => {
        const limit = parseFloat(b.amount);
        const spent = monthTransactions
          .filter((t) => t.type === "expense" && t.categoryId === b.categoryId)
          .reduce((s, t) => s + parseFloat(t.amountNok), 0);
        return { b, limit, spent, ratio: limit > 0 ? spent / limit : 0 };
      })
      .filter((x) => x.limit > 0 && x.ratio >= 0.8)
      .sort((a, z) => z.ratio - a.ratio);
    const categoryNames = new Map(categories.map((c) => [c.id, c.name]));
    for (const x of overBudget) {
      const name = categoryNames.get(x.b.categoryId) ?? "Categoria";
      const over = x.ratio > 1;
      result.push({
        id: `budget-${x.b.categoryId}`,
        content: (
          <AttentionCard
            Icon={Wallet}
            tone={over ? "expense" : "warning"}
            title={over ? `${name}: oltre budget` : `${name}: quasi al limite`}
            detail={`${formatCurrency(convertCurrency(x.spent, "NOK", displayCurrency), displayCurrency)} su ${formatCurrency(convertCurrency(x.limit, "NOK", displayCurrency), displayCurrency)} (${Math.round(x.ratio * 100)}%)`}
            href="/settings?tab=budget"
            action="Budget"
          />
        ),
      });
    }

    const horizon = dayjs().add(3, "day").endOf("day");
    const due = (recurrents ?? [])
      .filter(
        (r) =>
          r.status === "active" && !dayjs(r.nextOccurrence).isAfter(horizon),
      )
      .sort(
        (a, z) => +new Date(a.nextOccurrence) - +new Date(z.nextOccurrence),
      );
    for (const r of due) {
      const when = dayjs(r.nextOccurrence);
      const days = when.startOf("day").diff(dayjs().startOf("day"), "day");
      const label =
        days <= 0 ? "oggi" : days === 1 ? "domani" : `tra ${days} giorni`;
      result.push({
        id: `recurrent-${r.id}`,
        content: (
          <AttentionCard
            Icon={CalendarClock}
            tone={r.type === "income" ? "income" : "warning"}
            title={r.description}
            detail={`${formatCurrency(parseFloat(r.amount), r.currency)} ${label}`}
            href="/transactions"
            action="Apri"
          />
        ),
      });
    }

    const toImport = todos.filter(
      (t) => t.completed && !t.convertedToTransactionId,
    ).length;
    if (toImport > 0) {
      result.push({
        id: "todos",
        content: (
          <AttentionCard
            Icon={ShoppingBasket}
            tone="income"
            title="Spesa da registrare"
            detail={
              toImport === 1
                ? "1 voce completata non importata"
                : `${toImport} voci completate non importate`
            }
            href="/todos"
            action="Importa"
          />
        ),
      });
    }

    return result;
  }, [
    pending,
    recurrents,
    categories,
    categoryBudgets,
    monthTransactions,
    todos,
    displayCurrency,
    convertCurrency,
  ]);

  if (items.length === 0) return null;

  return (
    <section aria-label="Da sistemare" className="flex flex-col gap-2">
      <h2 className="font-display text-base font-semibold">Da sistemare</h2>
      <CardStack
        key={items.map((i) => i.id).join("|")}
        items={items}
        mode="dismiss"
        controls="visible"
        indicator="none"
        cardHeight="7.5rem"
        ariaLabel="Elementi da sistemare"
      />
    </section>
  );
}
