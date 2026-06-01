import { describe, expect, it } from "vitest";

import { calculateCycleSummary } from "./calculations";
import { calculateActiveCycle, isPayday } from "./cycle";
import type { AccountSnapshot, BillInstance, BudgetCycle, LedgerEntry } from "./types";
import {
  assertCanCreateCashExpense,
  assertCanCreateCreditExpense,
  assertCanRepayCredit,
  assertCanWithdrawFromSafe,
  nonNegativeAmountSchema,
  positiveAmountSchema,
} from "./validation";
import { normalizeIntegerInput, normalizeMoneyInput } from "@/utils/money";

const cycle: BudgetCycle = {
  id: "cycle-1",
  startDate: "2026-06-10",
  endDate: "2026-07-09",
  status: "active",
  expectedSalary: 5000,
  actualSalary: null,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

const snapshot: AccountSnapshot = {
  id: "snapshot-1",
  cycleId: "cycle-1",
  initialCashBalance: 1000,
  initialSafeBalance: 500,
  initialCreditDebt: 100,
  creditLimit: 1000,
  createdAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-01T00:00:00.000Z",
};

function entry(overrides: Partial<LedgerEntry>): LedgerEntry {
  return {
    id: `entry-${Math.random()}`,
    cycleId: "cycle-1",
    type: "cash_expense",
    amount: 0,
    date: "2026-06-15",
    title: "Test",
    sourceAccount: "cash",
    targetAccount: "external",
    note: null,
    relatedBillId: null,
    categoryId: null,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

function bill(overrides: Partial<BillInstance>): BillInstance {
  return {
    id: `bill-${Math.random()}`,
    cycleId: "cycle-1",
    recurringBillId: null,
    name: "Czynsz",
    amount: 0,
    dueDate: "2026-06-20",
    status: "unpaid",
    paidAt: null,
    createdAt: "2026-06-01T00:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...overrides,
  };
}

function summary(entries: LedgerEntry[] = [], bills: BillInstance[] = []) {
  return calculateCycleSummary({
    cycle,
    snapshot,
    ledgerEntries: entries,
    billInstances: bills,
    today: "2026-06-15",
  });
}

describe("payday cycle rules", () => {
  it("creates the correct active cycle when onboarding happens in the middle of a cycle", () => {
    expect(calculateActiveCycle("2026-06-20", 10)).toEqual({
      startDate: "2026-06-10",
      endDate: "2026-07-09",
    });
  });

  it("maps payday day 31 to the last valid day in shorter months", () => {
    expect(calculateActiveCycle("2026-02-15", 31)).toEqual({
      startDate: "2026-01-31",
      endDate: "2026-02-27",
    });
    expect(isPayday("2026-02-28", 31)).toBe(true);
  });
});

describe("cycle financial calculations", () => {
  it("decreases actual cash for a cash expense", () => {
    const result = summary([entry({ type: "cash_expense", amount: 120 })]);
    expect(result.actualCashBalance).toBe(880);
  });

  it("increases credit debt for a credit expense without decreasing cash", () => {
    const result = summary([
      entry({
        type: "credit_expense",
        amount: 200,
        sourceAccount: "credit",
      }),
    ]);

    expect(result.actualCashBalance).toBe(1000);
    expect(result.actualCreditDebt).toBe(300);
  });

  it("increases actual cash for income outside salary", () => {
    const result = summary([
      entry({
        type: "income",
        amount: 250,
        sourceAccount: "external",
        targetAccount: "cash",
      }),
    ]);

    expect(result.actualCashBalance).toBe(1250);
  });

  it("decreases projected cash for unpaid bills without decreasing actual cash", () => {
    const result = summary([], [bill({ amount: 300, dueDate: "2026-06-25" })]);

    expect(result.actualCashBalance).toBe(1000);
    expect(result.projectedCashAtNextPayday).toBe(700);
  });

  it("decreases actual cash for a paid bill and does not count it again as upcoming", () => {
    const result = summary(
      [
        entry({
          type: "bill_payment",
          amount: 300,
          relatedBillId: "bill-1",
        }),
      ],
      [bill({ id: "bill-1", amount: 300, dueDate: "2026-06-25", status: "paid" })],
    );

    expect(result.actualCashBalance).toBe(700);
    expect(result.upcomingUnpaidBillsTotal).toBe(0);
    expect(result.projectedCashAtNextPayday).toBe(700);
  });

  it("decreases cash and increases safe for a safe deposit", () => {
    const result = summary([
      entry({
        type: "safe_deposit",
        amount: 150,
        sourceAccount: "cash",
        targetAccount: "safe",
      }),
    ]);

    expect(result.actualCashBalance).toBe(850);
    expect(result.actualSafeBalance).toBe(650);
  });

  it("decreases safe and increases cash for a safe withdrawal", () => {
    const result = summary([
      entry({
        type: "safe_withdrawal",
        amount: 150,
        sourceAccount: "safe",
        targetAccount: "cash",
      }),
    ]);

    expect(result.actualCashBalance).toBe(1150);
    expect(result.actualSafeBalance).toBe(350);
  });

  it("decreases cash and decreases credit debt for a credit repayment", () => {
    const result = summary([
      entry({
        type: "credit_repayment",
        amount: 80,
        sourceAccount: "cash",
        targetAccount: "credit",
      }),
    ]);

    expect(result.actualCashBalance).toBe(920);
    expect(result.actualCreditDebt).toBe(20);
  });

  it("sets net position to projected cash minus projected credit debt", () => {
    const result = summary([], [bill({ amount: 250, dueDate: "2026-06-25" })]);
    expect(result.netPositionAtNextPayday).toBe(650);
  });

  it("does not increase net position with the credit limit", () => {
    const result = calculateCycleSummary({
      cycle,
      snapshot: { ...snapshot, initialCashBalance: 0, initialCreditDebt: 0, creditLimit: 5000 },
      ledgerEntries: [],
      billInstances: [],
      today: "2026-06-15",
    });

    expect(result.availableCredit).toBe(5000);
    expect(result.netPositionAtNextPayday).toBe(0);
  });
});

describe("financial validations", () => {
  it("normalizes malformed numeric input while typing", () => {
    expect(normalizeMoneyInput("010")).toBe("10");
    expect(normalizeMoneyInput("00008")).toBe("8");
    expect(normalizeMoneyInput(",0")).toBe("0,0");
    expect(normalizeMoneyInput("0000,0")).toBe("0,0");
    expect(normalizeMoneyInput("0012,30")).toBe("12,30");
    expect(normalizeIntegerInput("00008")).toBe("8");
  });

  it("accepts Polish comma decimal amounts", () => {
    expect(positiveAmountSchema.parse("100,50")).toBe(100.5);
    expect(positiveAmountSchema.parse("1 234,56")).toBe(1234.56);
  });

  it("uses a Polish validation message for an empty positive amount", () => {
    const result = positiveAmountSchema.safeParse("");
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Podaj poprawną kwotę.");
    }
  });

  it("treats empty non-negative money fields as zero", () => {
    expect(nonNegativeAmountSchema.parse("")).toBe(0);
  });

  it("rejects a credit expense larger than available credit", () => {
    const result = calculateCycleSummary({
      cycle,
      snapshot: { ...snapshot, initialCreditDebt: 950, creditLimit: 1000 },
      ledgerEntries: [],
      billInstances: [],
      today: "2026-06-15",
    });

    expect(() => assertCanCreateCreditExpense(60, result)).toThrow();
  });

  it("rejects a cash expense larger than actual cash balance", () => {
    expect(() => assertCanCreateCashExpense(1001, summary())).toThrow();
  });

  it("rejects a safe withdrawal larger than safe balance", () => {
    expect(() => assertCanWithdrawFromSafe(600, summary())).toThrow();
  });

  it("rejects a credit repayment larger than credit debt", () => {
    expect(() => assertCanRepayCredit(150, summary())).toThrow();
  });
});
