import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Text, View } from "react-native";

import { moneyMovementSchema, type MoneyMovementInput } from "@/domain/finance/validation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Screen } from "@/components/ui/screen";
import { TextField } from "@/components/ui/text-field";
import { colors } from "@/components/ui/theme";
import { normalizeMoneyInput } from "@/utils/money";

interface MoneyActionFormProps {
  title: string;
  description?: string;
  infoRows?: Array<{ label: string; value: string }>;
  submitTitle: string;
  onSubmit: (input: MoneyMovementInput) => Promise<void>;
}

function message(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function MoneyActionForm({ description, infoRows = [], submitTitle, onSubmit }: MoneyActionFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    clearErrors,
    setError,
  } = useForm({
    resolver: zodResolver(moneyMovementSchema),
    defaultValues: { amount: "" },
  });

  async function submit(values: unknown) {
    try {
      await onSubmit(values as MoneyMovementInput);
      router.back();
    } catch (cause) {
      setError("root", {
        message: cause instanceof Error ? cause.message : "Nie udało się zapisać ruchu.",
      });
    }
  }

  return (
    <Screen>
      {description ? (
        <Text selectable style={{ color: colors.muted, fontSize: 15, lineHeight: 21 }}>
          {description}
        </Text>
      ) : null}
      {infoRows.length > 0 ? (
        <Card style={{ backgroundColor: colors.primarySoft, borderColor: colors.primarySoft }}>
          {infoRows.map((row) => (
            <View key={row.label} style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}>
              <Text selectable style={{ color: colors.primary, flex: 1, fontSize: 14, fontWeight: "700" }}>
                {row.label}
              </Text>
              <Text
                selectable
                style={{ color: colors.primary, fontSize: 14, fontVariant: ["tabular-nums"], fontWeight: "900" }}
              >
                {row.value}
              </Text>
            </View>
          ))}
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
      </Card>
      {errors.root?.message ? (
        <Text selectable style={{ color: colors.danger, fontSize: 14 }}>
          {message(errors.root.message)}
        </Text>
      ) : null}
      <View style={{ gap: 10 }}>
        <Button title={submitTitle} loading={isSubmitting} onPress={handleSubmit(submit)} />
        <Button title="Anuluj" variant="secondary" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
