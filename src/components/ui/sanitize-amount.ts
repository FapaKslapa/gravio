export function sanitizeAmount(raw: string) {
  let v = raw.replace(",", ".").replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  if (parts.length > 2) v = `${parts[0]}.${parts.slice(1).join("")}`;
  if (parts[1] && parts[1].length > 2)
    v = `${parts[0]}.${parts[1].slice(0, 2)}`;
  return v;
}
