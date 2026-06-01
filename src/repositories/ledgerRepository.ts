import { getDatabase } from "@/db/database";
import type { AccountType, LedgerEntry, LedgerEntryType } from "@/domain/finance/types";
import { createId } from "@/utils/id";

type LedgerEntryRow = {
  id: string;
  cycle_id: string;
  type: LedgerEntryType;
  amount: number;
  date: string;
  title: string;
  source_account: AccountType;
  target_account: AccountType;
  note: string | null;
  related_bill_id: string | null;
  category_id: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateLedgerEntryInput = {
  cycleId: string;
  type: LedgerEntryType;
  amount: number;
  date: string;
  title: string;
  sourceAccount: AccountType;
  targetAccount: AccountType;
  note?: string | null;
  relatedBillId?: string | null;
  categoryId?: string | null;
};

function mapLedgerEntry(row: LedgerEntryRow): LedgerEntry {
  return {
    id: row.id,
    cycleId: row.cycle_id,
    type: row.type,
    amount: row.amount,
    date: row.date,
    title: row.title,
    sourceAccount: row.source_account,
    targetAccount: row.target_account,
    note: row.note,
    relatedBillId: row.related_bill_id,
    categoryId: row.category_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createLedgerEntry(input: CreateLedgerEntryInput): Promise<LedgerEntry> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const entry: LedgerEntry = {
    id: createId("ledger"),
    cycleId: input.cycleId,
    type: input.type,
    amount: input.amount,
    date: input.date,
    title: input.title,
    sourceAccount: input.sourceAccount,
    targetAccount: input.targetAccount,
    note: input.note ?? null,
    relatedBillId: input.relatedBillId ?? null,
    categoryId: input.categoryId ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `
    INSERT INTO ledger_entries (
      id,
      cycle_id,
      type,
      amount,
      date,
      title,
      source_account,
      target_account,
      note,
      related_bill_id,
      category_id,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      entry.id,
      entry.cycleId,
      entry.type,
      entry.amount,
      entry.date,
      entry.title,
      entry.sourceAccount,
      entry.targetAccount,
      entry.note,
      entry.relatedBillId,
      entry.categoryId,
      entry.createdAt,
      entry.updatedAt,
    ],
  );

  return entry;
}

export async function listLedgerEntriesForCycle(cycleId: string): Promise<LedgerEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<LedgerEntryRow>(
    `
    SELECT * FROM ledger_entries
    WHERE cycle_id = ?
    ORDER BY date DESC, created_at DESC
    `,
    [cycleId],
  );

  return rows.map(mapLedgerEntry);
}

export async function listRecentLedgerEntries(cycleId: string, limit = 8): Promise<LedgerEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<LedgerEntryRow>(
    `
    SELECT * FROM ledger_entries
    WHERE cycle_id = ?
    ORDER BY date DESC, created_at DESC
    LIMIT ?
    `,
    [cycleId, limit],
  );

  return rows.map(mapLedgerEntry);
}
