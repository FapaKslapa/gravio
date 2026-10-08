import { normalizeText } from "./numbers-dates";

export type ExistingTx = { date: string; amount: number; description: string };

function dayNumber(iso: string): number {
  return Math.floor(Date.parse(`${iso}T00:00:00Z`) / 86400000);
}

function sameDescription(a: string, b: string): boolean {
  if (a === b) return true;
  if (!a || !b) return true;
  const short = a.length < b.length ? a : b;
  const long = short === a ? b : a;
  return short.length >= 4 && long.includes(short);
}

export function markDuplicates<T extends ExistingTx>(
  rows: T[],
  existing: ExistingTx[],
): (T & { duplicate: boolean })[] {
  const byAmount = new Map<
    number,
    { day: number; desc: string; used: boolean }[]
  >();
  for (const e of existing) {
    const key = Math.round(Math.abs(e.amount) * 100);
    const list = byAmount.get(key) ?? [];
    list.push({
      day: dayNumber(e.date),
      desc: normalizeText(e.description),
      used: false,
    });
    byAmount.set(key, list);
  }
  return rows.map((row) => {
    const candidates = byAmount.get(Math.round(Math.abs(row.amount) * 100));
    const day = dayNumber(row.date);
    const desc = normalizeText(row.description);
    const hit = candidates?.find(
      (c) =>
        !c.used && Math.abs(c.day - day) <= 1 && sameDescription(c.desc, desc),
    );
    if (hit) hit.used = true;
    return { ...row, duplicate: Boolean(hit) };
  });
}
