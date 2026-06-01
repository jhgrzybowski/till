import { getDatabase } from "@/db/database";
import type { UserSettings } from "@/domain/finance/types";

const SETTINGS_ID = "settings";

type UserSettingsRow = {
  id: string;
  display_name: string;
  payday_day_of_month: number;
  expected_salary: number;
  onboarding_completed: number;
  created_at: string;
  updated_at: string;
};

function mapSettings(row: UserSettingsRow): UserSettings {
  return {
    id: row.id,
    displayName: row.display_name,
    paydayDayOfMonth: row.payday_day_of_month,
    expectedSalary: row.expected_salary,
    onboardingCompleted: row.onboarding_completed === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getUserSettings(): Promise<UserSettings | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<UserSettingsRow>("SELECT * FROM user_settings LIMIT 1");
  return row ? mapSettings(row) : null;
}

export async function saveUserSettings(input: {
  displayName: string;
  paydayDayOfMonth: number;
  expectedSalary: number;
  onboardingCompleted: boolean;
}): Promise<UserSettings> {
  const db = await getDatabase();
  const existing = await getUserSettings();
  const now = new Date().toISOString();
  const createdAt = existing?.createdAt ?? now;

  await db.runAsync(
    `
    INSERT OR REPLACE INTO user_settings (
      id,
      display_name,
      payday_day_of_month,
      expected_salary,
      onboarding_completed,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      SETTINGS_ID,
      input.displayName.trim() || "Ty",
      input.paydayDayOfMonth,
      input.expectedSalary,
      input.onboardingCompleted ? 1 : 0,
      createdAt,
      now,
    ],
  );

  return {
    id: SETTINGS_ID,
    displayName: input.displayName.trim() || "Ty",
    paydayDayOfMonth: input.paydayDayOfMonth,
    expectedSalary: input.expectedSalary,
    onboardingCompleted: input.onboardingCompleted,
    createdAt,
    updatedAt: now,
  };
}
