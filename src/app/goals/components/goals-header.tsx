import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GoalsHeader({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold tracking-[-0.025em]">
          Obiettivi
        </h1>
        <p className="hidden text-sm text-muted-foreground md:block">
          Metti da parte un po&apos; alla volta e guarda il traguardo
          avvicinarsi.
        </p>
      </div>
      <Button
        type="button"
        onClick={onNew}
        className="h-11 shrink-0 rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand/90"
      >
        <Plus />
        Nuovo obiettivo
      </Button>
    </div>
  );
}
