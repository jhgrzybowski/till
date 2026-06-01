import { useCallback, useState } from "react";
import { Text } from "react-native";

import { LedgerEntryRow } from "@/components/lists/ledger-entry-row";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { Screen } from "@/components/ui/screen";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { colors } from "@/components/ui/theme";
import type { LedgerEntry } from "@/domain/finance/types";
import { getTransactionList } from "@/features/transactions/transactionService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";

type Filter = "all" | "expenses" | "income" | "safe" | "credit";

function matchesFilter(entry: LedgerEntry, filter: Filter): boolean {
  switch (filter) {
    case "expenses":
      return entry.type === "cash_expense" || entry.type === "credit_expense" || entry.type === "bill_payment";
    case "income":
      return entry.type === "income" || entry.type === "salary";
    case "safe":
      return entry.type === "safe_deposit" || entry.type === "safe_withdrawal";
    case "credit":
      return entry.type === "credit_expense" || entry.type === "credit_repayment";
    case "all":
    default:
      return true;
  }
}

export default function TransactionsScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const loader = useCallback(() => getTransactionList(), []);
  const { data, loading, error, refresh } = useAsyncFocus(loader);

  if (loading && !data) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error || !data) {
    return (
      <Screen>
        <ErrorState message={error?.message ?? "Nie udało się wczytać ruchów."} onRetry={refresh} />
      </Screen>
    );
  }

  const entries = data.filter((entry) => matchesFilter(entry, filter));

  return (
    <Screen>
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        options={[
          { label: "Wszystkie", value: "all" },
          { label: "Wydatki", value: "expenses" },
          { label: "Wpływy", value: "income" },
          { label: "Sejf", value: "safe" },
          { label: "Kredyt", value: "credit" },
        ]}
      />
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>
          Historia cyklu
        </Text>
        {entries.length === 0 ? (
          <EmptyState title="Brak ruchów dla tego filtra." />
        ) : (
          entries.map((entry) => <LedgerEntryRow key={entry.id} entry={entry} />)
        )}
      </Card>
    </Screen>
  );
}
