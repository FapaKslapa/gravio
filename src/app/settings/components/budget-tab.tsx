"use client";

import { Info, Target, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { MoneyInput } from "@/components/ui/money-input";
import {
  CategoryBudgetRow,
  CategoryBudgetSkeleton,
} from "./category-budget-row";
import { SettingsGroup } from "./settings-group";
import { SettingsRow } from "./settings-row";

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
          <CategoryBudgetSkeleton />
        ) : categories.length > 0 ? (
          categories.map((cat) => (
            <CategoryBudgetRow
              key={cat.id}
              category={cat}
              value={catBudgets[cat.id] || "0.00"}
              currency={displayCurrency}
              onChange={(newVal) =>
                setCatBudgets((prev) => ({ ...prev, [cat.id]: newVal }))
              }
            />
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
