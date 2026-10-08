export function computeBalanceTotals(balances: { balanceNok: number }[]) {
  const totalYouAreOwedNok = balances
    .filter((b) => b.balanceNok > 0)
    .reduce((s, b) => s + b.balanceNok, 0);
  const totalYouOweNok = Math.abs(
    balances
      .filter((b) => b.balanceNok < 0)
      .reduce((s, b) => s + b.balanceNok, 0),
  );
  return {
    totalYouAreOwedNok,
    totalYouOweNok,
    netBalanceNok: totalYouAreOwedNok - totalYouOweNok,
  };
}
