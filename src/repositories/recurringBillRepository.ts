import { getDatabase } from "@/db/database";
import type { RecurringBill } from "@/domain/finance/types";
import { createId } from "@/utils/id";

type RecurringBillRow = {
  id: string;
  name: string;
  amount: number;
  due_day_of_month: number;
  is_active: number;
  created_at: string;
  updated_at: string;
};

function mapRecurringBill(row: RecurringBillRow): RecurringBill {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    dueDayOfMonth: row.due_day_of_month,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createRecurringBill(input: {
  name: string;
  amount: number;
  dueDayOfMonth: number;
  isActive?: boolean;
}): Promise<RecurringBill> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const bill: RecurringBill = {
    id: createId("recurring_bill"),
    name: input.name,
    amount: input.amount,
    dueDayOfMonth: input.dueDayOfMonth,
    isActive: input.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `
    INSERT INTO recurring_bills (
      id,
      name,
      amount,
      due_day_of_month,
      is_active,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      bill.id,
      bill.name,
      bill.amount,
      bill.dueDayOfMonth,
      bill.isActive ? 1 : 0,
      bill.createdAt,
      bill.updatedAt,
    ],
  );

  return bill;
}

export async function listActiveRecurringBills(): Promise<RecurringBill[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<RecurringBillRow>(
    "SELECT * FROM recurring_bills WHERE is_active = 1 ORDER BY due_day_of_month ASC, name ASC",
  );

  return rows.map(mapRecurringBill);
}
