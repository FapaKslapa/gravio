import { ListChecks, ShoppingBasket } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function TodoListEmpty() {
  return (
    <Empty className="border py-12">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShoppingBasket />
        </EmptyMedia>
        <EmptyTitle>Lista vuota</EmptyTitle>
        <EmptyDescription>
          Scrivi qui sopra il primo articolo e premi invio.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function TodoAllDoneEmpty() {
  return (
    <Empty className="border py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ListChecks />
        </EmptyMedia>
        <EmptyTitle>Tutto comprato</EmptyTitle>
        <EmptyDescription>
          Importa gli articoli completati come spesa, oppure aggiungine di
          nuovi.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
