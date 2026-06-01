import { Stack, useGlobalSearchParams, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { ErrorState, LoadingState } from "@/components/ui/state";
import { colors } from "@/components/ui/theme";
import { initializeDatabase } from "@/db/database";
import { getUserSettings } from "@/repositories/settingsRepository";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const params = useGlobalSearchParams<{ edit?: string }>();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        await initializeDatabase();

        if (active) {
          setReady(true);
        }
      } catch (cause) {
        if (active) {
          setError(cause instanceof Error ? cause : new Error("Nie udało się uruchomić bazy danych."));
          setReady(true);
        }
      }
    }

    boot();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready || error) {
      return;
    }

    let active = true;

    async function guardRoute() {
      const settings = await getUserSettings();
      const completed = Boolean(settings?.onboardingCompleted);

      if (!active) {
        return;
      }

      const inOnboarding = segments[0] === "onboarding";
      const editingOnboarding = inOnboarding && params.edit === "1";

      if (!completed && !inOnboarding) {
        router.replace("/onboarding");
      }

      if (completed && inOnboarding && !editingOnboarding) {
        router.replace("/");
      }
    }

    guardRoute();

    return () => {
      active = false;
    };
  }, [error, params.edit, ready, router, segments]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background }}>
        <LoadingState label="Przygotowuję aplikację..." />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", backgroundColor: colors.background }}>
        <ErrorState message={error.message} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerBackTitle: "Wróć", headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ title: "Start", headerShown: true }} />
        <Stack.Screen name="profile" options={{ title: "Profil", headerShown: true }} />
        <Stack.Screen name="(tabs)" options={{ title: "Start" }} />
        <Stack.Screen
          name="expense/new"
          options={{ title: "Nowy wydatek", presentation: "modal", headerShown: true }}
        />
        <Stack.Screen
          name="income/new"
          options={{ title: "Nowy wpływ", presentation: "modal", headerShown: true }}
        />
        <Stack.Screen
          name="safe/deposit"
          options={{ title: "Wpłata do sejfu", presentation: "modal", headerShown: true }}
        />
        <Stack.Screen
          name="safe/withdraw"
          options={{ title: "Wypłata z sejfu", presentation: "modal", headerShown: true }}
        />
        <Stack.Screen
          name="credit/repay"
          options={{ title: "Spłata kredytu", presentation: "modal", headerShown: true }}
        />
        <Stack.Screen name="bill/[id]" options={{ title: "Rachunek", headerShown: true }} />
      </Stack>
    </>
  );
}
