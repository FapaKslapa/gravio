import { parseAmount } from "./numbers-dates";
import type { Columns } from "./pdf-columns";
import type { PdfLine } from "./pdf-items";
import { AMT_FULL, SIGNED_RE, TRAILING_AMT } from "./pdf-patterns";

export type Amt = { raw: string; x?: number };

export function extractAmounts(startRest: string, line: PdfLine) {
  let rest = startRest;
  const amts: Amt[] = [];
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
  return { amts, rest };
}

export function resolveAmount(
  amts: Amt[],
  columns: Columns,
  hasBalance: boolean,
): { amount: number | null; balance?: number; signed: boolean } {
  let balance: number | undefined;
  let target = amts[0];
  if (amts.length >= 2 && (hasBalance || columns.balance)) {
    target = amts[amts.length - 2];
    balance = parseAmount(amts[amts.length - 1].raw) ?? undefined;
  } else if (amts.length >= 2 && columns.debit === undefined) {
    target = amts[0];
    balance = parseAmount(amts[amts.length - 1].raw) ?? undefined;
  }
  let amount: number | null = null;
  let signed = false;
  if (target) {
    amount = parseAmount(target.raw);
    signed = SIGNED_RE.test(target.raw.trim());
    if (
      amount !== null &&
      !signed &&
      columns.debit !== undefined &&
      target.x !== undefined
    ) {
      const dDist = Math.abs(target.x - columns.debit);
      const cDist =
        columns.credit === undefined
          ? Number.POSITIVE_INFINITY
          : Math.abs(target.x - columns.credit);
      amount = dDist < cDist ? -Math.abs(amount) : Math.abs(amount);
      signed = true;
    }
  }
  return { amount, balance, signed };
}
