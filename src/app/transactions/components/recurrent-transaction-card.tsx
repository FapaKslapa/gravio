"use client";

import dayjs from "dayjs";
import { cn, formatCurrency } from "@/lib/utils";
import {
  RecurrentActionsMenu,
  RecurrentStatusBadge,
  RecurrentTypeBadge,
} from "./recurrent/recurrent-row-parts";
import {
  type CategoryOption,
  FREQUENCY_LABELS,
  type RecurrentTx,
} from "./recurrent/recurrent-types";
import { CategoryTile } from "./transaction-list-parts";

type RecurrentTransactionCardProps = {
  rt: RecurrentTx;
  category?: CategoryOption;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onEdit: (rt: RecurrentTx) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
};

export function RecurrentTransactionCard({
  rt,
  category,
  onToggleStatus,
  onEdit,
  onDelete,
  isDeletePending,
}: RecurrentTransactionCardProps) {
  const isPaused = rt.status === "paused";

  return (
    <li
      className={cn(
        "flex items-start gap-3 py-3 pl-3 pr-1",
        isPaused && "opacity-70",
      )}
    >
      <CategoryTile category={category} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">
              {rt.description}
            </span>
            <span className="text-xs text-muted-foreground">
              {FREQUENCY_LABELS[rt.frequency]}
            </span>
          </div>
          <span className="tabular whitespace-nowrap text-sm font-semibold">
            {formatCurrency(parseFloat(rt.amount), rt.currency)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <RecurrentTypeBadge type={rt.type} />
          <RecurrentStatusBadge paused={isPaused} />
        </div>
        <dl className="tabular grid grid-cols-2 gap-2 text-xs">
          <div>
            <dt className="text-muted-foreground">Prossimo addebito</dt>
            <dd className="font-medium">
              {isPaused
                ? "Sospesa"
                : rt.nextOccurrence
                  ? dayjs(rt.nextOccurrence).format("DD/MM/YYYY")
                  : "-"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Fine regola</dt>
            <dd className="font-medium">
              {rt.endDate
                ? dayjs(rt.endDate).format("DD/MM/YYYY")
                : "Senza scadenza"}
            </dd>
          </div>
        </dl>
      </div>
      <RecurrentActionsMenu
        rt={rt}
        onToggleStatus={onToggleStatus}
        onEdit={onEdit}
        onDelete={onDelete}
        isDeletePending={isDeletePending}
      />
    </li>
  );
}
