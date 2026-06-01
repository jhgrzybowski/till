import { getActiveCycleContext } from "@/features/cycle/activeCycleService";
import type { LedgerEntry } from "@/domain/finance/types";
import {
  assertCanDepositToSafe,
  assertCanWithdrawFromSafe,
  moneyMovementSchema,
  type MoneyMovementInput,
} from "@/domain/finance/validation";
import { createLedgerEntry } from "@/repositories/ledgerRepository";
import { todayIso } from "@/utils/dates";

export async function getSafeOverview() {
  const context = await getActiveCycleContext();
  const entries: LedgerEntry[] = context.ledgerEntries.filter(
    (entry) => entry.type === "safe_deposit" || entry.type === "safe_withdrawal",
  );

  return { ...context, entries };
}

export async function depositToSafe(rawInput: MoneyMovementInput): Promise<void> {
  const input = moneyMovementSchema.parse(rawInput);
  const context = await getActiveCycleContext();
  assertCanDepositToSafe(input.amount, context.summary);

  await createLedgerEntry({
    cycleId: context.cycle.id,
    type: "safe_deposit",
    amount: input.amount,
    date: todayIso(),
    title: "Wpłata do sejfu",
    sourceAccount: "cash",
    targetAccount: "safe",
  });
}

export async function withdrawFromSafe(rawInput: MoneyMovementInput): Promise<void> {
  const input = moneyMovementSchema.parse(rawInput);
  const context = await getActiveCycleContext();
  assertCanWithdrawFromSafe(input.amount, context.summary);

  await createLedgerEntry({
    cycleId: context.cycle.id,
    type: "safe_withdrawal",
    amount: input.amount,
    date: todayIso(),
    title: "Wypłata z sejfu",
    sourceAccount: "safe",
    targetAccount: "cash",
  });
}
