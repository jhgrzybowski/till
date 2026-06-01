import { ActivityIndicator, Text, View } from "react-native";

import { Button } from "./button";
import { colors } from "./theme";

export function LoadingState({ label = "Ładowanie..." }: { label?: string }) {
  return (
    <View style={{ alignItems: "center", gap: 10, padding: 24 }}>
      <ActivityIndicator color={colors.primary} />
      <Text selectable style={{ color: colors.muted, fontSize: 15 }}>
        {label}
      </Text>
    </View>
  );
}

export function EmptyState({ title }: { title: string }) {
  return (
    <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 20 }}>
      {title}
    </Text>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text selectable style={{ color: colors.danger, fontSize: 15, lineHeight: 21 }}>
        {message}
      </Text>
      {onRetry ? <Button title="Spróbuj ponownie" onPress={onRetry} variant="secondary" /> : null}
    </View>
  );
}
