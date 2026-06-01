export function formatMoneyPln(amount: number): string {
  const whole = Number.isInteger(amount);

  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function normalizeAmount(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function normalizeMoneyInput(input: string): string {
  const cleaned = input.replace(/\s|\u00a0/g, "").replace(/[^\d,.]/g, "").replace(/\./g, ",");
  const separatorIndex = cleaned.indexOf(",");
  const integerSource = separatorIndex === -1 ? cleaned : cleaned.slice(0, separatorIndex);
  const decimalSource =
    separatorIndex === -1 ? "" : cleaned.slice(separatorIndex + 1).replace(/,/g, "");
  const hasSeparator = separatorIndex !== -1;
  const integerDigits = integerSource.replace(/\D/g, "");
  const decimalDigits = decimalSource.replace(/\D/g, "");
  const normalizedInteger = integerDigits.replace(/^0+(?=\d)/, "") || (hasSeparator ? "0" : "");

  if (!hasSeparator) {
    return normalizedInteger;
  }

  return `${normalizedInteger},${decimalDigits}`;
}

export function normalizeIntegerInput(input: string): string {
  const digits = input.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  return digits.replace(/^0+(?=\d)/, "");
}

export function parseMoneyInputValue(input: string): number | null {
  const normalized = normalizeMoneyInput(input);

  if (!normalized || normalized === ",") {
    return null;
  }

  const value = Number(normalized.replace(",", "."));

  return Number.isFinite(value) ? value : null;
}
