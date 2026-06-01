import { router } from "expo-router";
import { useCallback } from "react";
import { Text, View } from "react-native";

import { BillRow } from "@/components/lists/bill-row";
import { LedgerEntryRow } from "@/components/lists/ledger-entry-row";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { Screen } from "@/components/ui/screen";
import { colors } from "@/components/ui/theme";
import { formatMoneyPln } from "@/utils/money";
import { getDashboardData } from "@/features/dashboard/dashboardService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
      <Text selectable style={{ color: colors.muted, flex: 1, fontSize: 14 }}>
        {label}
      </Text>
      <Text selectable style={{ color: colors.ink, fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "800" }}>
        {value}
      </Text>
    </View>
  );
}

export default function DashboardScreen() {
  const loader = useCallback(() => getDashboardData(), []);
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
        <ErrorState message={error?.message ?? "Nie udało się wczytać dashboardu."} onRetry={refresh} />
      </Screen>
    );
  }

  const net = data.summary.netPositionAtNextPayday;
  const positive = net >= 0;

  return (
    <Screen>
      {data.paydayNoticeVisible ? (
        <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
          <Text selectable style={{ color: colors.primary, fontSize: 15, fontWeight: "800", lineHeight: 21 }}>
            Dziś dzień wypłaty. Możesz dodać faktyczną wypłatę i rozpocząć kolejny cykl.
          </Text>
        </Card>
      ) : null}

      <Card style={{ backgroundColor: positive ? colors.surface : colors.dangerSoft, gap: 14 }}>
        <Text selectable style={{ color: positive ? colors.primary : colors.danger, fontSize: 15, fontWeight: "800" }}>
          {positive ? "Prognoza końca cyklu" : "Do pokrycia z kolejnej wypłaty"}
        </Text>
        <Text
          selectable
          style={{
            color: colors.ink,
            fontSize: 30,
            fontVariant: ["tabular-nums"],
            fontWeight: "900",
            lineHeight: 36,
          }}
        >
          {positive
            ? `Po tym cyklu zostanie Ci ${formatMoneyPln(net)}`
            : `Z następnej wypłaty musisz pokryć ${formatMoneyPln(Math.abs(net))}`}
        </Text>
      </Card>

      <Card>
        <Metric
          label="Gotówka do następnej wypłaty"
          value={formatMoneyPln(data.summary.projectedCashAtNextPayday)}
        />
        <Metric label="Dług do spłaty" value={formatMoneyPln(data.summary.projectedCreditDebtAtNextPayday)} />
        <Metric label="Sejf" value={formatMoneyPln(data.summary.actualSafeBalance)} />
      </Card>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Button title="Dodaj wydatek" onPress={() => router.push("/expense/new")} style={{ flexBasis: "48%", flexGrow: 1 }} />
        <Button
          title="Dodaj wpływ"
          variant="secondary"
          onPress={() => router.push("/income/new")}
          style={{ flexBasis: "48%", flexGrow: 1 }}
        />
        <Button
          title="Sejf"
          variant="secondary"
          onPress={() => router.push("/safe")}
          style={{ flexBasis: "48%", flexGrow: 1 }}
        />
        <Button
          title="Spłać kredyt"
          variant="secondary"
          onPress={() => router.push("/credit/repay")}
          style={{ flexBasis: "48%", flexGrow: 1 }}
        />
      </View>

      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>
          Nadchodzące rachunki
        </Text>
        {data.upcomingBills.length === 0 ? (
          <EmptyState title="Brak niezapłaconych rachunków w tym cyklu." />
        ) : (
          data.upcomingBills.map((bill) => <BillRow key={bill.id} bill={bill} today={data.today} />)
        )}
      </Card>

      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>
          Ostatnie ruchy
        </Text>
        {data.recentEntries.length === 0 ? (
          <EmptyState title="Jeszcze nie ma żadnych ruchów w aktywnym cyklu." />
        ) : (
          data.recentEntries.map((entry) => <LedgerEntryRow key={entry.id} entry={entry} />)
        )}
      </Card>
    </Screen>
  );
}
