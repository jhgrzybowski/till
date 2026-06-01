import { Text, TextInput, type KeyboardTypeOptions, type TextInputProps, View } from "react-native";

import { colors, radii } from "./theme";

interface TextFieldProps extends TextInputProps {
  label: string;
  helper?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
}

export function TextField({ label, helper, error, style, ...props }: TextFieldProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text selectable style={{ color: colors.ink, fontSize: 15, fontWeight: "700" }}>
        {label}
      </Text>
      {helper ? (
        <Text selectable style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>
          {helper}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor="#9A948A"
        style={[
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.danger : colors.border,
            borderCurve: "continuous",
            borderRadius: radii.sm,
            borderWidth: 1,
            color: colors.ink,
            fontSize: 17,
            minHeight: 48,
            paddingHorizontal: 12,
            paddingVertical: 10,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <Text selectable style={{ color: colors.danger, fontSize: 13, lineHeight: 18 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
