import type { SQLiteDatabase } from "expo-sqlite";

const DEFAULT_CATEGORIES = [
  { id: "category_food", name: "Jedzenie", icon: "food" },
  { id: "category_transport", name: "Transport", icon: "transport" },
  { id: "category_shopping", name: "Zakupy", icon: "shopping" },
  { id: "category_health", name: "Zdrowie", icon: "health" },
  { id: "category_home", name: "Dom", icon: "home" },
  { id: "category_subscriptions", name: "Subskrypcje", icon: "subscriptions" },
  { id: "category_entertainment", name: "Rozrywka", icon: "entertainment" },
  { id: "category_other", name: "Inne", icon: "other" },
];

export async function seedDefaultCategories(db: SQLiteDatabase): Promise<void> {
  const now = new Date().toISOString();

  for (const category of DEFAULT_CATEGORIES) {
    await db.runAsync(
      `
      INSERT OR IGNORE INTO categories (id, name, icon, is_default, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?)
      `,
      [category.id, category.name, category.icon, now, now],
    );
  }
}
