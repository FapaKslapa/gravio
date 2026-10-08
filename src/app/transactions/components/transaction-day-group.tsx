import dayjs from "dayjs";
import { m } from "motion/react";
import { fadeUp } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";
import { SwipeRow } from "./swipe-row";
import {
  AmountBlock,
  CategoryTile,
  TransactionActionsMenu,
} from "./transaction-list-parts";
import {
  type Category,
  type ConvertCurrency,
  FALLBACK_CATEGORY_COLOR,
  type GroupedTransaction,
  resolveDisplayAmount,
  type Transaction,
} from "./transaction-list-types";

function dayLabel(date: string | Date) {
  const d = dayjs(date);
  if (d.isSame(dayjs(), "day")) return "Oggi";
  if (d.isSame(dayjs().subtract(1, "day"), "day")) return "Ieri";
  return d.format("dddd D MMMM");
}

type TransactionDayGroupProps = {
  group: GroupedTransaction;
  groupIndex: number;
  categories: Category[];
  displayCurrency: string;
  convertCurrency: ConvertCurrency;
  onDeleteClick: (id: string) => void;
  onEditClick: (tx: Transaction) => void;
  softDelete: (tx: Transaction) => void;
  duplicate: (tx: Transaction) => void;
};

export function TransactionDayGroup({
  group,
  groupIndex,
  categories,
  displayCurrency,
  convertCurrency,
  onDeleteClick,
  onEditClick,
  softDelete,
  duplicate,
}: TransactionDayGroupProps) {
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
            <li key={tx.id}>
              <SwipeRow
                onEdit={() => onEditClick(tx)}
                onDelete={() => softDelete(tx)}
                onDuplicate={() => duplicate(tx)}
              >
                <div className="relative flex items-center gap-1 pr-1">
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-3.5 left-2.5 w-[3px] rounded-full"
                    style={{
                      backgroundColor: cat?.color ?? FALLBACK_CATEGORY_COLOR,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onEditClick(tx)}
                    className="flex min-h-16 min-w-0 flex-1 items-center gap-3 py-2.5 pl-6 pr-2 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60"
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
                    onDuplicate={duplicate}
                  />
                </div>
              </SwipeRow>
            </li>
          );
        })}
      </ul>
    </m.section>
  );
}
