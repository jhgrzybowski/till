import type { AccountSnapshot, BillInstance, BudgetCycle, FinanceSummary, LedgerEntry } from "./types";
import { toIsoDate } from "@/utils/dates";
import { normalizeAmount } from "@/utils/money";

export interface CalculateCycleSummaryInput {
  cycle: BudgetCycle;
  snapshot: AccountSnapshot;
  ledgerEntries: LedgerEntry[];
  billInstances: BillInstance[];
  today: Date | string;
}

function sum(entries: LedgerEntry[], predicate: (entry: LedgerEntry) => boolean): number {
  return entries.reduce((total, entry) => (predicate(entry) ? total + entry.amount : total), 0);
}

function todayToIso(today: Date | string): string {
  return typeof today === "string" ? today : toIsoDate(today);
}

export function calculateCycleSummary(input: CalculateCycleSummaryInput): FinanceSummary {
  const { cycle, snapshot, ledgerEntries, billInstances } = input;
  const today = todayToIso(input.today);

  const actualCashBalance =
    snapshot.initialCashBalance +
    sum(ledgerEntries, (entry) => entry.type === "income" && entry.targetAccount === "cash") +
    sum(ledgerEntries, (entry) => entry.type === "salary" && entry.targetAccount === "cash") +
    sum(ledgerEntries, (entry) => entry.type === "safe_withdrawal" && entry.targetAccount === "cash") -
    sum(ledgerEntries, (entry) => entry.type === "cash_expense" && entry.sourceAccount === "cash") -
    sum(ledgerEntries, (entry) => entry.type === "safe_deposit" && entry.sourceAccount === "cash") -
    sum(ledgerEntries, (entry) => entry.type === "credit_repayment" && entry.sourceAccount === "cash") -
    sum(ledgerEntries, (entry) => entry.type === "bill_payment" && entry.sourceAccount === "cash");

  const actualSafeBalance =
    snapshot.initialSafeBalance +
    sum(ledgerEntries, (entry) => entry.type === "safe_deposit" && entry.targetAccount === "safe") -
    sum(ledgerEntries, (entry) => entry.type === "safe_withdrawal" && entry.sourceAccount === "safe");

  const actualCreditDebt =
    snapshot.initialCreditDebt +
    sum(ledgerEntries, (entry) => entry.type === "credit_expense" && entry.sourceAccount === "credit") -
    sum(ledgerEntries, (entry) => entry.type === "credit_repayment" && entry.targetAccount === "credit");

  const availableCredit = snapshot.creditLimit - actualCreditDebt;

  const upcomingUnpaidBillsTotal = billInstances.reduce((total, bill) => {
    if (bill.status !== "unpaid") {
      return total;
    }

    if (bill.dueDate < today || bill.dueDate > cycle.endDate) {
      return total;
    }

    return total + bill.amount;
  }, 0);

  const projectedCashAtNextPayday = actualCashBalance - upcomingUnpaidBillsTotal;
  const projectedCreditDebtAtNextPayday = actualCreditDebt;
  const netPositionAtNextPayday = projectedCashAtNextPayday - projectedCreditDebtAtNextPayday;

  return {
    actualCashBalance: normalizeAmount(actualCashBalance),
    actualSafeBalance: normalizeAmount(actualSafeBalance),
    actualCreditDebt: normalizeAmount(actualCreditDebt),
    availableCredit: normalizeAmount(availableCredit),
    upcomingUnpaidBillsTotal: normalizeAmount(upcomingUnpaidBillsTotal),
    projectedCashAtNextPayday: normalizeAmount(projectedCashAtNextPayday),
    projectedCreditDebtAtNextPayday: normalizeAmount(projectedCreditDebtAtNextPayday),
    netPositionAtNextPayday: normalizeAmount(netPositionAtNextPayday),
  };
}
