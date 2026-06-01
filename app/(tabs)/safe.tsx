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
import { getSafeOverview } from "@/features/safe/safeService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";

export default function SafeScreen() {
  const loader = useCallback(() => getSafeOverview(), []);
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
        <ErrorState message={error?.message ?? "Nie udało się wczytać sejfu."} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={{ backgroundColor: "#E4F1F2", borderColor: "#C6DFE3" }}>
        <Text selectable style={{ color: colors.safe, fontSize: 15, fontWeight: "800" }}>
          Aktualny sejf
        </Text>
        <Text selectable style={{ color: colors.ink, fontSize: 34, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
          {formatMoneyPln(data.summary.actualSafeBalance)}
        </Text>
      </Card>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button title="Wpłać" onPress={() => router.push("/safe/deposit")} style={{ flex: 1 }} />
        <Button title="Wypłać" variant="secondary" onPress={() => router.push("/safe/withdraw")} style={{ flex: 1 }} />
      </View>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>
          Historia sejfu
        </Text>
        {data.entries.length === 0 ? (
          <EmptyState title="Nie ma jeszcze ruchów sejfu." />
        ) : (
          data.entries.map((entry) => <LedgerEntryRow key={entry.id} entry={entry} />)
        )}
      </Card>
    </Screen>
  );
}
