"use client";

import dayjs from "dayjs";
import { EllipsisVertical, Pause, Pencil, Play, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatCurrency } from "@/lib/utils";
import { CategoryTile } from "./transaction-list-timeline";

export type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type RecurrentTx = {
  id: string;
  description: string;
  amount: string;
  currency: string;
  categoryId: string | null;
  type: string;
  frequency: string;
  startDate: Date | string;
  endDate: Date | string | null;
  status: string;
  nextOccurrence?: Date | string | null;
};

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Giornaliero",
  weekly: "Settimanale",
  monthly: "Mensile",
  yearly: "Annuale",
};

type RecurrentTransactionRowProps = {
  rt: RecurrentTx;
  category?: CategoryOption;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onEdit: (rt: RecurrentTx) => void;
  onDelete: (id: string) => void;
  isDeletePending: boolean;
};

export function RecurrentActionsMenu({
  rt,
  onToggleStatus,
  onEdit,
  onDelete,
  isDeletePending,
}: Omit<RecurrentTransactionRowProps, "category">) {
  const isPaused = rt.status === "paused";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 rounded-full text-muted-foreground md:size-9"
          aria-label={`Azioni per ${rt.description}`}
        >
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem onSelect={() => onToggleStatus(rt.id, rt.status)}>
          {isPaused ? <Play /> : <Pause />}
          {isPaused ? "Attiva" : "Sospendi"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onEdit(rt)}>
          <Pencil /> Modifica
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          disabled={isDeletePending}
          onSelect={() => onDelete(rt.id)}
        >
          <Trash2 /> Elimina
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RecurrentTypeBadge({ type }: { type: string }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        type === "income"
          ? "bg-income-soft text-income"
          : "bg-expense-soft text-expense",
      )}
    >
      {type === "income" ? "Entrata" : "Spesa"}
    </Badge>
  );
}

export function RecurrentStatusBadge({ paused }: { paused: boolean }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        paused
          ? "bg-muted text-muted-foreground"
          : "bg-brand-soft text-foreground",
      )}
    >
      {paused ? "Sospeso" : "Attivo"}
    </Badge>
  );
}

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
