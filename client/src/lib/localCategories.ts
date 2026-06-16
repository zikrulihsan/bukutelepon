import { apiClient } from "./axios";
import type { Category } from "../types";

const LS_DATA_KEY = "bt_categories_v1";
const LS_VERSION_KEY = "bt_categories_version";

export interface CategoriesCache {
  categories: Category[];
  version: number;
}

export function loadCache(): CategoriesCache | null {
  try {
    const raw = localStorage.getItem(LS_DATA_KEY);
    const rawVersion = localStorage.getItem(LS_VERSION_KEY);
    if (!raw || rawVersion == null) return null;

    const categories = JSON.parse(raw) as Category[];
    const version = Number(rawVersion);
    if (!Array.isArray(categories) || Number.isNaN(version)) return null;

    return { categories, version };
  } catch {
    return null;
  }
}

export function saveCache(categories: Category[], version: number): void {
  try {
    localStorage.setItem(LS_DATA_KEY, JSON.stringify(categories));
    localStorage.setItem(LS_VERSION_KEY, String(version));
  } catch {
    // Quota exceeded or storage unavailable — fall back to in-memory only.
  }
}

export async function fetchVersion(): Promise<number> {
  const { data } = await apiClient.get("/categories/version");
  return Number(data.version) || 0;
}

export async function fetchAll(): Promise<CategoriesCache> {
  const { data } = await apiClient.get("/categories");
  return { categories: data.data as Category[], version: Number(data.version) || 0 };
}
