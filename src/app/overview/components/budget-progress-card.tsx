"use client";

import dayjs from "dayjs";
import {
  AlertTriangle,
  CheckCircle2,
  OctagonAlert,
  Settings2,
  TrendingUp,
} from "lucide-react";
import { m } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { springs } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";
import { StatsGrid } from "./stats-grid";

type BudgetProgressCardProps = {
  totalIncome: number;
  totalExpense: number;
  targetBudgetVal: number;
  maxBudgetVal: number;
  displayCurrency: string;
  onOpenSettings: () => void;
};

export function BudgetProgressCard({
  totalIncome,
  totalExpense,
  targetBudgetVal,
  maxBudgetVal,
  displayCurrency,
  onOpenSettings,
}: BudgetProgressCardProps) {
  const today = dayjs();
  const daysInMonth = today.daysInMonth();
  const dayOfMonth = today.date();
  const daysRemaining = daysInMonth - dayOfMonth;
  const dailyAvg = dayOfMonth > 0 ? totalExpense / dayOfMonth : 0;
  const projectedMonthly = dailyAvg * daysInMonth;

  const hasBudget = maxBudgetVal > 0 || targetBudgetVal > 0;
  const limit = maxBudgetVal > 0 ? maxBudgetVal : targetBudgetVal;
  const progress = limit > 0 ? Math.min((totalExpense / limit) * 100, 100) : 0;
  const targetMarker =
    targetBudgetVal > 0 && targetBudgetVal < limit
      ? (targetBudgetVal / limit) * 100
      : null;

  const isOverMax = limit > 0 && totalExpense > limit;
  const isOverTarget = targetBudgetVal > 0 && totalExpense > targetBudgetVal;
  const remaining = limit - totalExpense;
  const daysLeftInclusive = daysInMonth - dayOfMonth + 1;
  const perDay = remaining > 0 ? remaining / daysLeftInclusive : 0;

  const status = isOverMax
    ? {
        label: "Oltre budget",
        Icon: OctagonAlert,
        chip: "bg-expense-soft text-expense",
        bar: "bg-expense",
      }
    : isOverTarget
      ? {
          label: "Attenzione",
          Icon: AlertTriangle,
          chip: "bg-warning/25 text-foreground",
          bar: "bg-warning",
        }
      : {
          label: "In linea",
          Icon: CheckCircle2,
          chip: "bg-income-soft text-income",
          bar: "bg-income",
        };

  const projectedOver = limit > 0 && projectedMonthly > limit;

  return (
    <Card className="elevation-2 h-full gap-6 rounded-xl p-5 ring-0 md:p-7">
      <CardHeader className="px-0">
        <CardTitle className="font-display text-base font-semibold">
          Budget del mese
        </CardTitle>
        <CardDescription>
          {daysRemaining === 0
            ? "Ultimo giorno del mese"
            : `${daysRemaining} giorni rimanenti`}
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          {hasBudget && (
            <span
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold",
                status.chip,
              )}
            >
              <status.Icon className="size-4" aria-hidden="true" />
              {status.label}
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            onClick={onOpenSettings}
            aria-label="Imposta budget"
          >
            <Settings2 />
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-6 px-0">
        {hasBudget ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">
                {isOverMax ? "Hai superato il limite di" : "Ti restano"}
              </p>
              <p
                className={cn(
                  "num-display tabular text-[clamp(2.25rem,11vw,3.5rem)] leading-none font-bold",
                  isOverMax ? "text-expense" : "text-foreground",
                )}
              >
                {formatCurrency(Math.abs(remaining), displayCurrency)}
              </p>
              <p className="tabular text-sm text-muted-foreground">
                {isOverMax
                  ? `su un limite di ${formatCurrency(limit, displayCurrency)}`
                  : `su ${formatCurrency(limit, displayCurrency)} di limite`}
              </p>
              {!isOverMax && (
                <p className="tabular mt-1 inline-flex w-fit items-center rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand">
                  Puoi spendere {formatCurrency(perDay, displayCurrency)} al
                  giorno
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div
                className="relative h-3.5 w-full rounded-full bg-muted"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(progress)}
                aria-label="Budget speso"
              >
                <m.div
                  className={cn("h-full rounded-full", status.bar)}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={springs.gentle}
                />
                {targetMarker !== null && (
                  <span
                    className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-foreground/60"
                    style={{ left: `${targetMarker}%` }}
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="tabular flex justify-between gap-3 text-xs text-muted-foreground">
                <span>
                  Speso {formatCurrency(totalExpense, displayCurrency)} (
                  {progress.toFixed(0)}%)
                </span>
                {targetMarker !== null && (
                  <span>
                    Obiettivo {formatCurrency(targetBudgetVal, displayCurrency)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted-foreground">Spese del mese</p>
            <p className="num-display tabular text-[clamp(2.25rem,11vw,3.5rem)] leading-none font-bold">
              {formatCurrency(totalExpense, displayCurrency)}
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Imposta un budget per vedere quanto ti resta ogni giorno.
            </p>
            <Button className="h-11 rounded-full px-5" onClick={onOpenSettings}>
              <Settings2 data-icon="inline-start" />
              Imposta budget
            </Button>
          </div>
        )}

        <StatsGrid
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          displayCurrency={displayCurrency}
        />

        {hasBudget && (
          <dl className="tabular grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <TrendingUp className="size-4" aria-hidden="true" />
                Proiezione fine mese
              </dt>
              <dd
                className={cn(
                  "font-semibold",
                  projectedOver ? "text-expense" : "text-foreground",
                )}
              >
                {formatCurrency(projectedMonthly, displayCurrency)}
                {projectedOver && (
                  <span className="ml-1.5 text-xs font-medium">
                    oltre il limite
                  </span>
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">
                Media giornaliera
              </dt>
              <dd className="font-semibold">
                {formatCurrency(dailyAvg, displayCurrency)}
              </dd>
            </div>
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
