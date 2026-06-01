import { useCallback } from "react";

import { MoneyActionForm } from "@/components/forms/money-action-form";
import { ErrorState, LoadingState } from "@/components/ui/state";
import { Screen } from "@/components/ui/screen";
import { getCreditOverview, repayCredit } from "@/features/credit/creditService";
import { useAsyncFocus } from "@/hooks/useAsyncFocus";
import { formatMoneyPln } from "@/utils/money";

export default function CreditRepayScreen() {
  const loader = useCallback(() => getCreditOverview(), []);
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
        <ErrorState message={error?.message ?? "Nie udało się wczytać kredytu."} onRetry={refresh} />
      </Screen>
    );
  }

  const maxRepayment = Math.min(data.summary.actualCashBalance, data.summary.actualCreditDebt);

  return (
    <MoneyActionForm
      title="Spłata kredytu"
      description="Spłata zmniejsza gotówkę w głównym przepływie i aktualny dług."
      infoRows={[
        {
          label: "Maksymalnie możesz spłacić",
          value: formatMoneyPln(maxRepayment),
        },
        {
          label: "Gotówka w przepływie",
          value: formatMoneyPln(data.summary.actualCashBalance),
        },
        {
          label: "Aktualny dług",
          value: formatMoneyPln(data.summary.actualCreditDebt),
        },
      ]}
      submitTitle="Spłać kredyt"
      onSubmit={repayCredit}
    />
  );
}
