"use client";

import dayjs from "dayjs";
import { EllipsisVertical, Pencil, Receipt, Trash2 } from "lucide-react";
import { m } from "motion/react";
import { CategoryIcon } from "@/components/icon-helper";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { fadeUp } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type SharedInfo = {
  id: string;
  payerId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerEmail: string;
  splitAmountNok: string;
  settled: boolean;
  isBorrowed: boolean;
  isPaidByMe: boolean;
};

export type Transaction = {
  id: string;
  userId: string;
  categoryId: string | null;
  description: string | null;
  type: "expense" | "income";
  amount: string;
  amountNok: string;
  amountEur: string;
  currency: string;
  date: string | Date;
  payerName: string | null;
  payerEmail: string | null;
  sharedInfo: SharedInfo | null;
};

type GroupedTransaction = {
  date: string;
  list: Transaction[];
};

type ConvertCurrency = (amount: number, from: string, to: string) => number;

type TransactionListTimelineProps = {
  groupedTx: GroupedTransaction[];
  categories: Category[];
  displayCurrency: string;
  convertCurrency: ConvertCurrency;
  onDeleteClick: (id: string) => void;
  onEditClick: (tx: Transaction) => void;
};

export const FALLBACK_CATEGORY_COLOR = "#8E8E93";

export function resolveDisplayAmount(
  tx: Transaction,
  displayCurrency: string,
  convertCurrency: ConvertCurrency,
): number {
  if (tx.sharedInfo) {
    const splitNok = parseFloat(tx.sharedInfo.splitAmountNok);
    const totalNok = parseFloat(tx.amountNok);
    const myNok = tx.sharedInfo.isBorrowed ? splitNok : totalNok - splitNok;
    return convertCurrency(myNok, "NOK", displayCurrency);
  }
  return convertCurrency(parseFloat(tx.amountEur), "EUR", displayCurrency);
}

export function CategoryTile({
  category,
  size = "md",
}: {
  category?: Category;
  size?: "sm" | "md";
}) {
  const color = category?.color ?? FALLBACK_CATEGORY_COLOR;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md",
        size === "md" ? "size-10" : "size-8",
      )}
      style={{
        backgroundColor: `color-mix(in oklab, ${color} 14%, transparent)`,
        color,
      }}
    >
      <CategoryIcon
        name={category?.icon ?? "Sparkles"}
        size={size === "md" ? 18 : 15}
      />
    </span>
  );
}

export function TransactionActionsMenu({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full text-muted-foreground md:size-9"
          aria-label={`Azioni per ${tx.description || "transazione"}`}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-40">
        <DropdownMenuItem onSelect={() => onEdit(tx)}>
          <Pencil /> Modifica
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={() => onDelete(tx.id)}
        >
          <Trash2 /> Elimina
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AmountBlock({
  tx,
  displayCurrency,
  convertCurrency,
  align = "end",
}: {
  tx: Transaction;
  displayCurrency: string;
  convertCurrency: ConvertCurrency;
  align?: "end" | "start";
}) {
  const isExpense = tx.type === "expense";
  const displayAmount = resolveDisplayAmount(
    tx,
    displayCurrency,
    convertCurrency,
  );

  let hint: string | null = null;
  if (tx.sharedInfo) {
    hint = tx.sharedInfo.isBorrowed
      ? "Tua quota"
      : `Totale ${formatCurrency(
          convertCurrency(parseFloat(tx.amountEur), "EUR", displayCurrency),
          displayCurrency,
        )}`;
  } else if (tx.currency !== displayCurrency) {
    hint = `${tx.amount} ${tx.currency}`;
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        align === "end" ? "items-end text-right" : "items-start",
      )}
    >
      <span
        className={cn(
          "tabular whitespace-nowrap text-sm font-semibold",
          isExpense ? "text-foreground" : "text-income",
        )}
      >
        {isExpense ? "−" : "+"}
        {formatCurrency(displayAmount, displayCurrency)}
      </span>
      {hint && (
        <span className="tabular whitespace-nowrap text-[11px] text-muted-foreground">
          {hint}
        </span>
      )}
    </div>
  );
}

export function TransactionsEmpty() {
  return (
    <Empty className="border py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Receipt />
        </EmptyMedia>
        <EmptyTitle>Nessuna transazione trovata</EmptyTitle>
        <EmptyDescription>
          Nessuna transazione corrisponde ai criteri impostati. Prova a
          modificare o azzerare i filtri.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function dayLabel(date: string | Date) {
  const d = dayjs(date);
  if (d.isSame(dayjs(), "day")) return "Oggi";
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Ieri";
  return d.format("dddd D MMMM");
}

export function TransactionListTimeline({
  groupedTx,
  categories,
  displayCurrency,
  convertCurrency,
  onDeleteClick,
  onEditClick,
}: TransactionListTimelineProps) {
  if (groupedTx.length === 0) return <TransactionsEmpty />;

  return (
    <div className="flex flex-col gap-6">
      {groupedTx.map((group, groupIndex) => {
        const net = group.list.reduce((sum, tx) => {
          const v = resolveDisplayAmount(tx, displayCurrency, convertCurrency);
          return tx.type === "expense" ? sum - v : sum + v;
        }, 0);

        return (
          <m.section
            key={group.date}
            variants={fadeUp}
            custom={groupIndex}
            initial="hidden"
            animate="show"
            aria-label={dayLabel(group.list[0].date)}
          >
            <div className="flex items-baseline justify-between gap-3 px-1 pb-2">
              <h3 className="text-sm font-semibold capitalize text-foreground">
                {dayLabel(group.list[0].date)}
                <span className="ml-2 text-xs font-normal normal-case text-muted-foreground">
                  {dayjs(group.list[0].date).format("D MMM YYYY")}
                </span>
              </h3>
              <span
                className={cn(
                  "tabular text-xs font-semibold",
                  net > 0 ? "text-income" : "text-muted-foreground",
                )}
              >
                {net > 0 ? "+" : net < 0 ? "−" : ""}
                {formatCurrency(Math.abs(net), displayCurrency)}
              </span>
            </div>

            <ul className="elevation-1 divide-y divide-border overflow-hidden rounded-lg bg-card">
              {group.list.map((tx) => {
                const cat = categories.find((c) => c.id === tx.categoryId);
                return (
                  <li
                    key={tx.id}
                    className="relative flex items-center gap-1 pr-1"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 left-1 w-1 rounded-full"
                      style={{
                        backgroundColor: cat?.color ?? FALLBACK_CATEGORY_COLOR,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => onEditClick(tx)}
                      className="flex min-h-16 min-w-0 flex-1 items-center gap-3 py-2.5 pl-4 pr-2 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60"
                    >
                      <CategoryTile category={cat} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-sm font-medium text-foreground">
                          {tx.description || "Transazione"}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {cat ? cat.name : "Generale"}
                          {tx.sharedInfo &&
                            ` · ${
                              tx.sharedInfo.isBorrowed
                                ? `Split da ${tx.payerName || "Amico"}`
                                : `Split con ${tx.sharedInfo.borrowerName}`
                            }`}
                        </span>
                      </span>
                      <AmountBlock
                        tx={tx}
                        displayCurrency={displayCurrency}
                        convertCurrency={convertCurrency}
                      />
                    </button>
                    <TransactionActionsMenu
                      tx={tx}
                      onEdit={onEditClick}
                      onDelete={onDeleteClick}
                    />
                  </li>
                );
              })}
            </ul>
          </m.section>
        );
      })}
    </div>
  );
}
