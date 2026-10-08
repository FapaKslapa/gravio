"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/client";
import { formatCurrency } from "@/lib/utils";
import { GoalRing } from "../../goals/components/goal-ring";
import { getGoalIcon, getGoalProgress } from "../../goals/goals-helpers";

export function GoalsSummaryCard() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.savingsGoal.list.queryOptions());
  const goals = (data ?? []).slice(0, 2);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Target className="size-4" aria-hidden />
          Obiettivi
        </CardTitle>
        <Link
          href="/goals"
          className="flex min-h-11 items-center gap-1 rounded-full px-2 text-sm font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {goals.length === 0 ? "Crea" : "Tutti"}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          <Skeleton className="h-14 w-full rounded-lg" />
        ) : goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Metti da parte per un viaggio, un regalo o un fondo emergenze.
          </p>
        ) : (
          goals.map((goal) => {
            const Icon = getGoalIcon(goal.icon);
            const { achieved } = getGoalProgress(goal);
            return (
              <Link
                key={goal.id}
                href="/goals"
                className="flex min-h-14 items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <GoalRing
                  percent={goal.percent}
                  color={goal.color}
                  achieved={achieved}
                  size={48}
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-start gap-1.5 text-sm font-semibold">
                    <Icon
                      className="mt-0.5 size-4 shrink-0"
                      style={{ color: goal.color }}
                      aria-hidden
                    />
                    {goal.name}
                  </p>
                  <p className="tabular text-xs text-muted-foreground">
                    {formatCurrency(goal.saved, goal.currency)} /{" "}
                    {formatCurrency(goal.targetAmount, goal.currency)}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
