import type { ReactNode } from "react";
import { View, type ViewStyle } from "react-native";

import { colors, radii } from "./theme";

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderCurve: "continuous",
          borderRadius: radii.md,
          borderWidth: 1,
          gap: 10,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
