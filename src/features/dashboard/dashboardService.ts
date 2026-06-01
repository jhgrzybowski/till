import { isPayday } from "@/domain/finance/cycle";
import type { BillInstance, LedgerEntry } from "@/domain/finance/types";
import { getActiveCycleContext } from "@/features/cycle/activeCycleService";

export async function getDashboardData() {
  const context = await getActiveCycleContext();
  const upcomingBills = context.billInstances
    .filter((bill) => bill.status === "unpaid")
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));
  const recentEntries: LedgerEntry[] = context.ledgerEntries.slice(0, 6);
  const paydayNoticeVisible = isPayday(context.today, context.settings.paydayDayOfMonth);

  return {
    ...context,
    upcomingBills,
    recentEntries,
    paydayNoticeVisible,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;
