const STORAGE_KEY = "bukutelepon_saved";

export function getSavedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function toggleSaved(id: string): boolean {
  const ids = getSavedIds();
  const idx = ids.indexOf(id);
  if (idx >= 0) {
    ids.splice(idx, 1);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    return false;
  }
  ids.unshift(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  return true;
}

export function isSaved(id: string): boolean {
  return getSavedIds().includes(id);
}
