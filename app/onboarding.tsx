import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { TextField } from "@/components/ui/text-field";
import { colors } from "@/components/ui/theme";
import { onboardingSchema, type OnboardingInput } from "@/domain/finance/validation";
import { completeOnboarding, getOnboardingDefaults } from "@/features/onboarding/onboardingService";
import { normalizeIntegerInput, normalizeMoneyInput } from "@/utils/money";

function message(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default function OnboardingScreen() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editMode = edit === "1";
  const [loadingDefaults, setLoadingDefaults] = useState(editMode);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
      currentCashBalance: "",
      safeBalance: "",
      creditLimit: "",
      currentCreditDebt: "",
      paydayDayOfMonth: 10,
      expectedSalary: "",
      recurringBills: [],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "recurringBills" });

  useEffect(() => {
    if (!editMode) {
      setLoadingDefaults(false);
      return;
    }

    let active = true;
    setLoadingDefaults(true);
    setLoadError(null);

    getOnboardingDefaults()
      .then((defaults) => {
        if (!active || !defaults) {
          return;
        }

        reset({
          displayName: defaults.displayName,
          currentCashBalance: String(defaults.currentCashBalance),
          safeBalance: String(defaults.safeBalance),
          creditLimit: String(defaults.creditLimit),
          currentCreditDebt: String(defaults.currentCreditDebt),
          paydayDayOfMonth: defaults.paydayDayOfMonth,
          expectedSalary: String(defaults.expectedSalary),
          recurringBills: defaults.recurringBills.map((bill) => ({
            name: bill.name,
            amount: String(bill.amount),
            dueDayOfMonth: bill.dueDayOfMonth,
          })),
        });
      })
      .catch((cause: unknown) => {
        if (active) {
          setLoadError(cause instanceof Error ? cause : new Error("Nie udało się wczytać danych."));
        }
      })
      .finally(() => {
        if (active) {
          setLoadingDefaults(false);
        }
      });

    return () => {
      active = false;
    };
  }, [editMode, reset]);

  async function onSubmit(values: unknown) {
    try {
      await completeOnboarding(values as OnboardingInput);
      router.replace("/");
    } catch (cause) {
      setError("root", {
        message: cause instanceof Error ? cause.message : "Nie udało się zapisać onboardingu.",
      });
    }
  }

  if (loadingDefaults) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (loadError) {
    return (
      <Screen>
        <ErrorState message={loadError.message} />
      </Screen>
    );
  }

  return (
    <Screen>
        <View style={{ gap: 6 }}>
          <Text selectable style={{ color: colors.ink, fontSize: 28, fontWeight: "900" }}>
            {editMode ? "Zmień dane startowe" : "Ustaw swój cykl"}
          </Text>
          <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 21 }}>
            {editMode
              ? "Zapisanie danych rozpocznie testowy cykl od nowa i wyczyści dotychczasowe ruchy."
              : "Podaj stan finansów od dziś. Aplikacja nie będzie odtwarzać wcześniejszych wydatków."}
          </Text>
        </View>

        <Card>
          <Controller
            control={control}
            name="displayName"
            render={({ field }) => (
              <TextField
                label="Jak masz na imię?"
                value={String(field.value ?? "")}
                onChangeText={field.onChange}
                error={message(errors.displayName?.message)}
              />
            )}
          />
          <Controller
            control={control}
            name="currentCashBalance"
            render={({ field }) => (
              <TextField
                label="Ile masz teraz dostępnych pieniędzy w głównym przepływie?"
                helper="Nie licz sejfu, oszczędności odłożonych ani dostępnego limitu kredytowego."
                keyboardType="decimal-pad"
                placeholder="0"
                value={String(field.value ?? "")}
                onChangeText={(value) => field.onChange(normalizeMoneyInput(value))}
                error={message(errors.currentCashBalance?.message)}
              />
            )}
          />
          <Controller
            control={control}
            name="safeBalance"
            render={({ field }) => (
              <TextField
                label="Ile masz teraz w sejfie?"
                keyboardType="decimal-pad"
                placeholder="0"
                value={String(field.value ?? "")}
                onChangeText={(value) => field.onChange(normalizeMoneyInput(value))}
                error={message(errors.safeBalance?.message)}
              />
            )}
          />
          <Controller
            control={control}
            name="creditLimit"
            render={({ field }) => (
              <TextField
                label="Jaki masz dostępny limit kredytowy lub limit płatności odroczonych?"
                keyboardType="decimal-pad"
                placeholder="0"
                value={String(field.value ?? "")}
                onChangeText={(value) => field.onChange(normalizeMoneyInput(value))}
                error={message(errors.creditLimit?.message)}
              />
            )}
          />
          <Controller
            control={control}
            name="currentCreditDebt"
            render={({ field }) => (
              <TextField
                label="Ile masz teraz wykorzystanego kredytu lub płatności odroczonych?"
                keyboardType="decimal-pad"
                placeholder="0"
                value={String(field.value ?? "")}
                onChangeText={(value) => field.onChange(normalizeMoneyInput(value))}
                error={message(errors.currentCreditDebt?.message)}
              />
            )}
          />
          <Controller
            control={control}
            name="paydayDayOfMonth"
            render={({ field }) => (
              <TextField
                label="Którego dnia miesiąca zwykle otrzymujesz wypłatę?"
                keyboardType="number-pad"
                value={String(field.value ?? "")}
                onChangeText={(value) => field.onChange(normalizeIntegerInput(value))}
                error={message(errors.paydayDayOfMonth?.message)}
              />
            )}
          />
          <Controller
            control={control}
            name="expectedSalary"
            render={({ field }) => (
              <TextField
                label="Jakiej wypłaty spodziewasz się w każdym cyklu?"
                keyboardType="decimal-pad"
                placeholder="0"
                value={String(field.value ?? "")}
                onChangeText={(value) => field.onChange(normalizeMoneyInput(value))}
                error={message(errors.expectedSalary?.message)}
              />
            )}
          />
        </Card>

        <Card>
          <View style={{ gap: 4 }}>
            <Text selectable style={{ color: colors.ink, fontSize: 18, fontWeight: "900" }}>
              Rachunki cykliczne
            </Text>
            <Text selectable style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>
              Możesz pominąć ten krok i wrócić do rachunków później.
            </Text>
          </View>

          {fields.map((field, index) => (
            <View key={field.id} style={{ gap: 10, borderTopColor: colors.border, borderTopWidth: 1, paddingTop: 12 }}>
              <Controller
                control={control}
                name={`recurringBills.${index}.name`}
                render={({ field: billField }) => (
                  <TextField
                    label="Nazwa rachunku"
                    value={String(billField.value ?? "")}
                    onChangeText={billField.onChange}
                    error={message(errors.recurringBills?.[index]?.name?.message)}
                  />
                )}
              />
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name={`recurringBills.${index}.amount`}
                    render={({ field: billField }) => (
                      <TextField
                        label="Kwota"
                        keyboardType="decimal-pad"
                        placeholder="0"
                        value={String(billField.value ?? "")}
                        onChangeText={(value) => billField.onChange(normalizeMoneyInput(value))}
                        error={message(errors.recurringBills?.[index]?.amount?.message)}
                      />
                    )}
                  />
                </View>
                <View style={{ width: 112 }}>
                  <Controller
                    control={control}
                    name={`recurringBills.${index}.dueDayOfMonth`}
                    render={({ field: billField }) => (
                      <TextField
                        label="Dzień"
                        keyboardType="number-pad"
                        value={String(billField.value ?? "")}
                        onChangeText={(value) => billField.onChange(normalizeIntegerInput(value))}
                        error={message(errors.recurringBills?.[index]?.dueDayOfMonth?.message)}
                      />
                    )}
                  />
                </View>
              </View>
              <Button title="Usuń rachunek" variant="ghost" onPress={() => remove(index)} />
            </View>
          ))}

          <Button
            title="Dodaj rachunek"
            variant="secondary"
            onPress={() => append({ name: "", amount: "", dueDayOfMonth: 1 })}
          />
        </Card>

        {errors.root?.message ? (
          <Text selectable style={{ color: colors.danger, fontSize: 14 }}>
            {message(errors.root.message)}
          </Text>
        ) : null}

        <Button
          title={editMode ? "Zapisz dane startowe" : "Zacznij korzystać"}
          loading={isSubmitting}
          onPress={handleSubmit(onSubmit)}
        />
      </Screen>
  );
}
