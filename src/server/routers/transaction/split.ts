export function computeFriendSplitNok(
  amountNok: number,
  mode: string,
  value?: number,
): number {
  switch (mode) {
    case "percentage":
      return amountNok * ((value ?? 50) / 100);
    case "exact":
      return Math.min(value ?? amountNok / 2, amountNok);
    case "thirds":
      return amountNok / 3;
    case "custom_n":
      return amountNok / Math.max(value ?? 2, 2);
    default:
      return amountNok / 2;
  }
}
