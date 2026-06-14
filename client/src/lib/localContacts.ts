import { apiClient } from "./axios";
import type { Contact } from "../types";

// localStorage keys. Bump the suffix if the cached shape changes.
const LS_DATA_KEY = "bt_contacts_v1";
const LS_VERSION_KEY = "bt_contacts_version";

// Cosmetic guest gate — keep in sync with the server's GUEST_VIEW_THRESHOLD env.
export const GUEST_VIEW_THRESHOLD = 3;

export interface ContactsCache {
  contacts: Contact[];
  version: number;
}

export function loadCache(): ContactsCache | null {
  try {
    const raw = localStorage.getItem(LS_DATA_KEY);
    const rawVersion = localStorage.getItem(LS_VERSION_KEY);
    if (!raw || rawVersion == null) return null;

    const contacts = JSON.parse(raw) as Contact[];
    const version = Number(rawVersion);
    if (!Array.isArray(contacts) || Number.isNaN(version)) return null;

    return { contacts, version };
  } catch {
    return null;
  }
}

export function saveCache(contacts: Contact[], version: number): void {
  try {
    localStorage.setItem(LS_DATA_KEY, JSON.stringify(contacts));
    localStorage.setItem(LS_VERSION_KEY, String(version));
  } catch {
    // Quota exceeded or storage unavailable — fall back to in-memory only.
  }
}

export async function fetchVersion(): Promise<number> {
  const { data } = await apiClient.get("/contacts/version");
  return Number(data.version) || 0;
}

export async function fetchAll(): Promise<ContactsCache> {
  const { data } = await apiClient.get("/contacts/all");
  return { contacts: data.data as Contact[], version: Number(data.version) || 0 };
}

export interface ContactFilter {
  city?: string;
  category?: string;
  search?: string;
  verified?: string; // "true" | "false" | ""
}

// Replicates the server-side filtering semantics (contacts.router.ts).
export function filterContacts(all: Contact[], filter: ContactFilter): Contact[] {
  const { city, category, search, verified } = filter;
  const needle = search?.trim().toLowerCase();

  return all.filter((c) => {
    if (city && c.city?.slug !== city) return false;
    if (category && c.category?.slug !== category) return false;
    if (verified === "true" && !c.isVerified) return false;
    if (verified === "false" && c.isVerified) return false;
    if (needle) {
      const inName = c.name?.toLowerCase().includes(needle);
      const inDesc = c.description?.toLowerCase().includes(needle) ?? false;
      if (!inName && !inDesc) return false;
    }
    return true;
  });
}
