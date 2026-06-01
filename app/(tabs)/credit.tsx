import { router } from "expo-router";
import { useCallback } from "react";
import { Text, View } from "react-native";

import { LedgerEntryRow } from "@/components/lists/ledger-entry-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { Screen } from "@/components/ui/screen";
import { colors } from "@/components/ui/theme";
import { formatMoneyPln } from "@/utils/money";
import { getCreditOverview } from "@/features/credit/creditService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
      <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 14 }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.ink, fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "800" }}>
        {value}
      </Text>
    </View>
  );
}

export default function CreditScreen() {
  const loader = useCallback(() => getCreditOverview(), []);
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
        <ErrorState message={error?.message ?? "Nie udało się wczytać kredytu."} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={{ backgroundColor: "#ECE7F4", borderColor: "#D6CCE6" }}>
        <Text selectable style={{ color: colors.credit, fontSize: 15, fontWeight: "800" }}>
          Aktualny dług
        </Text>
        <Text selectable style={{ color: colors.ink, fontSize: 34, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
          {formatMoneyPln(data.summary.actualCreditDebt)}
        </Text>
        <Metric label="Limit kredytowy" value={formatMoneyPln(data.snapshot.creditLimit)} />
        <Metric label="Dostępny limit" value={formatMoneyPln(data.summary.availableCredit)} />
      </Card>
      <Button title="Spłać kredyt" onPress={() => router.push("/credit/repay")} />
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>
          Historia kredytu
        </Text>
        {data.entries.length === 0 ? (
          <EmptyState title="Nie ma jeszcze ruchów kredytowych." />
        ) : (
          data.entries.map((entry) => <LedgerEntryRow key={entry.id} entry={entry} />)
        )}
      </Card>
    </Screen>
  );
}
