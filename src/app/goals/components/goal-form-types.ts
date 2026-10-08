import type { GOAL_ICONS } from "@/lib/schemas/savings-goal";
import type { Goal } from "../goals-helpers";

export type GoalFormValues = {
  name: string;
  targetAmount: number;
  currency: string;
  targetDate: string | null;
  color: string;
  icon: (typeof GOAL_ICONS)[number];
};

export type GoalFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  defaultCurrency: string;
  isPending: boolean;
  onSubmit: (values: GoalFormValues) => void | Promise<void>;
};
