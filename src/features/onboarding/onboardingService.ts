import { getDatabase, initializeDatabase } from "@/db/database";
import { calculateActiveCycle, getBillDueDatesInCycle } from "@/domain/finance/cycle";
import { onboardingSchema, type OnboardingInput } from "@/domain/finance/validation";
import { getActiveCycleContext } from "@/features/cycle/activeCycleService";
import { createAccountSnapshot } from "@/repositories/accountSnapshotRepository";
import { createBillInstance } from "@/repositories/billRepository";
import { createBudgetCycle } from "@/repositories/cycleRepository";
import { createRecurringBill, listActiveRecurringBills } from "@/repositories/recurringBillRepository";
import { getUserSettings, saveUserSettings } from "@/repositories/settingsRepository";

export async function getOnboardingDefaults() {
  await initializeDatabase();
  const settings = await getUserSettings();

  if (!settings) {
    return null;
  }

  const recurringBills = await listActiveRecurringBills();

  try {
    const context = await getActiveCycleContext();

    return {
      displayName: settings.displayName,
      currentCashBalance: context.summary.actualCashBalance,
      safeBalance: context.summary.actualSafeBalance,
      creditLimit: context.snapshot.creditLimit,
      currentCreditDebt: context.summary.actualCreditDebt,
      paydayDayOfMonth: settings.paydayDayOfMonth,
      expectedSalary: settings.expectedSalary,
      recurringBills: recurringBills.map((bill) => ({
        name: bill.name,
        amount: bill.amount,
        dueDayOfMonth: bill.dueDayOfMonth,
      })),
    };
  } catch {
    return {
      displayName: settings.displayName,
      currentCashBalance: 0,
      safeBalance: 0,
      creditLimit: 0,
      currentCreditDebt: 0,
      paydayDayOfMonth: settings.paydayDayOfMonth,
      expectedSalary: settings.expectedSalary,
      recurringBills: recurringBills.map((bill) => ({
        name: bill.name,
        amount: bill.amount,
        dueDayOfMonth: bill.dueDayOfMonth,
      })),
    };
  }
}

export async function completeOnboarding(rawInput: OnboardingInput, today = new Date()): Promise<void> {
  await initializeDatabase();
  const input = onboardingSchema.parse(rawInput);
  const cycleRange = calculateActiveCycle(today, input.paydayDayOfMonth);
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    await db.runAsync("DELETE FROM ledger_entries");
    await db.runAsync("DELETE FROM bill_instances");
    await db.runAsync("DELETE FROM account_snapshots");
    await db.runAsync("DELETE FROM budget_cycles");
    await db.runAsync("DELETE FROM recurring_bills");

    await saveUserSettings({
      displayName: input.displayName,
      paydayDayOfMonth: input.paydayDayOfMonth,
      expectedSalary: input.expectedSalary,
      onboardingCompleted: true,
    });

    const cycle = await createBudgetCycle({
      startDate: cycleRange.startDate,
      endDate: cycleRange.endDate,
      status: "active",
      expectedSalary: input.expectedSalary,
    });

    await createAccountSnapshot({
      cycleId: cycle.id,
      initialCashBalance: input.currentCashBalance,
      initialSafeBalance: input.safeBalance,
      initialCreditDebt: input.currentCreditDebt,
      creditLimit: input.creditLimit,
    });

    for (const billInput of input.recurringBills) {
      const recurringBill = await createRecurringBill({
        name: billInput.name,
        amount: billInput.amount,
        dueDayOfMonth: billInput.dueDayOfMonth,
      });
      const dueDates = getBillDueDatesInCycle(recurringBill.dueDayOfMonth, cycleRange);

      for (const dueDate of dueDates) {
        await createBillInstance({
          cycleId: cycle.id,
          recurringBillId: recurringBill.id,
          name: recurringBill.name,
          amount: recurringBill.amount,
          dueDate,
        });
      }
    }
  });
}
