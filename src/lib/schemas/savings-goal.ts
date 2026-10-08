import { z } from "zod";

export const GOAL_ICONS = [
  "target",
  "plane",
  "home",
  "car",
  "shield",
  "gift",
  "graduation-cap",
  "laptop",
] as const;

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const createSavingsGoalSchema = z.object({
  name: z.string().trim().min(1).max(60),
  targetAmount: z.number().positive(),
  currency: z.string().min(3).max(3),
  targetDate: dateString.nullable(),
  color: z.string().min(1),
  icon: z.enum(GOAL_ICONS),
});

export const updateSavingsGoalSchema = createSavingsGoalSchema.extend({
  id: z.string().min(1),
});

export const deleteSavingsGoalSchema = z.object({
  id: z.string().min(1),
});

export const addContributionSchema = z.object({
  goalId: z.string().min(1),
  amount: z.number().positive(),
  date: dateString,
  note: z.string().trim().max(120).nullable().optional(),
});

export const deleteContributionSchema = z.object({
  id: z.string().min(1),
});
