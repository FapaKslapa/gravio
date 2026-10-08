import type { Finding, FindingKind } from "./insight-types";

const KIND_LABEL: Record<FindingKind, string> = {
  growth: "categoria in crescita rispetto alla media dei 3 mesi precedenti",
  recurring: "spesa ricorrente mensile (possibile abbonamento)",
  micro: "molte piccole spese sotto i 10 euro",
  budget_over: "budget superato",
  budget_pace: "ritmo di spesa sopra il budget",
  weekday: "giorno della settimana con spesa media piu' alta",
  fees: "commissioni e canoni",
  duplicate: "possibili movimenti duplicati",
};

/** Aggregates only: no free-text descriptions, no personal data. */
export function buildAiPrompt(
  findings: Finding[],
  names: (id: string | null) => string | null,
  totals: { avgMonthlyExpenseEur: number; totalMonthlySavingEur: number },
) {
  const lines = findings.map((f, i) => {
    const ev = Object.entries(f.evidence)
      .filter(([k, v]) => k !== "search" && typeof v === "number")
      .map(([k, v]) => `${k}=${v}`)
      .join(", ");
    const cat = names(f.categoryId);
    return `${i}. tipo: ${KIND_LABEL[f.kind]}${cat ? `; categoria: ${cat}` : ""}; risparmio_stimato_mensile_eur=${f.monthlySavingEur}; ${ev}`;
  });
  return [
    {
      role: "system" as const,
      content:
        "Sei un assistente per le spese personali in un'app italiana. Rispondi SOLO con JSON valido, in italiano, tono pratico e gentile, mai giudicante ne' allarmista. Non dare consigli finanziari o di investimento: solo piccole abitudini di spesa quotidiana. Non inventare numeri: usa solo quelli forniti.",
    },
    {
      role: "user" as const,
      content: `Spesa media mensile: ${totals.avgMonthlyExpenseEur} EUR. Risparmio mensile stimato totale: ${totals.totalMonthlySavingEur} EUR.
Spunti individuati (dati aggregati):
${lines.join("\n")}

Rispondi con questo JSON: {"summary": string (max 220 caratteri, una frase di sintesi), "tips": [{"findingIndex": numero dello spunto, "title": string (max 60), "advice": string (max 200, un'azione concreta), "actionLabel": string (max 30, verbo breve)}]}.
Scrivi da 3 a 5 consigli (meno se gli spunti sono meno), ognuno su uno spunto diverso, in ordine di importanza.`,
    },
  ];
}
