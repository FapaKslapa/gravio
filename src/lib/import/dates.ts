import { MONTHS } from "./months";
import { stripAccents } from "./text";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function validYmd(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || y < 1900 || y > 2200) return false;
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return d <= dim;
}

function ymd(y: number, m: number, d: number): string | null {
  return validYmd(y, m, d) ? `${y}-${pad(m)}-${pad(d)}` : null;
}

function fullYear(y: number): number {
  if (y >= 100) return y;
  return y < 70 ? 2000 + y : 1900 + y;
}

export function dateToIso(d: Date): string | null {
  if (Number.isNaN(d.getTime())) return null;
  const utcMidnight =
    d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;
  return utcMidnight
    ? `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
    : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export type ParseDateOptions = {
  dayFirst?: boolean;
  defaultYear?: number;
};

export function parseDate(
  input: string | number | Date | null | undefined,
  opts: ParseDateOptions = {},
): string | null {
  if (input === null || input === undefined) return null;
  if (input instanceof Date) return dateToIso(input);
  const dayFirst = opts.dayFirst ?? true;
  if (typeof input === "number") {
    if (input > 20000 && input < 80000) {
      return dateToIso(new Date(Math.round((input - 25569) * 86400000)));
    }
    return null;
  }
  const s = stripAccents(input).trim().toLowerCase();
  if (!s) return null;

  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?!\d)/);
  if (m) return ymd(+m[1], +m[2], +m[3]);

  m = s.match(/^(\d{8})(?!\d)/);
  if (m) return ymd(+m[1].slice(0, 4), +m[1].slice(4, 6), +m[1].slice(6, 8));

  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})(?!\d)/);
  if (m) {
    const a = +m[1];
    const b = +m[2];
    const y = fullYear(+m[3]);
    const dayIsFirst = dayFirst ? !(b > 12 && a <= 12) : a > 12;
    return dayIsFirst ? ymd(y, b, a) : ymd(y, a, b);
  }

  m = s.match(
    /^(\d{1,2})(?:st|nd|rd|th)?[\s.\-/]+([a-z]{3})[a-z]*\.?(?:[\s.\-/,]+(\d{4}|\d{2}))?(?![\d])/,
  );
  if (m && MONTHS[m[2]]) {
    const y = m[3] ? fullYear(+m[3]) : opts.defaultYear;
    return y ? ymd(y, MONTHS[m[2]], +m[1]) : null;
  }

  m = s.match(/^([a-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})(?!\d)/);
  if (m && MONTHS[m[1]]) return ymd(+m[3], MONTHS[m[1]], +m[2]);

  m = s.match(/^(\d{1,2})[-/.](\d{1,2})(?![\d])/);
  if (m && opts.defaultYear) {
    const a = +m[1];
    const b = +m[2];
    return dayFirst || a > 12
      ? ymd(opts.defaultYear, b, a)
      : ymd(opts.defaultYear, a, b);
  }
  return null;
}
