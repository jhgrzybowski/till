import { useCallback } from "react";

import { MoneyActionForm } from "@/components/forms/money-action-form";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { Screen } from "@/components/ui/screen";
import { depositToSafe, getSafeOverview } from "@/features/safe/safeService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";
import { formatMoneyPln } from "@/utils/money";

export default function SafeDepositScreen() {
  const loader = useCallback(() => getSafeOverview(), []);
  const { data, loading, error, refresh } = useAsyncFocus(loader);

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
        <ErrorState message={error?.message ?? "Nie udało się wczytać dostępnej gotówki."} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <MoneyActionForm
      title="Wpłata do sejfu"
      description="Przenosisz realne pieniądze z głównego przepływu do sejfu."
      infoRows={[
        {
          label: "Możesz przenieść z przepływu",
          value: formatMoneyPln(data.summary.actualCashBalance),
        },
        {
          label: "Aktualny sejf",
          value: formatMoneyPln(data.summary.actualSafeBalance),
        },
      ]}
      submitTitle="Wpłać do sejfu"
      onSubmit={depositToSafe}
    />
  );
}
