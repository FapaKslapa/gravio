"use client";

import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

type TodoHeaderProps = {
  onNewList: () => void;
};

export function TodoHeader({ onNewList }: TodoHeaderProps) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-[-0.025em]">
          Liste della spesa
        </h1>
        <p className="hidden text-sm text-muted-foreground md:block">
          Spunta in negozio, poi importa tutto come spesa.
        </p>
      </div>

      <Button
        type="button"
        onClick={onNewList}
        className="h-11 shrink-0 rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand/90"
      >
        <FolderPlus />
        Nuova lista
      </Button>
    </div>
  );
}
