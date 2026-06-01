import { Text, View } from "react-native";

import { affectedAccountLabel, ledgerTypeLabel } from "@/domain/finance/labels";
import type { LedgerEntry } from "@/domain/finance/types";
import { formatShortDatePl } from "@/utils/dates";
import { formatMoneyPln } from "@/utils/money";
import { colors } from "@/components/ui/theme";

interface LedgerEntryRowProps {
  entry: LedgerEntry;
}

function signedAmount(entry: LedgerEntry): string {
  const sign =
    entry.type === "income" || entry.type === "salary" || entry.type === "safe_withdrawal" ? "+" : "-";
  return `${sign}${formatMoneyPln(entry.amount)}`;
}

export function LedgerEntryRow({ entry }: LedgerEntryRowProps) {
  const positive = entry.type === "income" || entry.type === "salary" || entry.type === "safe_withdrawal";

  return (
    <View
      style={{
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
        flexDirection: "row",
        gap: 12,
        justifyContent: "space-between",
        paddingVertical: 12,
      }}
    >
      <View style={{ flex: 1, gap: 3 }}>
        <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: "700" }}>
          {entry.title}
        </Text>
        <Text selectable style={{ color: colors.muted, fontSize: 13 }}>
          {formatShortDatePl(entry.date)} · {ledgerTypeLabel(entry.type)} · {affectedAccountLabel(entry)}
        </Text>
      </View>
      <Text
        selectable
        style={{
          color: positive ? colors.primary : colors.ink,
          fontSize: 15,
          fontVariant: ["tabular-nums"],
          fontWeight: "800",
        }}
      >
        {signedAmount(entry)}
      </Text>
    </View>
  );
}
