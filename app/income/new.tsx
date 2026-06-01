import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { TextField } from "@/components/ui/text-field";
import { colors } from "@/components/ui/theme";
import { incomeSchema, type IncomeInput } from "@/domain/finance/validation";
import { createIncome } from "@/features/transactions/transactionService";
import { todayIso } from "@/utils/dates";
import { normalizeMoneyInput } from "@/utils/money";

function message(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export default function NewIncomeScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    setError,
  } = useForm({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      amount: "",
      title: "",
      date: todayIso(),
      note: "",
    },
  });

  async function submit(values: unknown) {
    try {
      await createIncome(values as IncomeInput);
      router.back();
    } catch (cause) {
      setError("root", {
        message: cause instanceof Error ? cause.message : "Nie udało się dodać wpływu.",
      });
    }
  }

  return (
    <Screen>
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
        <Button title="Dodaj wpływ" loading={isSubmitting} onPress={handleSubmit(submit)} />
        <Button title="Anuluj" variant="secondary" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
