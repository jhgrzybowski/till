import { router } from "expo-router";
import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/components/ui/theme";
import { getActiveCycleContext } from "@/features/cycle/activeCycleService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";
import { formatCycleRangePl } from "@/utils/dates";
import { formatMoneyPln } from "@/utils/money";
import { getInitials } from "@/utils/user";

export function CycleHeader() {
  const insets = useSafeAreaInsets();
  const loader = useCallback(() => getActiveCycleContext(), []);
  const { data } = useAsyncFocus(loader);

  return (
    <View
      style={{
        backgroundColor: colors.background,
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
        paddingBottom: 10,
        paddingHorizontal: 16,
        paddingTop: insets.top + 8,
      }}
    >
      <View
        style={{
          alignItems: "center",
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderCurve: "continuous",
          borderRadius: 12,
          borderWidth: 1,
          flexDirection: "row",
          gap: 12,
          minHeight: 52,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Pressable
          accessibilityLabel="Profil użytkownika"
          onPress={() => router.push("/profile")}
          style={({ pressed }) => ({
            alignItems: "center",
            backgroundColor: pressed ? colors.primaryPressed : colors.primary,
            borderCurve: "continuous",
            borderRadius: 18,
            height: 36,
            justifyContent: "center",
            width: 36,
          })}
        >
          <Text selectable style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "900" }}>
            {getInitials(data?.settings.displayName ?? "Ty")}
          </Text>
        </Pressable>
        <View style={{ flex: 1, gap: 2 }}>
          <Text selectable style={{ color: colors.ink, fontSize: 15, fontWeight: "900" }}>
            {data ? `Cykl: ${formatCycleRangePl(data.cycle.startDate, data.cycle.endDate)}` : "Cykl"}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 12, fontWeight: "700" }}>
            Gotówka do wypłaty: {data ? formatMoneyPln(data.summary.projectedCashAtNextPayday) : "..."}
          </Text>
        </View>
      </View>
    </View>
  );
}
