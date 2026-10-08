import dayjs from "dayjs";
import { CalendarClock } from "lucide-react";
import type { CardStackItem } from "@/components/ui/card-stack";
import { formatCurrency } from "@/lib/utils";
import { AttentionCard } from "./attention-card";

type Recurrent = {
  id: string;
  status: string;
  type: string;
  description: string;
  amount: string;
  currency: string;
  nextOccurrence: string | Date;
};

export function recurrentItems(recurrents: Recurrent[]): CardStackItem[] {
  const horizon = dayjs().add(3, "day").endOf("day");
  const due = recurrents
    .filter(
      (r) => r.status === "active" && !dayjs(r.nextOccurrence).isAfter(horizon),
    )
    .sort((a, z) => +new Date(a.nextOccurrence) - +new Date(z.nextOccurrence));
  return due.map((r) => {
    const when = dayjs(r.nextOccurrence);
    const days = when.startOf("day").diff(dayjs().startOf("day"), "day");
    const label =
      days <= 0 ? "oggi" : days === 1 ? "domani" : `tra ${days} giorni`;
    return {
      id: `recurrent-${r.id}`,
      content: (
        <AttentionCard
          Icon={CalendarClock}
          tone={r.type === "income" ? "income" : "warning"}
          title={r.description}
          detail={`${formatCurrency(parseFloat(r.amount), r.currency)} ${label}`}
          href="/transactions"
          action="Apri"
        />
      ),
    };
  });
}
