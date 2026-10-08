import { z } from "zod";

export const updateRecurrentSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().nullable().optional(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  currency: z.string().length(3),
  description: z.string().min(1),
  frequency: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.string().or(z.date()),
  status: z.enum(["active", "paused"]).optional(),
  endDate: z.string().or(z.date()).nullable().optional(),
});

export const toggleRecurrentStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["active", "paused"]),
});

export const processDueSchema = z
  .object({
    rates: z.record(z.string(), z.number()).optional(),
  })
  .optional();
