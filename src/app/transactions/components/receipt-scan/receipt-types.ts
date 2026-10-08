export type ReceiptCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type ReceiptPhase =
  | { name: "idle" }
  | { name: "reading" }
  | { name: "confirm" }
  | { name: "error"; message: string };

export const today = () => new Date().toISOString().substring(0, 10);

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function matchHint(
  hint: string,
  categories: ReceiptCategory[],
): string | null {
  const h = norm(hint).trim();
  if (h.length < 3) return null;
  return (
    categories.find((c) => {
      const n = norm(c.name);
      return n.includes(h) || h.includes(n);
    })?.id ?? null
  );
}
