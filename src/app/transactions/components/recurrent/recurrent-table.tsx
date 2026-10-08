import { RecurrentTransactionCard } from "../recurrent-transaction-card";
import { RecurrentTransactionRow } from "../recurrent-transaction-row";
import type { RecurrentTransactionRowProps } from "./recurrent-row-parts";
import type { CategoryOption, RecurrentTx } from "./recurrent-types";

type RowHandlers = Pick<
  RecurrentTransactionRowProps,
  "onToggleStatus" | "onEdit" | "onDelete" | "isDeletePending"
>;

const HEADERS: { label: string; className: string }[] = [
  { label: "Descrizione", className: "px-3 py-3" },
  { label: "Tipo", className: "px-3 py-3" },
  { label: "Stato", className: "px-3 py-3" },
  { label: "Importo", className: "px-3 py-3 text-right" },
  { label: "Frequenza", className: "px-3 py-3" },
  { label: "Scadenza", className: "px-3 py-3" },
  { label: "Prossima esecuzione", className: "px-3 py-3" },
];

export function RecurrentTable({
  items,
  categories,
  ...rowProps
}: RowHandlers & { items: RecurrentTx[]; categories: CategoryOption[] }) {
  return (
    <div className="elevation-1 overflow-hidden rounded-lg bg-card">
      <table className="hidden w-full border-collapse text-left text-sm md:table">
        <caption className="sr-only">Transazioni ricorrenti</caption>
        <thead>
          <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
            {HEADERS.map((h) => (
              <th key={h.label} scope="col" className={h.className}>
                {h.label}
              </th>
            ))}
            <th scope="col" className="w-14 px-3">
              <span className="sr-only">Azioni</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((rt) => (
            <RecurrentTransactionRow
              key={rt.id}
              rt={rt}
              category={categories.find((c) => c.id === rt.categoryId)}
              {...rowProps}
            />
          ))}
        </tbody>
      </table>

      <ul className="divide-y md:hidden">
        {items.map((rt) => (
          <RecurrentTransactionCard
            key={rt.id}
            rt={rt}
            category={categories.find((c) => c.id === rt.categoryId)}
            {...rowProps}
          />
        ))}
      </ul>
    </div>
  );
}
