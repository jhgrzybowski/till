import { useCallback } from "react";
import { Text } from "react-native";

import { BillRow } from "@/components/lists/bill-row";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/state";
import { Screen } from "@/components/ui/screen";
import { colors } from "@/components/ui/theme";
import { todayIso } from "@/utils/dates";
import { getBillsList } from "@/features/bills/billService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";

export default function BillsScreen() {
  const loader = useCallback(() => getBillsList(), []);
  const { data, loading, error, refresh } = useAsyncFocus(loader);
  const today = todayIso();

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
        <ErrorState message={error?.message ?? "Nie udało się wczytać rachunków."} onRetry={refresh} />
      </Screen>
    );
  }

  const unpaid = data.filter((bill) => bill.status === "unpaid");
  const settled = data.filter((bill) => bill.status !== "unpaid");

  return (
    <Screen>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>
          Do zapłaty
        </Text>
        {unpaid.length === 0 ? (
          <EmptyState title="Nie masz niezapłaconych rachunków w tym cyklu." />
        ) : (
          unpaid.map((bill) => <BillRow key={bill.id} bill={bill} today={today} />)
        )}
      </Card>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>
          Zapłacone i pominięte
        </Text>
        {settled.length === 0 ? (
          <EmptyState title="Nie ma jeszcze zamkniętych rachunków." />
        ) : (
          settled.map((bill) => <BillRow key={bill.id} bill={bill} today={today} />)
        )}
      </Card>
    </Screen>
  );
}
