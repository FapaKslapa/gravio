import type { Finding, InsightBudget } from "../insight-types";
import { fmt, round2 } from "../insight-utils";
import type { DetectorContext } from "./context";

function overFinding(
  b: InsightBudget,
  name: string,
  cur: number,
  last: number,
): Finding {
  const spent = cur > b.amountEur ? cur : last;
  const over = spent - b.amountEur;
  return {
    kind: "budget_over",
    categoryId: b.categoryId,
    title: `Budget ${name} superato`,
    detail: `${cur > b.amountEur ? "Questo mese" : "Il mese scorso"} hai speso ${fmt(spent)} contro un budget di ${fmt(b.amountEur)} (${fmt(over)} oltre).`,
    monthlySavingEur: round2(Math.min(over, spent * 0.3)),
    evidence: {
      spentEur: round2(spent),
      budgetEur: round2(b.amountEur),
      overEur: round2(over),
    },
  };
}

function paceFinding(
  b: InsightBudget,
  name: string,
  cur: number,
  projected: number,
): Finding {
  return {
    kind: "budget_pace",
    categoryId: b.categoryId,
    title: `${name}: ritmo sopra il budget`,
    detail: `Finora ${fmt(cur)} su ${fmt(b.amountEur)}: di questo passo chiuderai il mese intorno a ${fmt(projected)}.`,
    monthlySavingEur: round2(
      Math.min(projected - b.amountEur, projected * 0.2),
    ),
    evidence: {
      spentEur: round2(cur),
      budgetEur: round2(b.amountEur),
      projectedEur: round2(projected),
    },
  };
}

export function detectBudgets(ctx: DetectorContext): Finding[] {
  const { now, curM, lastM, catMonth, nameOf } = ctx;
  const findings: Finding[] = [];
  const dim = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  ).getUTCDate();
  const frac = now.getUTCDate() / dim;
  for (const b of ctx.budgets) {
    if (b.amountEur <= 0) continue;
    const mm = catMonth.get(b.categoryId);
    if (!mm) continue;
    const cur = mm.get(curM) ?? 0;
    const last = mm.get(lastM) ?? 0;
    const name = nameOf(b.categoryId);
    if (cur > b.amountEur || last > b.amountEur) {
      findings.push(overFinding(b, name, cur, last));
    } else if (frac >= 0.2 && frac < 1) {
      const projected = cur / frac;
      if (projected > b.amountEur * 1.1) {
        findings.push(paceFinding(b, name, cur, projected));
      }
    }
  }
  return findings;
}
