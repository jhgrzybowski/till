import { addDays, addMonths, format, parseISO } from "date-fns";

import type { BudgetCycle } from "./types";
import { toDateOnly, toIsoDate } from "@/utils/dates";

export interface CycleRange {
  startDate: string;
  endDate: string;
}

function assertPaydayDay(paydayDayOfMonth: number): void {
  if (!Number.isInteger(paydayDayOfMonth) || paydayDayOfMonth < 1 || paydayDayOfMonth > 31) {
    throw new Error("Payday day must be between 1 and 31.");
  }
}

export function getLastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

export function getDateForDayOfMonth(year: number, monthIndex: number, dayOfMonth: number): Date {
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    throw new Error("Day of month must be between 1 and 31.");
  }

  const lastDay = getLastDayOfMonth(year, monthIndex);
  return new Date(year, monthIndex, Math.min(dayOfMonth, lastDay));
}

export function getPaydayDate(year: number, monthIndex: number, paydayDayOfMonth: number): Date {
  assertPaydayDay(paydayDayOfMonth);
  return getDateForDayOfMonth(year, monthIndex, paydayDayOfMonth);
}

export function calculateActiveCycle(todayInput: Date | string, paydayDayOfMonth: number): CycleRange {
  assertPaydayDay(paydayDayOfMonth);

  const today = toDateOnly(typeof todayInput === "string" ? parseISO(todayInput) : todayInput);
  const currentMonthPayday = getPaydayDate(
    today.getFullYear(),
    today.getMonth(),
    paydayDayOfMonth,
  );

  const startDate =
    today.getTime() >= currentMonthPayday.getTime()
      ? currentMonthPayday
      : getPaydayDate(
          addMonths(currentMonthPayday, -1).getFullYear(),
          addMonths(currentMonthPayday, -1).getMonth(),
          paydayDayOfMonth,
        );

  const nextMonthAnchor = addMonths(new Date(startDate.getFullYear(), startDate.getMonth(), 1), 1);
  const nextPayday = getPaydayDate(
    nextMonthAnchor.getFullYear(),
    nextMonthAnchor.getMonth(),
    paydayDayOfMonth,
  );

  return {
    startDate: toIsoDate(startDate),
    endDate: toIsoDate(addDays(nextPayday, -1)),
  };
}

export function isPayday(todayInput: Date | string, paydayDayOfMonth: number): boolean {
  const today = toDateOnly(typeof todayInput === "string" ? parseISO(todayInput) : todayInput);
  const payday = getPaydayDate(today.getFullYear(), today.getMonth(), paydayDayOfMonth);
  return today.getTime() === payday.getTime();
}

export function createNextCycleRange(
  currentCycle: Pick<BudgetCycle, "endDate">,
  paydayDayOfMonth: number,
): CycleRange {
  const nextStart = addDays(parseISO(currentCycle.endDate), 1);
  const nextMonthAnchor = addMonths(new Date(nextStart.getFullYear(), nextStart.getMonth(), 1), 1);
  const followingPayday = getPaydayDate(
    nextMonthAnchor.getFullYear(),
    nextMonthAnchor.getMonth(),
    paydayDayOfMonth,
  );

  return {
    startDate: toIsoDate(nextStart),
    endDate: toIsoDate(addDays(followingPayday, -1)),
  };
}

export function getBillDueDatesInCycle(dueDayOfMonth: number, cycle: CycleRange): string[] {
  const start = parseISO(cycle.startDate);
  const end = parseISO(cycle.endDate);
  const dueDates: string[] = [];
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const lastMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor.getTime() <= lastMonth.getTime()) {
    const dueDate = getDateForDayOfMonth(cursor.getFullYear(), cursor.getMonth(), dueDayOfMonth);
    const isoDueDate = format(dueDate, "yyyy-MM-dd");

    if (isoDueDate >= cycle.startDate && isoDueDate <= cycle.endDate) {
      dueDates.push(isoDueDate);
    }

    cursor = addMonths(cursor, 1);
  }

  return dueDates;
}
