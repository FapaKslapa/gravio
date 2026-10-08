import { z } from "zod";

export const receiptItemSchema = z.object({
  description: z.string().trim().max(120),
  amount: z.number().finite(),
});

export const receiptSchema = z.object({
  merchant: z.string().trim().max(120).default(""),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable()
    .catch(null),
  total: z.number().finite().positive().max(100_000),
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((c) => c.toUpperCase())
    .catch("EUR"),
  items: z.array(receiptItemSchema).max(30).catch([]),
  categoryHint: z.string().trim().max(40).catch(""),
});

export type ReceiptData = z.infer<typeof receiptSchema>;
