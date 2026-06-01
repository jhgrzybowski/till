import { getDatabase } from "@/db/database";
import type { BillInstance, BillStatus } from "@/domain/finance/types";
import { createId } from "@/utils/id";

type BillInstanceRow = {
  id: string;
  cycle_id: string;
  recurring_bill_id: string | null;
  name: string;
  amount: number;
  due_date: string;
  status: BillStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapBill(row: BillInstanceRow): BillInstance {
  return {
    id: row.id,
    cycleId: row.cycle_id,
    recurringBillId: row.recurring_bill_id,
    name: row.name,
    amount: row.amount,
    dueDate: row.due_date,
    status: row.status,
    paidAt: row.paid_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createBillInstance(input: {
  cycleId: string;
  recurringBillId: string | null;
  name: string;
  amount: number;
  dueDate: string;
  status?: BillStatus;
}): Promise<BillInstance> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const bill: BillInstance = {
    id: createId("bill"),
    cycleId: input.cycleId,
    recurringBillId: input.recurringBillId,
    name: input.name,
    amount: input.amount,
    dueDate: input.dueDate,
    status: input.status ?? "unpaid",
    paidAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `
    INSERT INTO bill_instances (
      id,
      cycle_id,
      recurring_bill_id,
      name,
      amount,
      due_date,
      status,
      paid_at,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      bill.id,
      bill.cycleId,
      bill.recurringBillId,
      bill.name,
      bill.amount,
      bill.dueDate,
      bill.status,
      bill.paidAt,
      bill.createdAt,
      bill.updatedAt,
    ],
  );

  return bill;
}

export async function listBillsForCycle(cycleId: string): Promise<BillInstance[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<BillInstanceRow>(
    `
    SELECT * FROM bill_instances
    WHERE cycle_id = ?
    ORDER BY
      CASE status WHEN 'unpaid' THEN 0 WHEN 'paid' THEN 1 ELSE 2 END,
      due_date ASC,
      name ASC
    `,
    [cycleId],
  );

  return rows.map(mapBill);
}

export async function getBillById(id: string): Promise<BillInstance | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<BillInstanceRow>("SELECT * FROM bill_instances WHERE id = ?", [
    id,
  ]);

  return row ? mapBill(row) : null;
}

export async function updateBillStatus(
  id: string,
  status: BillStatus,
  paidAt: string | null,
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE bill_instances SET status = ?, paid_at = ?, updated_at = ? WHERE id = ?",
    [status, paidAt, new Date().toISOString(), id],
  );
}
