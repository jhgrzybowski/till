export const DATABASE_NAME = "till.db";
export const DATABASE_VERSION = 2;

export const CREATE_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL DEFAULT 'Ty',
  payday_day_of_month INTEGER NOT NULL,
  expected_salary REAL NOT NULL,
  onboarding_completed INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS budget_cycles (
  id TEXT PRIMARY KEY NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'closed')),
  expected_salary REAL NOT NULL,
  actual_salary REAL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS account_snapshots (
  id TEXT PRIMARY KEY NOT NULL,
  cycle_id TEXT NOT NULL,
  initial_cash_balance REAL NOT NULL,
  initial_safe_balance REAL NOT NULL,
  initial_credit_debt REAL NOT NULL,
  credit_limit REAL NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (cycle_id) REFERENCES budget_cycles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  is_default INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recurring_bills (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  due_day_of_month INTEGER NOT NULL,
  is_active INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bill_instances (
  id TEXT PRIMARY KEY NOT NULL,
  cycle_id TEXT NOT NULL,
  recurring_bill_id TEXT,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('unpaid', 'paid', 'skipped')),
  paid_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (cycle_id) REFERENCES budget_cycles(id) ON DELETE CASCADE,
  FOREIGN KEY (recurring_bill_id) REFERENCES recurring_bills(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id TEXT PRIMARY KEY NOT NULL,
  cycle_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'cash_expense',
    'credit_expense',
    'income',
    'salary',
    'safe_deposit',
    'safe_withdrawal',
    'credit_repayment',
    'bill_payment'
  )),
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  source_account TEXT NOT NULL CHECK (source_account IN ('cash', 'credit', 'safe', 'external')),
  target_account TEXT NOT NULL CHECK (target_account IN ('cash', 'credit', 'safe', 'external')),
  note TEXT,
  related_bill_id TEXT,
  category_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (cycle_id) REFERENCES budget_cycles(id) ON DELETE CASCADE,
  FOREIGN KEY (related_bill_id) REFERENCES bill_instances(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_budget_cycles_status ON budget_cycles(status);
CREATE INDEX IF NOT EXISTS idx_account_snapshots_cycle ON account_snapshots(cycle_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_cycle_date ON ledger_entries(cycle_id, date);
CREATE INDEX IF NOT EXISTS idx_bill_instances_cycle_due ON bill_instances(cycle_id, due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_bills_active ON recurring_bills(is_active);
`;
