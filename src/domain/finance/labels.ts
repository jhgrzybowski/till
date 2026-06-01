import type { AccountType, BillStatus, LedgerEntry, LedgerEntryType } from "./types";

export function ledgerTypeLabel(type: LedgerEntryType): string {
  switch (type) {
    case "cash_expense":
      return "Wydatek gotówką";
    case "credit_expense":
      return "Wydatek kredytem";
    case "income":
      return "Wpływ";
    case "salary":
      return "Wypłata";
    case "safe_deposit":
      return "Wpłata do sejfu";
    case "safe_withdrawal":
      return "Wypłata z sejfu";
    case "credit_repayment":
      return "Spłata kredytu";
    case "bill_payment":
      return "Rachunek";
  }
}

export function accountLabel(account: AccountType): string {
  switch (account) {
    case "cash":
      return "gotówka";
    case "credit":
      return "kredyt";
    case "safe":
      return "sejf";
    case "external":
      return "zewnętrzne";
  }
}

export function billStatusLabel(status: BillStatus): string {
  switch (status) {
    case "unpaid":
      return "Do zapłaty";
    case "paid":
      return "Zapłacony";
    case "skipped":
      return "Pominięty";
  }
}

export function affectedAccountLabel(entry: LedgerEntry): string {
  if (entry.type === "credit_expense" || entry.type === "credit_repayment") {
    return "kredyt";
  }

  if (entry.type === "safe_deposit" || entry.type === "safe_withdrawal") {
    return "sejf";
  }

  return accountLabel(entry.sourceAccount === "external" ? entry.targetAccount : entry.sourceAccount);
}
