export type CycleStatus = "active" | "closed";

export type LedgerEntryType =
  | "cash_expense"
  | "credit_expense"
  | "income"
  | "salary"
  | "safe_deposit"
  | "safe_withdrawal"
  | "credit_repayment"
  | "bill_payment";

export type AccountType = "cash" | "credit" | "safe" | "external";

export type BillStatus = "unpaid" | "paid" | "skipped";

export interface UserSettings {
  id: string;
  displayName: string;
  paydayDayOfMonth: number;
  expectedSalary: number;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCycle {
  id: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  expectedSalary: number;
  actualSalary: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSnapshot {
  id: string;
  cycleId: string;
  initialCashBalance: number;
  initialSafeBalance: number;
  initialCreditDebt: number;
  creditLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  cycleId: string;
  type: LedgerEntryType;
  amount: number;
  date: string;
  title: string;
  sourceAccount: AccountType;
  targetAccount: AccountType;
  note: string | null;
  relatedBillId: string | null;
  categoryId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDayOfMonth: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BillInstance {
  id: string;
  cycleId: string;
  recurringBillId: string | null;
  name: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSummary {
  actualCashBalance: number;
  actualSafeBalance: number;
  actualCreditDebt: number;
  availableCredit: number;
  upcomingUnpaidBillsTotal: number;
  projectedCashAtNextPayday: number;
  projectedCreditDebtAtNextPayday: number;
  netPositionAtNextPayday: number;
}
