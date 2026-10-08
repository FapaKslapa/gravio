import {
  CalendarClock,
  Coffee,
  CopyCheck,
  Landmark,
  PiggyBank,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { FindingKind } from "@/lib/insights/analyze";

const ICONS: Record<FindingKind, typeof PiggyBank> = {
  growth: TrendingUp,
  recurring: CalendarClock,
  micro: Coffee,
  budget_over: Target,
  budget_pace: Target,
  weekday: Zap,
  fees: Landmark,
  duplicate: CopyCheck,
};

export function tipIcon(kind: FindingKind) {
  return ICONS[kind] ?? PiggyBank;
}
