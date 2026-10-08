export type CategoryBudgetItem = {
  id: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  budgetVal: number;
  spentVal: number;
  percentage: number;
  progressPercent: number;
  barColor: string;
  stateLabel: string | null;
};

type BudgetInput = { id: string; categoryId: string; amount: string };
type CategoryInfo = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};
type TransactionInfo = {
  type: string;
  categoryId: string | null;
  amountNok: string;
};

export function buildBudgetItems(
  budgets: BudgetInput[],
  categories: CategoryInfo[],
  transactions: TransactionInfo[],
  displayCurrency: string,
  convertCurrency: (val: number, from: string, to: string) => number,
): CategoryBudgetItem[] {
  return budgets.map((budget) => {
    const category = categories.find((c) => c.id === budget.categoryId);

    const spentInNok = transactions
      .filter((t) => t.type === "expense" && t.categoryId === budget.categoryId)
      .reduce((sum, t) => sum + parseFloat(t.amountNok), 0);

    const budgetVal = convertCurrency(
      parseFloat(budget.amount),
      "NOK",
      displayCurrency,
    );
    const spentVal = convertCurrency(spentInNok, "NOK", displayCurrency);

    const percentage = budgetVal > 0 ? (spentVal / budgetVal) * 100 : 0;

    const isOver = spentVal > budgetVal;
    const isWarning = spentVal >= budgetVal * 0.8 && spentVal <= budgetVal;

    return {
      id: budget.id,
      categoryName: category?.name || "Sconosciuta",
      categoryIcon: category?.icon || "Sparkles",
      categoryColor: category?.color || "var(--brand)",
      budgetVal,
      spentVal,
      percentage,
      progressPercent: Math.min(percentage, 100),
      barColor: isOver ? "bg-expense" : isWarning ? "bg-warning" : "bg-income",
      stateLabel: isOver
        ? "Limite superato"
        : isWarning
          ? "Quasi al limite"
          : null,
    };
  });
}
