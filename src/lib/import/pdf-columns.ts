import type { PdfLine } from "./pdf-items";

export type Columns = { debit?: number; credit?: number; balance?: boolean };

export function detectColumns(line: PdfLine): Columns | null {
  const cols: Columns = {};
  let hits = 0;
  for (const it of line.items) {
    const s = it.str.toLowerCase();
    if (/^(dare|uscite|addebiti|debit|ut|ut fra konto|withdrawals?)$/.test(s)) {
      cols.debit = it.x;
      hits++;
    } else if (
      /^(avere|entrate|accrediti|credit|inn|inn pa konto|inn på konto|deposits?)$/.test(
        s,
      )
    ) {
      cols.credit = it.x;
      hits++;
    } else if (/^(saldo|balance)/.test(s)) {
      cols.balance = true;
      hits++;
    }
  }
  return hits >= 1 &&
    /\b(data|date|dato|descrizione|description|beskrivelse|tekst)\b/i.test(
      line.text,
    )
    ? cols
    : null;
}
