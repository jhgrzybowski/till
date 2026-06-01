import { getDatabase } from "@/db/database";
import type { Category } from "@/domain/finance/types";

type CategoryRow = {
  id: string;
  name: string;
  icon: string;
  is_default: number;
  created_at: string;
  updated_at: string;
};

function mapCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    isDefault: row.is_default === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCategories(): Promise<Category[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<CategoryRow>(
    "SELECT * FROM categories ORDER BY is_default DESC, name ASC",
  );

  return rows.map(mapCategory);
}
