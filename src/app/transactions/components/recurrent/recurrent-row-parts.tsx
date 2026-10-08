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
import { cn } from "@/lib/utils";
import type { CategoryOption, RecurrentTx } from "./recurrent-types";

export type RecurrentTransactionRowProps = {
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
