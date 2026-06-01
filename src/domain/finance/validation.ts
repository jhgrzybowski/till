import { z } from "zod";

import type { FinanceSummary } from "./types";
import { isIsoDate } from "@/utils/dates";

function parseLocalizedNumber(value: unknown, emptyAsZero = false): unknown {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const compact = value.trim().replace(/\s|\u00a0/g, "");

  if (!compact) {
    return emptyAsZero ? 0 : Number.NaN;
  }

  const commaIndex = compact.lastIndexOf(",");
  const dotIndex = compact.lastIndexOf(".");
  const decimalIndex = Math.max(commaIndex, dotIndex);

  if (decimalIndex === -1) {
    return Number(compact);
  }

  const integerPart = compact.slice(0, decimalIndex).replace(/[,.]/g, "");
  const decimalPart = compact.slice(decimalIndex + 1).replace(/[,.]/g, "");

  return Number(`${integerPart}.${decimalPart}`);
}

export const positiveAmountSchema = z
  .preprocess(
    (value) => parseLocalizedNumber(value),
    z
      .number({ error: "Podaj poprawną kwotę." })
      .refine((value) => Number.isFinite(value), "Podaj poprawną kwotę.")
      .positive("Kwota musi być większa od zera."),
  );

export const nonNegativeAmountSchema = z
  .preprocess(
    (value) => parseLocalizedNumber(value, true),
    z
      .number({ error: "Podaj poprawną kwotę." })
      .refine((value) => Number.isFinite(value), "Podaj poprawną kwotę.")
      .min(0, "Kwota nie może być ujemna."),
  );

export const paydayDaySchema = z.coerce
  .number()
  .int("Podaj pełny dzień miesiąca.")
  .min(1, "Dzień musi być między 1 a 31.")
  .max(31, "Dzień musi być między 1 a 31.");

export const isoDateSchema = z.string().refine(isIsoDate, "Podaj datę w formacie RRRR-MM-DD.");

export const recurringBillFormSchema = z.object({
  name: z.string().trim().min(1, "Podaj nazwę rachunku."),
  amount: positiveAmountSchema,
  dueDayOfMonth: paydayDaySchema,
});

export const onboardingSchema = z
  .object({
    displayName: z.string().trim().min(1, "Podaj imię."),
    currentCashBalance: nonNegativeAmountSchema,
    safeBalance: nonNegativeAmountSchema,
    creditLimit: nonNegativeAmountSchema,
    currentCreditDebt: nonNegativeAmountSchema,
    paydayDayOfMonth: paydayDaySchema,
    expectedSalary: nonNegativeAmountSchema,
    recurringBills: z.array(recurringBillFormSchema).default([]),
  })
  .refine((value) => value.currentCreditDebt <= value.creditLimit, {
    message: "Wykorzystany kredyt nie może być większy niż limit.",
    path: ["currentCreditDebt"],
  });

export const expenseSchema = z.object({
  amount: positiveAmountSchema,
  title: z.string().trim().min(1, "Podaj tytuł wydatku."),
  categoryId: z.string().nullable().optional(),
  paymentSource: z.enum(["cash", "credit"]),
  date: isoDateSchema,
  note: z.string().trim().nullable().optional(),
});

export const incomeSchema = z.object({
  amount: positiveAmountSchema,
  title: z.string().trim().min(1, "Podaj tytuł wpływu."),
  date: isoDateSchema,
  note: z.string().trim().nullable().optional(),
});

export const moneyMovementSchema = z.object({
  amount: positiveAmountSchema,
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type IncomeInput = z.infer<typeof incomeSchema>;
export type MoneyMovementInput = z.infer<typeof moneyMovementSchema>;

export function assertCanCreateCreditExpense(amount: number, summary: FinanceSummary): void {
  if (amount > summary.availableCredit) {
    throw new Error("Kwota przekracza dostępny limit kredytowy.");
  }
}

export function assertCanCreateCashExpense(amount: number, summary: FinanceSummary): void {
  if (amount <= summary.actualCashBalance) {
    return;
  }

  if (amount <= summary.availableCredit) {
    throw new Error("Kwota przekracza gotówkę w przepływie. Możesz wybrać kredyt / płatność odroczoną.");
  }

  throw new Error("Kwota przekracza gotówkę w przepływie.");
}

export function assertCanDepositToSafe(amount: number, summary: FinanceSummary): void {
  if (amount > summary.actualCashBalance) {
    throw new Error("Nie masz tylu dostępnych pieniędzy w głównym przepływie.");
  }
}

export function assertCanWithdrawFromSafe(amount: number, summary: FinanceSummary): void {
  if (amount > summary.actualSafeBalance) {
    throw new Error("Nie masz tyle pieniędzy w sejfie.");
  }
}

export function assertCanRepayCredit(amount: number, summary: FinanceSummary): void {
  if (amount > summary.actualCreditDebt) {
    throw new Error("Spłata nie może być większa niż aktualny dług.");
  }

  if (amount > summary.actualCashBalance) {
    throw new Error("Spłata nie może być większa niż gotówka w głównym przepływie.");
  }
}
