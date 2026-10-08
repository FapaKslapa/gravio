import { MONTH_ALT, parseAmount, parseDate } from "./numbers-dates";
import type { RawRow } from "./types";

export type PdfItem = { str: string; x: number; y: number; width: number };
export type PdfLine = { text: string; items: { str: string; x: number }[] };

export function itemsToLines(items: PdfItem[]): PdfLine[] {
  const sorted = items
    .filter((i) => i.str.trim() !== "")
    .sort((a, b) => b.y - a.y || a.x - b.x);
  const groups: PdfItem[][] = [];
  for (const it of sorted) {
    const g = groups[groups.length - 1];
    if (g && Math.abs(g[0].y - it.y) <= 3) g.push(it);
    else groups.push([it]);
  }
  return groups.map((g) => {
    g.sort((a, b) => a.x - b.x);
    let text = "";
    let prevEnd: number | null = null;
    for (const it of g) {
      if (prevEnd !== null) {
        const gap = it.x - prevEnd;
        const charW = it.width / Math.max(it.str.length, 1) || 4;
        if (gap > charW * 0.3) text += gap > charW * 2.5 ? "  " : " ";
      }
      text += it.str;
      prevEnd = it.x + it.width;
    }
    return {
      text: text.trim(),
      items: g.map((i) => ({ str: i.str.trim(), x: i.x })),
    };
  });
}

const AMT =
  "(?:[-+−–]\\s?)?\\(?(?:\\d{1,3}(?:[.,']\\d{3})+|\\d+)[.,]\\d{2}\\)?(?:\\s?[-−–])?(?:\\s?(?:CR|DB|DR)\\b)?";
const TRAILING_AMT = new RegExp(
  `(?:^|\\s)(${AMT})(?:\\s*(?:EUR|NOK|USD|GBP|SEK|DKK|CHF|kr|€))?\\s*$`,
  "i",
);
const AMT_FULL = new RegExp(`^${AMT}$`, "i");

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

function takeDate(s: string): { raw: string; rest: string } | null {
  for (const re of DATE_START) {
    const m = s.match(re);
    if (m) return { raw: m[0], rest: s.slice(m[0].length).trim() };
  }
  return null;
}

const NOISE =
  /^(pagina|page|side)\b|saldo\s+(iniziale|finale|contabile|disponibile|precedente|iniziell|ved)|^totale|^total\b|riporto|\biban\b|estratto conto|kontoutskrift|^data\b.*\b(descrizione|importo|causale)|^dato\b|^date\b.*\b(description|amount)/i;

const EXPENSE_WORDS =
  /\b(pagamento|acquisto|prelievo|addebito|commission|imposta|bollo|utenza|pos|kjop|varekjop|uttak|betaling|purchase|payment|withdrawal|fee|gebyr)\b/i;
const INCOME_WORDS =
  /\b(accredito|stipendio|emolumenti|versamento|rimborso|innskudd|lonn|deposit|salary|refund|a vostro favore)\b/i;

type Columns = { debit?: number; credit?: number; balance?: boolean };

function detectColumns(line: PdfLine): Columns | null {
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

type Pending = {
  date: string;
  description: string;
  amount: number | null;
  signed: boolean;
  balance?: number;
  cont: number;
};

export function parseStatementLines(
  lines: PdfLine[],
  nowYear = new Date().getFullYear(),
): { rows: RawRow[]; warnings: string[] } {
  const warnings: string[] = [];
  const yearCounts = new Map<number, number>();
  for (const l of lines) {
    for (const m of l.text.matchAll(/\b(20\d{2}|19\d{2})\b/g)) {
      const y = +m[1];
      yearCounts.set(y, (yearCounts.get(y) ?? 0) + 1);
    }
  }
  const topYear = [...yearCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const defaultYear = topYear ?? nowYear;
  let yearGuessed = false;

  let columns: Columns = {};
  let hasBalance = false;
  const rows: RawRow[] = [];
  let cur: Pending | null = null;
  let estimatedSigns = 0;
  let dropped = 0;

  const flush = () => {
    if (!cur) return;
    if (cur.amount === null || cur.amount === 0) {
      dropped++;
    } else {
      let amount = cur.amount;
      if (!cur.signed && columns.debit === undefined) {
        const exp = EXPENSE_WORDS.test(cur.description);
        const inc = INCOME_WORDS.test(cur.description);
        if (exp && !inc) {
          amount = -Math.abs(amount);
          estimatedSigns++;
        } else if (inc && !exp) {
          amount = Math.abs(amount);
          estimatedSigns++;
        }
      }
      const row: RawRow = {
        date: cur.date,
        description: cur.description.replace(/\s+/g, " ").trim(),
        amount: Math.round(amount * 100) / 100,
      };
      if (cur.balance !== undefined) row.balance = cur.balance;
      rows.push(row);
    }
    cur = null;
  };

  for (const line of lines) {
    const text = line.text;
    if (!text) continue;

    const cols = detectColumns(line);
    if (cols) {
      columns = cols;
      if (cols.balance) hasBalance = true;
      flush();
      continue;
    }

    const d = takeDate(text);
    if (d && parseDate(d.raw, { defaultYear }) && !NOISE.test(text)) {
      flush();
      if (
        !/\d{4}|[a-z]{3}.*\d{4}/i.test(d.raw) &&
        !/\d[./-]\d{1,2}[./-]\d{2}$/.test(d.raw)
      ) {
        yearGuessed = yearGuessed || topYear === undefined;
      }
      const date = parseDate(d.raw, { defaultYear }) as string;
      let rest = d.rest;
      const second = takeDate(rest);
      if (second && parseDate(second.raw, { defaultYear })) rest = second.rest;

      const amts: { raw: string; x?: number }[] = [];
      for (;;) {
        const m = rest.match(TRAILING_AMT);
        if (!m) break;
        amts.unshift({ raw: m[1] });
        rest = rest.slice(0, m.index).trim();
        if (amts.length >= 3) break;
      }
      for (const a of amts) {
        const it = line.items.find(
          (i) =>
            i.str &&
            AMT_FULL.test(i.str) &&
            parseAmount(i.str) === parseAmount(a.raw),
        );
        if (it) a.x = it.x;
      }

      let amount: number | null = null;
      let balance: number | undefined;
      let signed = false;
      let target = amts[0];
      if (amts.length >= 2 && (hasBalance || columns.balance)) {
        target = amts[amts.length - 2];
        balance = parseAmount(amts[amts.length - 1].raw) ?? undefined;
      } else if (amts.length >= 2 && columns.debit === undefined) {
        target = amts[0];
        balance = parseAmount(amts[amts.length - 1].raw) ?? undefined;
      }
      if (target) {
        amount = parseAmount(target.raw);
        signed = /^[-+−–(]|[-−–)]$|cr$|db$|dr$/i.test(target.raw.trim());
        if (
          amount !== null &&
          !signed &&
          columns.debit !== undefined &&
          target.x !== undefined
        ) {
          const dDist = Math.abs(target.x - columns.debit);
          const cDist =
            columns.credit === undefined
              ? Infinity
              : Math.abs(target.x - columns.credit);
          amount = dDist < cDist ? -Math.abs(amount) : Math.abs(amount);
          signed = true;
        }
      }
      cur = { date, description: rest, amount, signed, balance, cont: 0 };
      continue;
    }

    if (!cur || NOISE.test(text)) {
      if (NOISE.test(text)) flush();
      continue;
    }
    let rest = text;
    if (cur.amount === null) {
      const m = rest.match(TRAILING_AMT);
      if (m) {
        cur.amount = parseAmount(m[1]);
        cur.signed = /^[-+−–(]|[-−–)]$|cr$|db$|dr$/i.test(m[1].trim());
        rest = rest.slice(0, m.index).trim();
      }
    }
    if (cur.cont < 4 && rest) {
      cur.description += ` ${rest}`;
      cur.cont++;
    }
  }
  flush();

  if (dropped > 0)
    warnings.push(
      `${dropped} righe con data ma senza importo riconoscibile sono state ignorate.`,
    );
  if (estimatedSigns > 0) {
    warnings.push(
      `Il segno di ${estimatedSigns} movimenti e' stato stimato dalla descrizione: controlla entrate e uscite.`,
    );
  }
  if (
    rows.length > 0 &&
    !rows.some((r) => r.amount < 0) &&
    columns.debit === undefined
  ) {
    warnings.push(
      "Nessun importo negativo trovato: verifica che entrate e uscite siano corrette.",
    );
  }
  if (yearGuessed)
    warnings.push(`Anno non presente nel documento: usato ${defaultYear}.`);
  if (rows.length === 0)
    warnings.push(
      "Nessun movimento riconosciuto nel PDF: prova con il CSV o l'Excel della banca.",
    );
  return { rows, warnings };
}
