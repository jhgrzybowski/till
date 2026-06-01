import { useCallback } from "react";

import { MoneyActionForm } from "@/components/forms/money-action-form";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { Screen } from "@/components/ui/screen";
import { getSafeOverview, withdrawFromSafe } from "@/features/safe/safeService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";
import { formatMoneyPln } from "@/utils/money";

export default function SafeWithdrawScreen() {
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
        <ErrorState message={error?.message ?? "Nie udało się wczytać sejfu."} onRetry={refresh} />
      </Screen>
    );
  }

  return (
    <MoneyActionForm
      title="Wypłata z sejfu"
      description="Przenosisz pieniądze z sejfu z powrotem do głównego przepływu."
      infoRows={[
        {
          label: "Możesz wypłacić z sejfu",
          value: formatMoneyPln(data.summary.actualSafeBalance),
        },
        {
          label: "Gotówka po stronie przepływu",
          value: formatMoneyPln(data.summary.actualCashBalance),
        },
      ]}
      submitTitle="Wypłać z sejfu"
      onSubmit={withdrawFromSafe}
    />
  );
}
