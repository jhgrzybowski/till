import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, type ViewStyle } from "react-native";

import { colors, radii } from "./theme";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  left?: ReactNode;
  style?: ViewStyle;
}

function variantStyle(variant: ButtonVariant) {
  switch (variant) {
    case "secondary":
      return { backgroundColor: colors.surface, borderColor: colors.border, textColor: colors.ink };
    case "danger":
      return { backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft, textColor: colors.danger };
    case "ghost":
      return { backgroundColor: "transparent", borderColor: "transparent", textColor: colors.primary };
    case "primary":
    default:
      return { backgroundColor: colors.primary, borderColor: colors.primary, textColor: "#FFFFFF" };
  }
}

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  left,
  style,
}: ButtonProps) {
  const palette = variantStyle(variant);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        {
          alignItems: "center",
          backgroundColor:
            pressed && variant === "primary" && !isDisabled ? colors.primaryPressed : palette.backgroundColor,
          borderColor: palette.borderColor,
          borderCurve: "continuous",
          borderRadius: radii.sm,
          borderWidth: 1,
          flexDirection: "row",
          gap: 8,
          justifyContent: "center",
          minHeight: 48,
          opacity: isDisabled ? 0.55 : 1,
          paddingHorizontal: 14,
          paddingVertical: 12,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={palette.textColor} /> : left}
      <Text
        selectable
        style={{ color: palette.textColor, fontSize: 16, fontWeight: "700", textAlign: "center" }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
