import type { RawRow } from "./types";

export function statementWarnings(info: {
  dropped: number;
  estimatedSigns: number;
  rows: RawRow[];
  hasDebitColumn: boolean;
  yearGuessed: boolean;
  defaultYear: number;
}): string[] {
  const warnings: string[] = [];
  if (info.dropped > 0)
    warnings.push(
      `${info.dropped} righe con data ma senza importo riconoscibile sono state ignorate.`,
    );
  if (info.estimatedSigns > 0) {
    warnings.push(
      `Il segno di ${info.estimatedSigns} movimenti e' stato stimato dalla descrizione: controlla entrate e uscite.`,
    );
  }
  if (
    info.rows.length > 0 &&
    !info.rows.some((r) => r.amount < 0) &&
    !info.hasDebitColumn
  ) {
    warnings.push(
      "Nessun importo negativo trovato: verifica che entrate e uscite siano corrette.",
    );
  }
  if (info.yearGuessed)
    warnings.push(
      `Anno non presente nel documento: usato ${info.defaultYear}.`,
    );
  if (info.rows.length === 0)
    warnings.push(
      "Nessun movimento riconosciuto nel PDF: prova con il CSV o l'Excel della banca.",
    );
  return warnings;
}
