import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { billStatusLabel } from "@/domain/finance/labels";
import type { BillInstance } from "@/domain/finance/types";
import { formatShortDatePl } from "@/utils/dates";
import { formatMoneyPln } from "@/utils/money";
import { colors, radii } from "@/components/ui/theme";

interface BillRowProps {
  bill: BillInstance;
  today?: string;
}

export function BillRow({ bill, today }: BillRowProps) {
  const overdue = bill.status === "unpaid" && today ? bill.dueDate < today : false;

  return (
    <Link href={`/bill/${bill.id}`} asChild>
      <Pressable
        style={({ pressed }) => ({
          backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
          borderColor: overdue ? colors.danger : colors.border,
          borderCurve: "continuous",
          borderRadius: radii.sm,
          borderWidth: 1,
          flexDirection: "row",
          gap: 12,
          justifyContent: "space-between",
          padding: 14,
        })}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text selectable style={{ color: colors.ink, fontSize: 16, fontWeight: "800" }}>
            {bill.name}
          </Text>
          <Text selectable style={{ color: overdue ? colors.danger : colors.muted, fontSize: 13 }}>
            {overdue ? "Po terminie" : billStatusLabel(bill.status)} · {formatShortDatePl(bill.dueDate)}
          </Text>
        </View>
        <Text
          selectable
          style={{ color: colors.ink, fontSize: 15, fontVariant: ["tabular-nums"], fontWeight: "800" }}
        >
          {formatMoneyPln(bill.amount)}
        </Text>
      </Pressable>
    </Link>
  );
}
