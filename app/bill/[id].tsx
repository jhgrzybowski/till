import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { colors } from "@/components/ui/theme";
import { billStatusLabel } from "@/domain/finance/labels";
import { getBillPaymentDetails, markBillPaid, markBillSkipped } from "@/features/bills/billService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";
import { formatShortDatePl } from "@/utils/dates";
import { formatMoneyPln } from "@/utils/money";

export default function BillDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const loader = useCallback(async () => {
    if (!id) {
      throw new Error("Brak identyfikatora rachunku.");
    }

    return getBillPaymentDetails(id);
  }, [id]);
  const { data, loading, error, refresh } = useAsyncFocus(loader);

  async function runAction(action: "paid" | "skipped") {
    if (!id) {
      return;
    }

    setSubmitting(true);
    setActionError(null);

    try {
      if (action === "paid") {
        await markBillPaid(id);
      } else {
        await markBillSkipped(id);
      }

      router.back();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Nie udało się zaktualizować rachunku.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !data) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error || !data?.bill) {
    return (
      <Screen>
        <ErrorState message={error?.message ?? "Nie znaleziono rachunku."} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: "900" }}>
          {data.bill.name}
        </Text>
        <Text selectable style={{ color: colors.ink, fontSize: 34, fontVariant: ["tabular-nums"], fontWeight: "900" }}>
          {formatMoneyPln(data.bill.amount)}
        </Text>
        <View style={{ gap: 6 }}>
          <Text selectable style={{ color: colors.muted, fontSize: 15 }}>
            Termin: {formatShortDatePl(data.bill.dueDate)}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15 }}>
            Status: {billStatusLabel(data.bill.status)}
          </Text>
        </View>
      </Card>

      <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
        <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
          <Text selectable style={{ color: colors.primary, flex: 1, fontSize: 14, fontWeight: "700" }}>
            Gotówka w przepływie
          </Text>
          <Text
            selectable
            style={{ color: colors.primary, fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "900" }}
          >
            {formatMoneyPln(data.summary.actualCashBalance)}
          </Text>
        </View>
      </Card>

      {actionError ? (
        <Text selectable style={{ color: colors.danger, fontSize: 14 }}>
          {actionError}
        </Text>
      ) : null}

      {data.bill.status === "unpaid" ? (
        <View style={{ gap: 10 }}>
          <Button title="Oznacz jako zapłacony" loading={submitting} onPress={() => runAction("paid")} />
          <Button
            title="Pomiń w tym cyklu"
            variant="secondary"
            disabled={submitting}
            onPress={() => runAction("skipped")}
          />
        </View>
      ) : (
        <Button title="Wróć" variant="secondary" onPress={() => router.back()} />
      )}
    </Screen>
  );
}
