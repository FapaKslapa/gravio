import { ListChecks, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type TodoItemsHeaderProps = {
  listName: string;
  activeCount: number;
  estimatedTotal: number;
  displayCurrency: string;
  canDeleteList: boolean;
  onDeleteList: () => void;
  isSelectionMode: boolean;
  selectedCount: number;
  allSelected: boolean;
  onToggleAllSelectTodos: (selected: boolean) => void;
  onStartSelectionMode: () => void;
  onCancelSelectionMode: () => void;
  onTriggerBulkImport: () => void;
};

export function TodoItemsHeader({
  listName,
  activeCount,
  estimatedTotal,
  displayCurrency,
  canDeleteList,
  onDeleteList,
  isSelectionMode,
  selectedCount,
  allSelected,
  onToggleAllSelectTodos,
  onStartSelectionMode,
  onCancelSelectionMode,
  onTriggerBulkImport,
}: TodoItemsHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <div className="min-w-0">
        <h2 className="font-display truncate text-xl font-bold tracking-tight">
          {listName}
        </h2>
        <p className="text-sm text-muted-foreground">
          <span className="tabular">{activeCount}</span> da comprare
          {estimatedTotal > 0 && (
            <>
              {" · stima "}
              <span className="tabular font-semibold text-foreground">
                {formatCurrency(estimatedTotal, displayCurrency)}
              </span>
            </>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        {isSelectionMode ? (
          <>
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-full px-3.5"
              onClick={() => onToggleAllSelectTodos(!allSelected)}
            >
              {allSelected ? "Nessuno" : "Tutti"}
            </Button>
            <Button
              type="button"
              className="h-11 rounded-full bg-brand px-4 text-brand-foreground hover:bg-brand/90"
              disabled={selectedCount === 0}
              onClick={onTriggerBulkImport}
            >
              <Sparkles />
              Importa <span className="tabular">({selectedCount})</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-full px-3.5"
              onClick={onCancelSelectionMode}
            >
              Annulla
            </Button>
          </>
        ) : (
          <>
            {activeCount > 0 && (
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full px-4"
                onClick={onStartSelectionMode}
              >
                <ListChecks />
                Seleziona
              </Button>
            )}
            {canDeleteList && (
              <Button
                type="button"
                variant="ghost"
                className="size-11 rounded-full text-muted-foreground hover:text-destructive"
                aria-label={`Elimina lista ${listName}`}
                onClick={onDeleteList}
              >
                <Trash2 />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
