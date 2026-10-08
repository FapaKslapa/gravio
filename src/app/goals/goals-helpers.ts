import dayjs from "dayjs";
import {
  Car,
  Gift,
  GraduationCap,
  Home,
  Laptop,
  Plane,
  ShieldCheck,
  Target,
} from "lucide-react";
import type { GOAL_ICONS } from "@/lib/schemas/savings-goal";

export type GoalIconName = (typeof GOAL_ICONS)[number];

export const GOAL_ICON_MAP: Record<
  GoalIconName,
  { Icon: typeof Target; label: string }
> = {
  target: { Icon: Target, label: "Obiettivo" },
  plane: { Icon: Plane, label: "Viaggio" },
  home: { Icon: Home, label: "Casa" },
  car: { Icon: Car, label: "Auto" },
  shield: { Icon: ShieldCheck, label: "Fondo emergenza" },
  gift: { Icon: Gift, label: "Regalo" },
  "graduation-cap": { Icon: GraduationCap, label: "Studio" },
  laptop: { Icon: Laptop, label: "Tecnologia" },
};

export function getGoalIcon(name: string) {
  return (
    (GOAL_ICON_MAP as Record<string, { Icon: typeof Target }>)[name]?.Icon ??
    Target
  );
}

export type GoalContribution = {
  id: string;
  amount: number;
  date: string;
  note: string | null;
};

export type Goal = {
  id: string;
  name: string;
  targetAmount: number;
  currency: string;
  targetDate: string | null;
  color: string;
  icon: string;
  createdAt: Date;
  saved: number;
  percent: number;
  contributions: GoalContribution[];
};

export type GoalStatus = "achieved" | "on-track" | "late";

export const STATUS_LABEL: Record<GoalStatus, string> = {
  achieved: "Raggiunto",
  "on-track": "In linea",
  late: "In ritardo",
};

export function getGoalProgress(goal: Goal) {
  const remaining = Math.max(0, goal.targetAmount - goal.saved);
  const achieved = remaining === 0;
  const now = dayjs();
  let status: GoalStatus = "on-track";
  let monthly: number | null = null;
  let daysLeft: number | null = null;

  if (achieved) {
    status = "achieved";
  } else if (goal.targetDate) {
    const end = dayjs(goal.targetDate).endOf("day");
    daysLeft = end.diff(now, "day");
    if (daysLeft < 0) {
      status = "late";
    } else {
      const months = Math.max(1, Math.ceil(end.diff(now, "month", true)));
      monthly = remaining / months;
      const start = dayjs(goal.createdAt);
      const total = end.diff(start, "day");
      const elapsed = now.diff(start, "day");
      if (total > 0) {
        const expected = goal.targetAmount * Math.min(1, elapsed / total);
        if (goal.saved < expected * 0.85) status = "late";
      }
    }
  }

  return { remaining, achieved, status, monthly, daysLeft };
}
