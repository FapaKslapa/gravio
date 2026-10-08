import { MONTH_ALT } from "./numbers-dates";

const AMT =
  "(?:[-+−–]\\s?)?\\(?(?:\\d{1,3}(?:[.,']\\d{3})+|\\d+)[.,]\\d{2}\\)?(?:\\s?[-−–])?(?:\\s?(?:CR|DB|DR)\\b)?";
export const TRAILING_AMT = new RegExp(
  `(?:^|\\s)(${AMT})(?:\\s*(?:EUR|NOK|USD|GBP|SEK|DKK|CHF|kr|€))?\\s*$`,
  "i",
);
export const AMT_FULL = new RegExp(`^${AMT}$`, "i");

const DATE_START = [
  /^\d{4}-\d{2}-\d{2}/,
  /^\d{1,2}[./-]\d{1,2}[./-]\d{4}(?!\d)/,
  /^\d{1,2}[./-]\d{1,2}[./-]\d{2}(?![\d])/,
  new RegExp(
    `^\\d{1,2}\\s+(?:${MONTH_ALT})[a-z]*\\.?(?:\\s+\\d{4})?(?![\\w])`,
    "i",
  ),
  /^\d{1,2}[./-]\d{1,2}(?![\d./-])/,
];

export function takeDate(s: string): { raw: string; rest: string } | null {
  for (const re of DATE_START) {
    const m = s.match(re);
    if (m) return { raw: m[0], rest: s.slice(m[0].length).trim() };
  }
  return null;
}

export const NOISE =
  /^(pagina|page|side)\b|saldo\s+(iniziale|finale|contabile|disponibile|precedente|iniziell|ved)|^totale|^total\b|riporto|\biban\b|estratto conto|kontoutskrift|^data\b.*\b(descrizione|importo|causale)|^dato\b|^date\b.*\b(description|amount)/i;

export const EXPENSE_WORDS =
  /\b(pagamento|acquisto|prelievo|addebito|commission|imposta|bollo|utenza|pos|kjop|varekjop|uttak|betaling|purchase|payment|withdrawal|fee|gebyr)\b/i;
export const INCOME_WORDS =
  /\b(accredito|stipendio|emolumenti|versamento|rimborso|innskudd|lonn|deposit|salary|refund|a vostro favore)\b/i;

export const SIGNED_RE = /^[-+−–(]|[-−–)]$|cr$|db$|dr$/i;
