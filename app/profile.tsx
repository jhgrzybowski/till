import { router } from "expo-router";
import { useCallback } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { colors } from "@/components/ui/theme";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";
import { getUserSettings } from "@/repositories/settingsRepository";
import { getInitials } from "@/utils/user";

export default function ProfileScreen() {
  const loader = useCallback(() => getUserSettings(), []);
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
        <ErrorState message={error?.message ?? "Nie udało się wczytać profilu."} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <View style={{ alignItems: "center", gap: 12 }}>
          <View
            style={{
              alignItems: "center",
              backgroundColor: colors.primary,
              borderCurve: "continuous",
              borderRadius: 28,
              height: 56,
              justifyContent: "center",
              width: 56,
            }}
          >
            <Text selectable style={{ color: "#FFFFFF", fontSize: 20, fontWeight: "900" }}>
              {getInitials(data.displayName)}
            </Text>
          </View>
          <Text selectable style={{ color: colors.ink, fontSize: 24, fontWeight: "900" }}>
            {data.displayName}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 20, textAlign: "center" }}>
            Możesz wrócić do danych startowych i przetestować onboarding od nowa.
          </Text>
        </View>
      </Card>

      <Card style={{ backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }}>
        <Text selectable style={{ color: colors.danger, fontSize: 14, fontWeight: "800", lineHeight: 20 }}>
          Zapisanie danych startowych wyczyści obecny cykl, ruchy i rachunki cykliczne, a potem utworzy cykl od nowa.
        </Text>
      </Card>

      <Button title="Edytuj dane onboardingowe" onPress={() => router.push("/onboarding?edit=1")} />
    </Screen>
  );
}
