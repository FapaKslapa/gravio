import type { ColumnMapping } from "@/lib/import";

export function isMappingValid(m: ColumnMapping): boolean {
  return (
    m.date !== null &&
    (m.amount !== null || m.debit !== null || m.credit !== null)
  );
}
