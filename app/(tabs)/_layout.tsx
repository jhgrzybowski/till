import { Tabs } from "expo-router";

import { CycleHeader } from "@/components/navigation/cycle-header";
import { colors } from "@/components/ui/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <CycleHeader />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Cykl", tabBarLabel: "Start" }} />
      <Tabs.Screen name="transactions" options={{ title: "Ruchy", tabBarLabel: "Ruchy" }} />
      <Tabs.Screen name="bills" options={{ title: "Rachunki", tabBarLabel: "Rachunki" }} />
      <Tabs.Screen name="safe" options={{ title: "Sejf", tabBarLabel: "Sejf" }} />
      <Tabs.Screen name="credit" options={{ title: "Kredyt", tabBarLabel: "Kredyt" }} />
    </Tabs>
  );
}
