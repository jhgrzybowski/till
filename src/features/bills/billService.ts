import { getDatabase } from "@/db/database";
import { getActiveCycleContext } from "@/features/cycle/activeCycleService";
import type { BillInstance } from "@/domain/finance/types";
import { getBillById, listBillsForCycle, updateBillStatus } from "@/repositories/billRepository";
import { createLedgerEntry } from "@/repositories/ledgerRepository";
import { todayIso } from "@/utils/dates";

export async function getBillsList(): Promise<BillInstance[]> {
  const context = await getActiveCycleContext();
  return listBillsForCycle(context.cycle.id);
}

export async function getBillDetails(id: string): Promise<BillInstance | null> {
  return getBillById(id);
}

export async function getBillPaymentDetails(id: string) {
  const [bill, context] = await Promise.all([getBillById(id), getActiveCycleContext()]);

  return {
    bill,
    summary: context.summary,
  };
}

export async function markBillPaid(id: string): Promise<void> {
  const db = await getDatabase();
  const paidAt = todayIso();

  await db.withTransactionAsync(async () => {
    const bill = await getBillById(id);

    if (!bill || bill.status !== "unpaid") {
      return;
    }

    await updateBillStatus(id, "paid", paidAt);
    await createLedgerEntry({
      cycleId: bill.cycleId,
      type: "bill_payment",
      amount: bill.amount,
      date: paidAt,
      title: bill.name,
      sourceAccount: "cash",
      targetAccount: "external",
      relatedBillId: bill.id,
    });
  });
}

export async function markBillSkipped(id: string): Promise<void> {
  const bill = await getBillById(id);

  if (!bill || bill.status !== "unpaid") {
    return;
  }

  await updateBillStatus(id, "skipped", null);
}
