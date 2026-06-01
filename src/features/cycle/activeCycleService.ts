import { initializeDatabase } from "@/db/database";
import { calculateCycleSummary } from "@/domain/finance/calculations";
import type {
  AccountSnapshot,
  BillInstance,
  BudgetCycle,
  FinanceSummary,
  LedgerEntry,
  UserSettings,
} from "@/domain/finance/types";
import { todayIso } from "@/utils/dates";
import { getSnapshotForCycle } from "@/repositories/accountSnapshotRepository";
import { listBillsForCycle } from "@/repositories/billRepository";
import { getActiveCycle } from "@/repositories/cycleRepository";
import { listLedgerEntriesForCycle } from "@/repositories/ledgerRepository";
import { getUserSettings } from "@/repositories/settingsRepository";

export interface ActiveCycleContext {
  settings: UserSettings;
  cycle: BudgetCycle;
  snapshot: AccountSnapshot;
  ledgerEntries: LedgerEntry[];
  billInstances: BillInstance[];
  summary: FinanceSummary;
  today: string;
}

export async function getActiveCycleContext(today = todayIso()): Promise<ActiveCycleContext> {
  await initializeDatabase();

  const settings = await getUserSettings();
  const cycle = await getActiveCycle();

  if (!settings || !settings.onboardingCompleted || !cycle) {
    throw new Error("Onboarding is not completed.");
  }

  const snapshot = await getSnapshotForCycle(cycle.id);

  if (!snapshot) {
    throw new Error("Active cycle snapshot is missing.");
  }

  const [ledgerEntries, billInstances] = await Promise.all([
    listLedgerEntriesForCycle(cycle.id),
    listBillsForCycle(cycle.id),
  ]);

  const summary = calculateCycleSummary({
    cycle,
    snapshot,
    ledgerEntries,
    billInstances,
    today,
  });

  return {
    settings,
    cycle,
    snapshot,
    ledgerEntries,
    billInstances,
    summary,
    today,
  };
}
