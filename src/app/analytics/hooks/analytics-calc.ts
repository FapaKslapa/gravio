import { MONTH_SHORT } from "../components/months";

type Tx = {
  type: "expense" | "income";
  date: Date | string;
  amountNok: string;
  categoryId: string | null;
};

type Category = { id: string; color: string; name: string; icon: string };
type ConvertNok = (nokVal: string | number) => number;

export function buildCategoryExpenses(
  monthTransactions: Tx[],
  categories: Category[],
  totalExpense: number,
  convertNokAmount: ConvertNok,
) {
  const categoryExpensesMap: Record<
    string,
    { amount: number; color: string; name: string; icon: string }
  > = {};

  const categoriesMap = new Map(categories.map((c) => [c.id, c]));

  for (const t of monthTransactions) {
    if (t.type === "expense") {
      const catId = t.categoryId || "uncategorized";
      const amount = convertNokAmount(t.amountNok);

      if (!categoryExpensesMap[catId]) {
        const dbCat = categoriesMap.get(catId);
        categoryExpensesMap[catId] = {
          amount: 0,
          color: dbCat?.color || "#8e8e93",
          name: dbCat?.name || "Altro/Senza Categoria",
          icon: dbCat?.icon || "HelpCircle",
        };
      }
      categoryExpensesMap[catId].amount += amount;
    }
  }

  return Object.entries(categoryExpensesMap)
    .map(([id, info]) => ({
      id,
      ...info,
      percentage: totalExpense > 0 ? (info.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function buildLast6Months(
  transactions: Tx[],
  currentMonth: number,
  currentYear: number,
  convertNokAmount: ConvertNok,
) {
  const result = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m < 0) {
      m += 12;
      y -= 1;
    }

    const mTransactions = transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });

    const inc = mTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + convertNokAmount(t.amountNok), 0);

    const exp = mTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + convertNokAmount(t.amountNok), 0);

    result.push({
      label: `${MONTH_SHORT[m]} ${y.toString().slice(-2)}`,
      income: inc,
      expense: exp,
      savings: inc - exp,
    });
  }
  return result;
}
