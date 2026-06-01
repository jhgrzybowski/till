import { getDatabase } from "@/db/database";
import type { BudgetCycle, CycleStatus } from "@/domain/finance/types";
import { createId } from "@/utils/id";

type BudgetCycleRow = {
  id: string;
  start_date: string;
  end_date: string;
  status: CycleStatus;
  expected_salary: number;
  actual_salary: number | null;
  created_at: string;
  updated_at: string;
};

function mapCycle(row: BudgetCycleRow): BudgetCycle {
  return {
    id: row.id,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    expectedSalary: row.expected_salary,
    actualSalary: row.actual_salary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createBudgetCycle(input: {
  startDate: string;
  endDate: string;
  status: CycleStatus;
  expectedSalary: number;
  actualSalary?: number | null;
}): Promise<BudgetCycle> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const cycle: BudgetCycle = {
    id: createId("cycle"),
    startDate: input.startDate,
    endDate: input.endDate,
    status: input.status,
    expectedSalary: input.expectedSalary,
    actualSalary: input.actualSalary ?? null,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `
    INSERT INTO budget_cycles (
      id,
      start_date,
      end_date,
      status,
      expected_salary,
      actual_salary,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      cycle.id,
      cycle.startDate,
      cycle.endDate,
      cycle.status,
      cycle.expectedSalary,
      cycle.actualSalary,
      cycle.createdAt,
      cycle.updatedAt,
    ],
  );

  return cycle;
}

export async function getActiveCycle(): Promise<BudgetCycle | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<BudgetCycleRow>(
    "SELECT * FROM budget_cycles WHERE status = 'active' ORDER BY start_date DESC LIMIT 1",
  );

  return row ? mapCycle(row) : null;
}

export async function closeCycle(cycleId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE budget_cycles SET status = 'closed', updated_at = ? WHERE id = ?",
    [new Date().toISOString(), cycleId],
  );
}
