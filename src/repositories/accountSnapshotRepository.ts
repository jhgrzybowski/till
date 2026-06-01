import { getDatabase } from "@/db/database";
import type { AccountSnapshot } from "@/domain/finance/types";
import { createId } from "@/utils/id";

type AccountSnapshotRow = {
  id: string;
  cycle_id: string;
  initial_cash_balance: number;
  initial_safe_balance: number;
  initial_credit_debt: number;
  credit_limit: number;
  created_at: string;
  updated_at: string;
};

function mapSnapshot(row: AccountSnapshotRow): AccountSnapshot {
  return {
    id: row.id,
    cycleId: row.cycle_id,
    initialCashBalance: row.initial_cash_balance,
    initialSafeBalance: row.initial_safe_balance,
    initialCreditDebt: row.initial_credit_debt,
    creditLimit: row.credit_limit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createAccountSnapshot(input: {
  cycleId: string;
  initialCashBalance: number;
  initialSafeBalance: number;
  initialCreditDebt: number;
  creditLimit: number;
}): Promise<AccountSnapshot> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const snapshot: AccountSnapshot = {
    id: createId("snapshot"),
    cycleId: input.cycleId,
    initialCashBalance: input.initialCashBalance,
    initialSafeBalance: input.initialSafeBalance,
    initialCreditDebt: input.initialCreditDebt,
    creditLimit: input.creditLimit,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `
    INSERT INTO account_snapshots (
      id,
      cycle_id,
      initial_cash_balance,
      initial_safe_balance,
      initial_credit_debt,
      credit_limit,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      snapshot.id,
      snapshot.cycleId,
      snapshot.initialCashBalance,
      snapshot.initialSafeBalance,
      snapshot.initialCreditDebt,
      snapshot.creditLimit,
      snapshot.createdAt,
      snapshot.updatedAt,
    ],
  );

  return snapshot;
}

export async function getSnapshotForCycle(cycleId: string): Promise<AccountSnapshot | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<AccountSnapshotRow>(
    "SELECT * FROM account_snapshots WHERE cycle_id = ? LIMIT 1",
    [cycleId],
  );

  return row ? mapSnapshot(row) : null;
}
