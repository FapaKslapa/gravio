import { ShoppingBasket, UserPlus, Wallet } from "lucide-react";
import type { CardStackItem } from "@/components/ui/card-stack";
import { formatCurrency } from "@/lib/utils";
import { AttentionCard } from "./attention-card";

type ConvertCurrency = (val: number, from: string, to: string) => number;

export type AttentionInput = {
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
  convertCurrency: ConvertCurrency;
};

export function friendItems(
  incoming: { user: { name: string | null } }[],
): CardStackItem[] {
  if (incoming.length === 0) return [];
  const first = incoming[0]?.user.name;
  return [
    {
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
    },
  ];
}

export function budgetItems({
  categories,
  categoryBudgets,
  monthTransactions,
  displayCurrency,
  convertCurrency,
}: AttentionInput): CardStackItem[] {
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
  return overBudget.map((x) => {
    const name = categoryNames.get(x.b.categoryId) ?? "Categoria";
    const over = x.ratio > 1;
    return {
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
    };
  });
}

export function todoItems(todos: AttentionInput["todos"]): CardStackItem[] {
  const toImport = todos.filter(
    (t) => t.completed && !t.convertedToTransactionId,
  ).length;
  if (toImport === 0) return [];
  return [
    {
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
    },
  ];
}
