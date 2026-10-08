"use client";

import { EllipsisVertical, FileSpreadsheet, Plus, Tags } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionsPageHeaderProps {
  onNewTransaction: () => void;
  onImportCsv: () => void;
  onManageCategories: () => void;
  extraActions?: ReactNode;
}

export function TransactionsPageHeader({
  onNewTransaction,
  onImportCsv,
  onManageCategories,
  extraActions,
}: TransactionsPageHeaderProps) {
  return (
    <header className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-col">
        <h1 className="font-display text-2xl font-bold tracking-[-0.025em]">
          Transazioni
        </h1>
        <p className="hidden text-sm text-muted-foreground md:block">
          Visualizza, filtra o importa le tue spese ed entrate
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {extraActions}
        <Button
          onClick={onNewTransaction}
          className="h-11 gap-1.5 rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand/90 active:scale-[0.97]"
        >
          <Plus data-icon="inline-start" />
          <span className="hidden sm:inline">Nuova transazione</span>
          <span className="sm:hidden">Nuova</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="size-11 rounded-full"
              aria-label="Altre azioni"
            >
              <EllipsisVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <DropdownMenuItem onSelect={onImportCsv}>
              <FileSpreadsheet /> Importa estratto conto
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onManageCategories}>
              <Tags /> Gestisci categorie
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
