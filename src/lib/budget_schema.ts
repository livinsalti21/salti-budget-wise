import { z } from "zod";

export const LineSchema = z.object({
  name: z.string().min(1, "Name required").max(64),
  amount: z.coerce.number().min(0, "Amount must be ≥ 0").finite()
});

export const BudgetFormSchema = z.object({
  profile: z.enum(["student","family"]),
  income: z.coerce.number().min(0, "Weekly income must be ≥ 0").finite(),
  fixedExpenses: z.array(LineSchema).default([]),
  debtMinimums: z.array(LineSchema).default([]),
  savingsTarget: z.coerce.number().min(0, "Savings goal must be ≥ 0").finite()
});

export type BudgetFormInput = z.infer<typeof BudgetFormSchema>;