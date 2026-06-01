import { Pressable, Text, View } from "react-native";

import { colors, radii } from "./theme";

export interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceMuted,
        borderCurve: "continuous",
        borderRadius: radii.sm,
        flexDirection: "row",
        gap: 4,
        padding: 4,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={{
              alignItems: "center",
              backgroundColor: selected ? colors.surface : "transparent",
              borderCurve: "continuous",
              borderRadius: 6,
              flex: 1,
              justifyContent: "center",
              minHeight: 40,
              paddingHorizontal: 8,
            }}
          >
            <Text
              selectable
              style={{
                color: selected ? colors.ink : colors.muted,
                fontSize: 14,
                fontWeight: selected ? "800" : "600",
                textAlign: "center",
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
