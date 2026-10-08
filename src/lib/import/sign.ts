import { cellToString } from "./header";
import { stripAccents } from "./numbers-dates";
import type { Cell } from "./types";

const NEGATIVE_SIGN = new Set([
  "d",
  "db",
  "dr",
  "dare",
  "addebito",
  "debit",
  "debito",
  "uscita",
  "uscite",
  "u",
  "out",
  "-",
  "ut",
  "uttak",
  "kjop",
  "spesa",
  "expense",
  "pagamento",
]);
const POSITIVE_SIGN = new Set([
  "a",
  "c",
  "cr",
  "avere",
  "accredito",
  "credit",
  "credito",
  "entrata",
  "entrate",
  "e",
  "in",
  "+",
  "inn",
  "innskudd",
  "income",
  "incasso",
]);

export function signOf(raw: Cell): -1 | 1 | 0 {
  const t = stripAccents(cellToString(raw)).toLowerCase().replace(/[.\s]/g, "");
  if (!t) return 0;
  if (NEGATIVE_SIGN.has(t)) return -1;
  if (POSITIVE_SIGN.has(t)) return 1;
  return 0;
}
