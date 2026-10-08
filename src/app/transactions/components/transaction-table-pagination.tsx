import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ITEMS_PER_PAGE = 10;

type TransactionTablePaginationProps = {
  totalItems: number;
  currentPage: number;
  onChangePage: (page: number) => void;
};

export function TransactionTablePagination({
  totalItems,
  currentPage,
  onChangePage,
}: TransactionTablePaginationProps) {
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
      <span className="tabular text-xs text-muted-foreground">
        {startItem}–{endItem} di {totalItems}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-11 md:size-9"
          disabled={currentPage === 1}
          onClick={() => onChangePage(currentPage - 1)}
          aria-label="Pagina precedente"
        >
          <ChevronLeft />
        </Button>
        <span className="tabular min-w-12 text-center text-xs font-medium">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-11 md:size-9"
          disabled={currentPage === totalPages}
          onClick={() => onChangePage(currentPage + 1)}
          aria-label="Pagina successiva"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
