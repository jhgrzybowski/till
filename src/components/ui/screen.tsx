import type { ReactNode } from "react";
import { ScrollView, type ScrollViewProps } from "react-native";

import { colors } from "./theme";

interface ScreenProps extends ScrollViewProps {
  children: ReactNode;
}

export function Screen({ children, contentContainerStyle, ...props }: ScreenProps) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[{ padding: 16, gap: 16, paddingBottom: 32 }, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  );
}
