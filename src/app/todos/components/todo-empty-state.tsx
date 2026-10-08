import { FolderPlus, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function TodoEmptyState({ onNewList }: { onNewList: () => void }) {
  return (
    <Empty className="border py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShoppingBasket />
        </EmptyMedia>
        <EmptyTitle>Nessuna lista</EmptyTitle>
        <EmptyDescription>
          Crea la prima lista per segnare cosa comprare e importarlo poi come
          spesa.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          type="button"
          onClick={onNewList}
          className="h-11 rounded-full bg-brand px-5 text-brand-foreground hover:bg-brand/90"
        >
          <FolderPlus />
          Crea lista
        </Button>
      </EmptyContent>
    </Empty>
  );
}
