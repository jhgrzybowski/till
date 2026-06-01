import { format, isValid, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

export function toDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toIsoDate(date: Date): string {
  return format(toDateOnly(date), "yyyy-MM-dd");
}

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function parseIsoDate(value: string): Date {
  return parseISO(value);
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = parseISO(value);
  return isValid(parsed) && toIsoDate(parsed) === value;
}

export function formatShortDatePl(isoDate: string): string {
  return format(parseISO(isoDate), "d MMM", { locale: pl });
}

export function formatCycleRangePl(startDate: string, endDate: string): string {
  return `${formatShortDatePl(startDate)} → ${formatShortDatePl(endDate)}`;
}
