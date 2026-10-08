export type CategoryOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export type RecurrentTx = {
  id: string;
  description: string;
  amount: string;
  currency: string;
  categoryId: string | null;
  type: string;
  frequency: string;
  startDate: Date | string;
  endDate: Date | string | null;
  status: string;
  nextOccurrence?: Date | string | null;
};

export type Frequency = "daily" | "weekly" | "monthly" | "yearly";

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: "Giornaliero",
  weekly: "Settimanale",
  monthly: "Mensile",
  yearly: "Annuale",
};

export const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "daily", label: "Giornaliero" },
  { value: "weekly", label: "Settimanale" },
  { value: "monthly", label: "Mensile" },
  { value: "yearly", label: "Annuale" },
];
