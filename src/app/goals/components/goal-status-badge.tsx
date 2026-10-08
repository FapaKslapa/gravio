import { CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type GoalStatus, STATUS_LABEL } from "../goals-helpers";

const STATUS_STYLE: Record<GoalStatus, { Icon: typeof Clock; cls: string }> = {
  achieved: { Icon: CheckCircle2, cls: "bg-income-soft text-income" },
  "on-track": { Icon: TrendingUp, cls: "bg-brand-soft text-foreground" },
  late: { Icon: Clock, cls: "bg-expense-soft text-expense" },
};

export function GoalStatusBadge({ status }: { status: GoalStatus }) {
  const { Icon, cls } = STATUS_STYLE[status];
  return (
    <Badge
      variant="secondary"
      className={cn("gap-1 text-xs font-semibold", cls)}
    >
      <Icon className="size-3.5" aria-hidden />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
