import { normalizeText } from "./numbers-dates";

export type HistoryItem = { description: string; categoryId: string | null };

const STOP = new Set([
  "pagamento",
  "pagam",
  "carta",
  "pos",
  "bonifico",
  "addebito",
  "sepa",
  "visa",
  "mastercard",
  "card",
  "kort",
  "varekjop",
  "betaling",
  "payment",
  "purchase",
  "debit",
  "credit",
  "transaction",
  "del",
  "dal",
  "per",
  "con",
  "the",
  "and",
  "eur",
  "nok",
  "srl",
  "spa",
  "ltd",
  "via",
  "a",
  "da",
  "operazione",
  "acquisto",
  "contactless",
  "online",
  "nett",
  "til",
  "fra",
  "kortkjop",
  "avtalegiro",
]);

export function tokenize(description: string): string[] {
  const out = new Set<string>();
  for (const t of normalizeText(description).split(" ")) {
    if (t.length < 3 || STOP.has(t)) continue;
    if (/\d/.test(t) && t.replace(/\D/g, "").length >= 3) continue;
    out.add(t);
  }
  return [...out];
}

type Index = {
  exact: Map<string, Map<string, number>>;
  tokens: Map<string, Map<string, number>>;
};

const cache = new WeakMap<object, Index>();

function bump(m: Map<string, Map<string, number>>, key: string, cat: string) {
  const inner = m.get(key) ?? new Map<string, number>();
  inner.set(cat, (inner.get(cat) ?? 0) + 1);
  m.set(key, inner);
}

function buildIndex(history: HistoryItem[]): Index {
  const cached = cache.get(history);
  if (cached) return cached;
  const idx: Index = { exact: new Map(), tokens: new Map() };
  for (const h of history) {
    if (!h.categoryId) continue;
    const norm = normalizeText(h.description);
    if (norm) bump(idx.exact, norm, h.categoryId);
    for (const t of tokenize(h.description)) bump(idx.tokens, t, h.categoryId);
  }
  cache.set(history, idx);
  return idx;
}

function majority(votes: Map<string, number>, minShare: number): string | null {
  let total = 0;
  let best: [string, number] | null = null;
  for (const [cat, n] of votes) {
    total += n;
    if (!best || n > best[1]) best = [cat, n];
  }
  return best && best[1] / total >= minShare ? best[0] : null;
}

export function suggestCategory(
  description: string,
  history: HistoryItem[],
): string | null {
  if (history.length === 0) return null;
  const idx = buildIndex(history);
  const norm = normalizeText(description);
  const exact = idx.exact.get(norm);
  if (exact) {
    const c = majority(exact, 0.6);
    if (c) return c;
  }
  const scores = new Map<string, number>();
  let total = 0;
  for (const t of tokenize(description)) {
    const votes = idx.tokens.get(t);
    if (!votes) continue;
    let n = 0;
    for (const v of votes.values()) n += v;
    const cat = majority(votes, 0.6);
    if (!cat) continue;
    const share = (votes.get(cat) ?? 0) / n;
    const w = share * Math.min(1, 0.5 + n / 4);
    scores.set(cat, (scores.get(cat) ?? 0) + w);
    total += w;
  }
  let best: [string, number] | null = null;
  for (const e of scores) if (!best || e[1] > best[1]) best = e;
  if (!best || best[1] < 0.6 || best[1] / total < 0.6) return null;
  return best[0];
}
