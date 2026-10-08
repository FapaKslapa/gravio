import { parseAmount, parseDate } from "./numbers-dates";
import { extractAmounts, resolveAmount } from "./pdf-amounts";
import type { Columns } from "./pdf-columns";
import type { PdfLine } from "./pdf-items";
import {
  EXPENSE_WORDS,
  INCOME_WORDS,
  SIGNED_RE,
  TRAILING_AMT,
  takeDate,
} from "./pdf-patterns";
import type { RawRow } from "./types";

export type Pending = {
  date: string;
  description: string;
  amount: number | null;
  signed: boolean;
  balance?: number;
  cont: number;
};

export function startPending(
  line: PdfLine,
  d: { raw: string; rest: string },
  columns: Columns,
  hasBalance: boolean,
  defaultYear: number,
): Pending {
  const date = parseDate(d.raw, { defaultYear }) as string;
  let rest = d.rest;
  const second = takeDate(rest);
  if (second && parseDate(second.raw, { defaultYear })) rest = second.rest;
  const extracted = extractAmounts(rest, line);
  const { amount, balance, signed } = resolveAmount(
    extracted.amts,
    columns,
    hasBalance,
  );
  return {
    date,
    description: extracted.rest,
    amount,
    signed,
    balance,
    cont: 0,
  };
}

export function finalizeRow(
  cur: Pending,
  columns: Columns,
): { row: RawRow | null; estimated: boolean } {
  if (cur.amount === null || cur.amount === 0) {
    return { row: null, estimated: false };
  }
  let amount = cur.amount;
  let estimated = false;
  if (!cur.signed && columns.debit === undefined) {
    const exp = EXPENSE_WORDS.test(cur.description);
    const inc = INCOME_WORDS.test(cur.description);
    if (exp && !inc) {
      amount = -Math.abs(amount);
      estimated = true;
    } else if (inc && !exp) {
      amount = Math.abs(amount);
      estimated = true;
    }
  }
  const row: RawRow = {
    date: cur.date,
    description: cur.description.replace(/\s+/g, " ").trim(),
    amount: Math.round(amount * 100) / 100,
  };
  if (cur.balance !== undefined) row.balance = cur.balance;
  return { row, estimated };
}

export function appendContinuation(cur: Pending, text: string) {
  let rest = text;
  if (cur.amount === null) {
    const m = rest.match(TRAILING_AMT);
    if (m) {
      cur.amount = parseAmount(m[1]);
      cur.signed = SIGNED_RE.test(m[1].trim());
      rest = rest.slice(0, m.index).trim();
    }
  }
  if (cur.cont < 4 && rest) {
    cur.description += ` ${rest}`;
    cur.cont++;
  }
}
