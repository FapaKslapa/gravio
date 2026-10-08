export type Metric = "savings" | "expense" | "income";

export const METRICS: { id: Metric; label: string; title: string }[] = [
  { id: "savings", label: "Risparmio", title: "Risparmio mensile" },
  { id: "expense", label: "Spese", title: "Spese mensili" },
  { id: "income", label: "Entrate", title: "Entrate mensili" },
];
