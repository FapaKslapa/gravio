import {
  dateToIso,
  parseAmount,
  parseDate,
  stripAccents,
} from "./numbers-dates";
import type { Cell, ColumnMapping, RawRow } from "./types";

type Field = keyof ColumnMapping;

const KEYWORDS: Record<Field, { exact: string[]; words: string[] }> = {
  date: {
    exact: [
      "data",
      "date",
      "dato",
      "data operazione",
      "data contabile",
      "data movimento",
      "data registrazione",
      "booking date",
      "transaction date",
      "posting date",
      "bokforingsdato",
      "transaksjonsdato",
      "buchungsdatum",
      "fecha",
    ],
    words: ["data", "date", "dato", "datum", "fecha"],
  },
  description: {
    exact: [
      "descrizione",
      "description",
      "causale",
      "dettagli",
      "dettaglio",
      "movimento",
      "operazione",
      "memo",
      "details",
      "narrative",
      "payee",
      "merchant",
      "forklaring",
      "tekst",
      "beskrivelse",
      "mottaker",
      "transaksjon",
      "note",
      "notes",
      "reference",
      "riferimento",
    ],
    words: [
      "descrizione",
      "description",
      "causale",
      "dettagli",
      "movimento",
      "narrative",
      "payee",
      "merchant",
      "forklaring",
      "beskrivelse",
      "tekst",
      "mottaker",
      "details",
      "memo",
    ],
  },
  amount: {
    exact: [
      "importo",
      "amount",
      "belop",
      "ammontare",
      "valore",
      "value",
      "betrag",
    ],
    words: ["importo", "amount", "belop", "ammontare", "betrag"],
  },
  debit: {
    exact: [
      "dare",
      "uscite",
      "uscita",
      "addebito",
      "addebiti",
      "debit",
      "withdrawal",
      "withdrawals",
      "paid out",
      "money out",
      "ut",
      "ut fra konto",
      "uttak",
      "belast",
    ],
    words: [
      "dare",
      "uscite",
      "addebiti",
      "addebito",
      "debit",
      "withdrawal",
      "uttak",
    ],
  },
  credit: {
    exact: [
      "avere",
      "entrate",
      "entrata",
      "accredito",
      "accrediti",
      "credit",
      "deposit",
      "deposits",
      "paid in",
      "money in",
      "inn",
      "inn pa konto",
      "innskudd",
    ],
    words: [
      "avere",
      "entrate",
      "accrediti",
      "accredito",
      "credit",
      "deposit",
      "innskudd",
    ],
  },
  sign: {
    exact: [
      "segno",
      "d a",
      "dare avere",
      "tipo",
      "tipo movimento",
      "tipo operazione",
      "tipologia",
      "verso",
      "debit credit",
      "credit debit",
      "db cr",
      "cr db",
      "dc",
      "type",
      "transaction type",
      "indicator",
    ],
    words: ["segno", "tipo", "tipologia", "verso", "indicator"],
  },
  currency: {
    exact: [
      "valuta",
      "divisa",
      "currency",
      "cur",
      "ccy",
      "moneta",
      "valutakode",
    ],
    words: ["currency", "divisa", "valutakode"],
  },
  balance: {
    exact: [
      "saldo",
      "balance",
      "saldo contabile",
      "saldo disponibile",
      "running balance",
    ],
    words: ["saldo", "balance"],
  },
};

const DATE_LIKE_HEADER = /^(data|date|dato|datum|fecha)\b|\b(data|date|dato) /;

export function normalizeHeader(h: Cell): string {
  return stripAccents(cellToString(h))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function cellToString(c: Cell): string {
  if (c === null || c === undefined) return "";
  if (c instanceof Date) return dateToIso(c) ?? "";
  return String(c).trim();
}

function headerScore(field: Field, header: string): number {
  if (!header) return 0;
  const kw = KEYWORDS[field];
  if (
    field !== "date" &&
    field !== "currency" &&
    DATE_LIKE_HEADER.test(header)
  ) {
    return 0;
  }
  if (
    field === "date" &&
    /\b(valuta|value)\b/.test(header) &&
    header !== "data valuta"
  ) {
    return 0;
  }
  if (kw.exact.includes(header)) return 10;
  const tokens = header.split(" ");
  if (kw.words.some((w) => tokens.includes(w))) return 5;
  return 0;
}

export function headerRowScore(row: Cell[]): number {
  let hits = 0;
  const fields = Object.keys(KEYWORDS) as Field[];
  for (const cell of row) {
    const h = normalizeHeader(cell);
    if (!h || h.length > 40) continue;
    if (fields.some((f) => headerScore(f, h) > 0)) hits++;
  }
  return hits;
}

export function findHeaderRow(table: Cell[][]): number {
  let best = -1;
  let bestScore = 1;
  const limit = Math.min(table.length, 40);
  for (let i = 0; i < limit; i++) {
    const score = headerRowScore(table[i]);
    if (score > bestScore) {
      best = i;
      bestScore = score;
    }
  }
  return best;
}

type ColumnStats = {
  dateRatio: number;
  amountRatio: number;
  filled: number;
  avgLen: number;
  textRatio: number;
};

function columnStats(rows: Cell[][], col: number): ColumnStats {
  let filled = 0;
  let dates = 0;
  let amounts = 0;
  let text = 0;
  let len = 0;
  for (const r of rows) {
    const c = r[col];
    const s = cellToString(c);
    if (!s) continue;
    filled++;
    len += s.length;
    const isDate =
      c instanceof Date || parseDate(s, { defaultYear: 2000 }) !== null;
    if (isDate && !/^-?\d+([.,]\d+)?$/.test(s)) dates++;
    else if (parseAmount(c as string | number) !== null) amounts++;
    else text++;
  }
  const d = filled || 1;
  return {
    dateRatio: dates / d,
    amountRatio: amounts / d,
    filled,
    avgLen: len / d,
    textRatio: text / d,
  };
}

export function suggestMapping(
  headers: Cell[],
  sampleRows: Cell[][],
): ColumnMapping {
  const mapping: ColumnMapping = {
    date: null,
    description: null,
    amount: null,
    debit: null,
    credit: null,
    sign: null,
    currency: null,
    balance: null,
  };
  const used = new Set<number>();
  const normalized = headers.map(normalizeHeader);
  const order: Field[] = [
    "date",
    "amount",
    "debit",
    "credit",
    "balance",
    "currency",
    "sign",
    "description",
  ];

  for (const field of order) {
    let bestCol = -1;
    let bestScore = 0;
    normalized.forEach((h, i) => {
      if (used.has(i)) return;
      const score = headerScore(field, h);
      if (score > bestScore) {
        bestScore = score;
        bestCol = i;
      }
    });
    if (bestCol >= 0) {
      mapping[field] = bestCol;
      used.add(bestCol);
    }
  }

  const stats = new Map<number, ColumnStats>();
  const stat = (i: number) => {
    let s = stats.get(i);
    if (!s) {
      s = columnStats(sampleRows, i);
      stats.set(i, s);
    }
    return s;
  };
  const cols = Math.max(headers.length, ...sampleRows.map((r) => r.length), 0);
  const free = () =>
    Array.from({ length: cols }, (_, i) => i).filter((i) => !used.has(i));

  if (mapping.date === null) {
    const c = free()
      .filter((i) => stat(i).dateRatio >= 0.6)
      .sort((a, b) => stat(b).dateRatio - stat(a).dateRatio)[0];
    if (c !== undefined) {
      mapping.date = c;
      used.add(c);
    }
  }
  if (
    mapping.amount === null &&
    mapping.debit === null &&
    mapping.credit === null
  ) {
    const numeric = free().filter(
      (i) => stat(i).amountRatio >= 0.6 && stat(i).filled > 0,
    );
    if (numeric.length > 0) {
      mapping.amount = numeric[0];
      used.add(numeric[0]);
      if (mapping.balance === null && numeric.length > 1) {
        mapping.balance = numeric[numeric.length - 1];
        used.add(numeric[numeric.length - 1]);
      }
    }
  }
  if (mapping.description === null) {
    const c = free()
      .filter((i) => stat(i).textRatio >= 0.5)
      .sort((a, b) => stat(b).avgLen - stat(a).avgLen)[0];
    if (c !== undefined) {
      mapping.description = c;
      used.add(c);
    }
  }
  if (mapping.sign === null) {
    const signCol = free().find((i) => {
      const values = sampleRows
        .map((r) => r[i])
        .filter((c) => cellToString(c) !== "");
      if (values.length < 2) return false;
      const signs = values.map(signOf);
      return (
        signs.every((v) => v !== 0) &&
        new Set(signs).size >= 1 &&
        new Set(values.map((v) => cellToString(v).toLowerCase())).size <= 4
      );
    });
    if (signCol !== undefined) {
      mapping.sign = signCol;
      used.add(signCol);
    }
  }
  if (
    mapping.amount !== null &&
    mapping.debit !== null &&
    mapping.credit !== null
  ) {
    mapping.amount = null;
  }
  return mapping;
}

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

function signOf(raw: Cell): -1 | 1 | 0 {
  const t = stripAccents(cellToString(raw)).toLowerCase().replace(/[.\s]/g, "");
  if (!t) return 0;
  if (NEGATIVE_SIGN.has(t)) return -1;
  if (POSITIVE_SIGN.has(t)) return 1;
  return 0;
}

export type ApplyMappingOptions = {
  dayFirst?: boolean;
  defaultCurrency?: string;
};

export function applyMapping(
  rows: Cell[][],
  mapping: ColumnMapping,
  opts: ApplyMappingOptions = {},
): RawRow[] {
  const out: RawRow[] = [];
  if (mapping.date === null) return out;
  const get = (r: Cell[], i: number | null): Cell => (i === null ? null : r[i]);

  for (const r of rows) {
    const date = parseDate(get(r, mapping.date) as string | number | Date, {
      dayFirst: opts.dayFirst,
    });
    if (!date) continue;

    let amount: number | null = null;
    if (mapping.amount !== null) {
      amount = parseAmount(get(r, mapping.amount) as string | number);
    }
    if (
      amount === null &&
      (mapping.debit !== null || mapping.credit !== null)
    ) {
      const debit = parseAmount(get(r, mapping.debit) as string | number);
      const credit = parseAmount(get(r, mapping.credit) as string | number);
      if (debit !== null || credit !== null) {
        amount =
          (credit ? Math.abs(credit) : 0) - (debit ? Math.abs(debit) : 0);
      }
    }
    if (amount === null || amount === 0) continue;
    if (mapping.sign !== null && mapping.amount !== null) {
      const dir = signOf(get(r, mapping.sign));
      if (dir !== 0) amount = dir * Math.abs(amount);
    }

    const description = cellToString(get(r, mapping.description))
      .replace(/\s+/g, " ")
      .trim();
    const row: RawRow = { date, description, amount: round2(amount) };
    const currency = cellToString(get(r, mapping.currency)).toUpperCase();
    if (/^[A-Z]{3}$/.test(currency)) row.currency = currency;
    else if (opts.defaultCurrency) row.currency = opts.defaultCurrency;
    const balance = parseAmount(get(r, mapping.balance) as string | number);
    if (balance !== null) row.balance = balance;
    out.push(row);
  }
  return out;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
