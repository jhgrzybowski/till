import { getActiveCycleContext } from "@/features/cycle/activeCycleService";
import type { LedgerEntry } from "@/domain/finance/types";
import {
  assertCanCreateCashExpense,
  assertCanCreateCreditExpense,
  expenseSchema,
  incomeSchema,
  type ExpenseInput,
  type IncomeInput,
} from "@/domain/finance/validation";
import { listCategories } from "@/repositories/categoryRepository";
import { createLedgerEntry } from "@/repositories/ledgerRepository";

function nullableText(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export async function getTransactionList(): Promise<LedgerEntry[]> {
  const context = await getActiveCycleContext();
  return context.ledgerEntries;
}

export async function getExpenseFormData() {
  const [context, categories] = await Promise.all([getActiveCycleContext(), listCategories()]);
  return { context, categories };
}

export async function createExpense(rawInput: ExpenseInput): Promise<void> {
  const input = expenseSchema.parse(rawInput);
  const context = await getActiveCycleContext(input.date);

  if (input.paymentSource === "cash") {
    assertCanCreateCashExpense(input.amount, context.summary);
  }

  if (input.paymentSource === "credit") {
    assertCanCreateCreditExpense(input.amount, context.summary);
  }

  await createLedgerEntry({
    cycleId: context.cycle.id,
    type: input.paymentSource === "cash" ? "cash_expense" : "credit_expense",
    amount: input.amount,
    date: input.date,
    title: input.title,
    sourceAccount: input.paymentSource,
    targetAccount: "external",
    note: nullableText(input.note),
    categoryId: input.categoryId ?? null,
  });
}

export async function createIncome(rawInput: IncomeInput): Promise<void> {
  const input = incomeSchema.parse(rawInput);
  const context = await getActiveCycleContext(input.date);

  await createLedgerEntry({
    cycleId: context.cycle.id,
    type: "income",
    amount: input.amount,
    date: input.date,
    title: input.title,
    sourceAccount: "external",
    targetAccount: "cash",
    note: nullableText(input.note),
  });
}
