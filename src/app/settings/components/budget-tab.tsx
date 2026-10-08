"use client";

import { Info, Target, TriangleAlert } from "lucide-react";
import { CategoryIcon } from "@/components/icon-helper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { MoneyInput } from "@/components/ui/money-input";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsGroup, SettingsRow } from "./settings-ui";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

type BudgetTabProps = {
  targetBudget: string;
  setTargetBudget: (val: string) => void;
  maxBudget: string;
  setMaxBudget: (val: string) => void;
  displayCurrency: string;
  exchangeRate: number;
  categories: Category[];
  isCategoriesLoading: boolean;
  catBudgets: Record<string, string>;
  setCatBudgets: React.Dispatch<React.SetStateAction<Record<string, string>>>;
};

export function BudgetTab({
  targetBudget,
  setTargetBudget,
  maxBudget,
  setMaxBudget,
  displayCurrency,
  exchangeRate,
  categories,
  isCategoriesLoading,
  catBudgets,
  setCatBudgets,
}: BudgetTabProps) {
  return (
    <div className="flex flex-col gap-6">
      <SettingsGroup
        title="Budget mensile"
        description={`Gli importi sono in ${displayCurrency}.`}
        index={0}
      >
        <SettingsRow
          icon={Target}
          tone="brand"
          title="Obiettivo"
          subtitle="Quanto vuoi spendere al mese"
        >
          <MoneyInput
            label="Budget obiettivo"
            value={targetBudget}
            onChange={setTargetBudget}
            currency={displayCurrency}
          />
        </SettingsRow>
        <SettingsRow
          icon={TriangleAlert}
          tone="expense"
          title="Limite massimo"
          subtitle="Soglia oltre la quale sei fuori budget"
        >
          <MoneyInput
            label="Budget massimo"
            value={maxBudget}
            onChange={setMaxBudget}
            currency={displayCurrency}
          />
        </SettingsRow>
      </SettingsGroup>

      {displayCurrency === "EUR" && (
        <Alert>
          <Info />
          <AlertDescription>
            I valori vengono convertiti in NOK al salvataggio al tasso corrente
            (<span className="tabular">{exchangeRate.toFixed(2)}</span>{" "}
            NOK/EUR).
          </AlertDescription>
        </Alert>
      )}

      <SettingsGroup
        title="Budget per categoria"
        description="Imposta 0 per non avere un limite su una categoria."
        index={1}
      >
        {isCategoriesLoading ? (
          [0, 1, 2, 3].map((i) => (
            <div key={i} className="flex min-h-16 items-center gap-3 px-4">
              <Skeleton className="size-9 rounded-sm" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-11 w-32 rounded-md" />
            </div>
          ))
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <div
              key={cat.id}
              className="flex min-h-16 items-center justify-between gap-3 px-4 py-2"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-9 shrink-0 items-center justify-center rounded-sm"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${cat.color} 15%, transparent)`,
                    color: cat.color,
                  }}
                >
                  <CategoryIcon name={cat.icon} size={18} />
                </span>
                <span className="truncate text-sm font-semibold">
                  {cat.name}
                </span>
              </div>
              <MoneyInput
                label={`Budget ${cat.name}`}
                value={catBudgets[cat.id] || "0.00"}
                onChange={(newVal) =>
                  setCatBudgets((prev) => ({ ...prev, [cat.id]: newVal }))
                }
                currency={displayCurrency}
                className="h-11 w-36 shrink-0 px-3"
                inputClassName="text-base"
              />
            </div>
          ))
        ) : (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>Nessuna categoria creata</EmptyTitle>
              <EmptyDescription>
                Crea una categoria per assegnarle un budget.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </SettingsGroup>
    </div>
  );
}
