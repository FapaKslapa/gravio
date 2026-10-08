"use client";

import dayjs from "dayjs";
import { cn, formatCurrency } from "@/lib/utils";
import {
  RecurrentActionsMenu,
  RecurrentStatusBadge,
  type RecurrentTransactionRowProps,
  RecurrentTypeBadge,
} from "./recurrent/recurrent-row-parts";
import { FREQUENCY_LABELS } from "./recurrent/recurrent-types";
import { CategoryTile } from "./transaction-list-timeline";

export function RecurrentTransactionRow({
  rt,
  category,
  onToggleStatus,
  onEdit,
  onDelete,
  isDeletePending,
}: RecurrentTransactionRowProps) {
  const isPaused = rt.status === "paused";

  return (
    <tr
      className={cn(
        "transition-colors hover:bg-muted/40",
        isPaused && "text-muted-foreground",
      )}
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-3">
          <CategoryTile category={category} size="sm" />
          <span className="font-medium text-foreground">{rt.description}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <RecurrentTypeBadge type={rt.type} />
      </td>
      <td className="px-3 py-2.5">
        <RecurrentStatusBadge paused={isPaused} />
      </td>
      <td className="tabular whitespace-nowrap px-3 py-2.5 text-right font-semibold">
        {formatCurrency(parseFloat(rt.amount), rt.currency)}
      </td>
      <td className="px-3 py-2.5">{FREQUENCY_LABELS[rt.frequency]}</td>
      <td className="tabular whitespace-nowrap px-3 py-2.5">
        {rt.endDate ? dayjs(rt.endDate).format("DD/MM/YYYY") : "Nessuna"}
      </td>
      <td className="tabular whitespace-nowrap px-3 py-2.5">
        {isPaused
          ? "Sospesa"
          : rt.nextOccurrence
            ? dayjs(rt.nextOccurrence).format("DD/MM/YYYY")
            : "-"}
      </td>
      <td className="px-2 py-1 text-right">
        <RecurrentActionsMenu
          rt={rt}
          onToggleStatus={onToggleStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeletePending={isDeletePending}
        />
      </td>
    </tr>
  );
}
