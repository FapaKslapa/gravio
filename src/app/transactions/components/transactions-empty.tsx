import { Receipt } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function TransactionsEmpty() {
  return (
    <Empty className="border py-14">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Receipt />
        </EmptyMedia>
        <EmptyTitle>Nessuna transazione trovata</EmptyTitle>
        <EmptyDescription>
          Nessuna transazione corrisponde ai criteri impostati. Prova a
          modificare o azzerare i filtri.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
