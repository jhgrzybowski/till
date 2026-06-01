import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { TextField } from "@/components/ui/text-field";
import { colors, radii } from "@/components/ui/theme";
import { expenseSchema, type ExpenseInput } from "@/domain/finance/validation";
import { createExpense, getExpenseFormData } from "@/features/transactions/transactionService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";
import { todayIso } from "@/utils/dates";
import { formatMoneyPln, normalizeMoneyInput, parseMoneyInputValue } from "@/utils/money";

function message(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default function NewExpenseScreen() {
  const loader = useCallback(() => getExpenseFormData(), []);
  const { data, loading, error, refresh } = useAsyncFocus(loader);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    clearErrors,
    setError,
  } = useForm({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      title: "",
      categoryId: null,
      paymentSource: "cash" as const,
      date: todayIso(),
      note: "",
    },
  });
  const selectedCategoryId = watch("categoryId");
  const paymentSource = watch("paymentSource");
  const amountInput = watch("amount");

  async function submit(values: unknown) {
    try {
      await createExpense(values as ExpenseInput);
      router.back();
    } catch (cause) {
      setError("root", {
        message: cause instanceof Error ? cause.message : "Nie udało się dodać wydatku.",
      });
    }
  }

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
        <ErrorState message={error?.message ?? "Nie udało się przygotować formularza."} onRetry={refresh} />
      </Screen>
    );
  }

  const amountValue = parseMoneyInputValue(String(amountInput ?? ""));
  const cashBalance = data.context.summary.actualCashBalance;
  const availableCredit = data.context.summary.availableCredit;
  const cashExpenseTooHigh = paymentSource === "cash" && amountValue !== null && amountValue > cashBalance;
  const creditExpenseTooHigh = paymentSource === "credit" && amountValue !== null && amountValue > availableCredit;
  const creditCanCoverCashExpense = cashExpenseTooHigh && amountValue !== null && amountValue <= availableCredit;
  const disableSubmit = isSubmitting || cashExpenseTooHigh || creditExpenseTooHigh;

  return (
    <Screen>
      <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
        <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
          <Text selectable style={{ color: colors.primary, flex: 1, fontSize: 14, fontWeight: "700" }}>
            Gotówka w przepływie
          </Text>
          <Text
            selectable
            style={{ color: colors.primary, fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "900" }}
          >
            {formatMoneyPln(data.context.summary.actualCashBalance)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
          <Text selectable style={{ color: colors.primary, flex: 1, fontSize: 14, fontWeight: "700" }}>
            Dostępny limit kredytowy
          </Text>
          <Text
            selectable
            style={{ color: colors.primary, fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "900" }}
          >
            {formatMoneyPln(data.context.summary.availableCredit)}
          </Text>
        </View>
      </Card>

      {cashExpenseTooHigh ? (
        <Card style={{ backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }}>
          <Text selectable style={{ color: colors.danger, fontSize: 14, fontWeight: "800", lineHeight: 20 }}>
            Kwota przekracza gotówkę w przepływie. Nie można dodać wydatku gotówką, który tworzy ujemny przepływ.
          </Text>
          {creditCanCoverCashExpense ? (
            <Button
              title="Użyj kredytu"
              variant="secondary"
              onPress={() => {
                clearErrors("root");
                setValue("paymentSource", "credit");
              }}
            />
          ) : (
            <Text selectable style={{ color: colors.danger, fontSize: 13, lineHeight: 18 }}>
              Dostępny limit kredytowy też nie pokrywa tej kwoty.
            </Text>
          )}
        </Card>
      ) : null}

      {creditExpenseTooHigh ? (
        <Card style={{ backgroundColor: colors.dangerSoft, borderColor: colors.dangerSoft }}>
          <Text selectable style={{ color: colors.danger, fontSize: 14, fontWeight: "800", lineHeight: 20 }}>
            Kwota przekracza dostępny limit kredytowy.
          </Text>
        </Card>
      ) : null}

      <Card>
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <TextField
              label="Kwota"
              keyboardType="decimal-pad"
              placeholder="0"
              value={String(field.value ?? "")}
              onChangeText={(value) => {
                clearErrors("root");
                field.onChange(normalizeMoneyInput(value));
              }}
              error={message(errors.amount?.message)}
            />
          )}
        />
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextField
                label="Tytuł"
                value={String(field.value ?? "")}
                onChangeText={field.onChange}
                error={message(errors.title?.message)}
              />
            )}
          />
          <View style={{ gap: 8 }}>
            <Text selectable style={{ color: colors.ink, fontSize: 15, fontWeight: "700" }}>
              Źródło płatności
            </Text>
            <SegmentedControl
              value={paymentSource}
              onChange={(value) => {
                clearErrors("root");
                setValue("paymentSource", value);
              }}
              options={[
                { label: "Gotówka", value: "cash" },
                { label: "Kredyt / płatność odroczona", value: "credit" },
              ]}
            />
          </View>
          <View style={{ gap: 8 }}>
            <Text selectable style={{ color: colors.ink, fontSize: 15, fontWeight: "700" }}>
              Kategoria
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Pressable
                onPress={() => setValue("categoryId", null)}
                style={{
                  backgroundColor: selectedCategoryId ? colors.surfaceMuted : colors.primarySoft,
                  borderCurve: "continuous",
                  borderRadius: radii.sm,
                  paddingHorizontal: 12,
                  paddingVertical: 9,
                }}
              >
                <Text selectable style={{ color: selectedCategoryId ? colors.muted : colors.primary, fontWeight: "700" }}>
                  Brak
                </Text>
              </Pressable>
              {data.categories.map((category) => {
                const selected = selectedCategoryId === category.id;
                return (
                  <Pressable
                    key={category.id}
                    onPress={() => setValue("categoryId", category.id)}
                    style={{
                      backgroundColor: selected ? colors.primarySoft : colors.surfaceMuted,
                      borderCurve: "continuous",
                      borderRadius: radii.sm,
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                    }}
                  >
                    <Text selectable style={{ color: selected ? colors.primary : colors.muted, fontWeight: "700" }}>
                      {category.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Controller
            control={control}
            name="date"
            render={({ field }) => (
              <TextField
                label="Data"
                value={String(field.value ?? "")}
                onChangeText={field.onChange}
                error={message(errors.date?.message)}
              />
            )}
          />
          <Controller
            control={control}
            name="note"
            render={({ field }) => (
              <TextField
                label="Notatka"
                value={String(field.value ?? "")}
                onChangeText={field.onChange}
                multiline
                error={message(errors.note?.message)}
              />
            )}
          />
        </Card>

        {errors.root?.message ? (
          <Text selectable style={{ color: colors.danger, fontSize: 14 }}>
            {message(errors.root.message)}
          </Text>
        ) : null}

      <View style={{ gap: 10 }}>
        <Button
          title="Dodaj wydatek"
          disabled={disableSubmit}
          loading={isSubmitting}
          onPress={handleSubmit(submit)}
        />
        <Button title="Anuluj" variant="secondary" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
