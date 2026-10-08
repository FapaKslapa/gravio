export function parseAmount(
  input: string | number | null | undefined,
): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === "number") return Number.isFinite(input) ? input : null;
  let s = input
    .replace(/[  \s]/g, "")
    .replace(/[−–—]/g, "-")
    .trim();
  if (!s) return null;

  let negative = false;
  const suffix = s.match(/(cr|db|dr)$/i);
  if (suffix) {
    negative = /db|dr/i.test(suffix[1]);
    s = s.slice(0, -suffix[1].length);
  }
  s = s.replace(/^(?:cr|db|dr)/i, (p) => {
    negative = /db|dr/i.test(p);
    return "";
  });
  if (/^\(.*\)$/.test(s)) {
    negative = true;
    s = s.slice(1, -1);
  }
  s = s.replace(/(?:eur|nok|usd|gbp|sek|dkk|chf|kr|€|\$|£)/gi, "");
  if (s.endsWith("-")) {
    negative = true;
    s = s.slice(0, -1);
  }
  if (s.startsWith("-")) {
    negative = true;
    s = s.slice(1);
  } else if (s.startsWith("+")) {
    s = s.slice(1);
  }
  s = s.replace(/'/g, "");
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null;

  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  let normalized: string;
  if (lastDot >= 0 && lastComma >= 0) {
    const decimalSep = lastDot > lastComma ? "." : ",";
    const thousandSep = decimalSep === "." ? "," : ".";
    normalized = s.split(thousandSep).join("").replace(decimalSep, ".");
  } else if (lastDot >= 0 || lastComma >= 0) {
    const sep = lastDot >= 0 ? "." : ",";
    const parts = s.split(sep);
    const last = parts[parts.length - 1];
    if (parts.length > 2) {
      normalized = parts.join("");
    } else if (last.length === 3 && parts[0] !== "0" && parts[0] !== "") {
      normalized = parts.join("");
    } else {
      normalized = `${parts[0] || "0"}.${last}`;
    }
  } else {
    normalized = s;
  }
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}
