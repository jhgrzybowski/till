import { getActiveCycleContext } from "@/features/cycle/activeCycleService";
import type { LedgerEntry } from "@/domain/finance/types";
import {
  assertCanRepayCredit,
  moneyMovementSchema,
  type MoneyMovementInput,
} from "@/domain/finance/validation";
import { createLedgerEntry } from "@/repositories/ledgerRepository";
import { todayIso } from "@/utils/dates";

export async function getCreditOverview() {
  const context = await getActiveCycleContext();
  const entries: LedgerEntry[] = context.ledgerEntries.filter(
    (entry) => entry.type === "credit_expense" || entry.type === "credit_repayment",
  );

  return { ...context, entries };
}

export async function repayCredit(rawInput: MoneyMovementInput): Promise<void> {
  const input = moneyMovementSchema.parse(rawInput);
  const context = await getActiveCycleContext();
  assertCanRepayCredit(input.amount, context.summary);

  await createLedgerEntry({
    cycleId: context.cycle.id,
    type: "credit_repayment",
    amount: input.amount,
    date: todayIso(),
    title: "Spłata kredytu",
    sourceAccount: "cash",
    targetAccount: "credit",
  });
}
