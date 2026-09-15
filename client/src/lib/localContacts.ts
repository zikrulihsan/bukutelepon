import { apiClient } from "./axios";
import type { Contact } from "../types";

const DB_NAME = "bukutelepon_contacts";
const DB_VERSION = 1;
const CONTACTS_STORE = "contacts";
const META_STORE = "meta";
const SYNC_META_KEY = "sync";

// Previous monolithic cache. It is used only as a warm visual fallback while
// IndexedDB performs its first authoritative bootstrap.
const LEGACY_DATA_KEY = "bt_contacts_v3";
const LEGACY_VERSION_KEY = "bt_contacts_version";

interface SyncMetadata {
  key: typeof SYNC_META_KEY;
  version: number;
  isComplete: boolean;
}

export interface ContactsCache {
  contacts: Contact[];
  version: number;
  isComplete: boolean;
}

export interface ContactsSyncPage {
  upserts: Contact[];
  deletedIds: string[];
  version: number;
  nextCursor: string | null;
  complete: boolean;
  resetRequired: boolean;
}

let databasePromise: Promise<IDBDatabase> | null = null;

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
  });
}

function openDatabase(): Promise<IDBDatabase> {
  if (databasePromise) return databasePromise;

  databasePromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(CONTACTS_STORE)) {
        database.createObjectStore(CONTACTS_STORE, { keyPath: "id" });
      }
      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      databasePromise = null;
      reject(request.error ?? new Error("Unable to open IndexedDB"));
    };
    request.onblocked = () => {
      databasePromise = null;
      reject(new Error("IndexedDB upgrade is blocked by another tab"));
    };
  });

  return databasePromise;
}

function sortNewestFirst(contacts: Contact[]): Contact[] {
  return contacts.sort((left, right) => {
    const byDate = right.createdAt.localeCompare(left.createdAt);
    return byDate || left.id.localeCompare(right.id);
  });
}

export function loadLegacyCache(): ContactsCache | null {
  try {
    const raw = localStorage.getItem(LEGACY_DATA_KEY);
    const rawVersion = localStorage.getItem(LEGACY_VERSION_KEY);
    if (!raw || rawVersion == null) return null;

    const contacts = JSON.parse(raw) as Contact[];
    const version = Number(rawVersion);
    if (!Array.isArray(contacts) || Number.isNaN(version)) return null;

    // Never mark legacy data authoritative: it predates tombstone support.
    return { contacts: sortNewestFirst(contacts), version, isComplete: false };
  } catch {
    return null;
  }
}

export function clearLegacyCache(): void {
  try {
    localStorage.removeItem(LEGACY_DATA_KEY);
    localStorage.removeItem(LEGACY_VERSION_KEY);
  } catch {
    // The IndexedDB cache remains authoritative if localStorage is unavailable.
  }
}

export async function loadCache(): Promise<ContactsCache> {
  const database = await openDatabase();
  const transaction = database.transaction([CONTACTS_STORE, META_STORE], "readonly");
  const done = transactionDone(transaction);
  const contactsRequest = transaction.objectStore(CONTACTS_STORE).getAll() as IDBRequest<Contact[]>;
  const metadataRequest = transaction.objectStore(META_STORE).get(SYNC_META_KEY) as IDBRequest<SyncMetadata | undefined>;
  const [contacts, metadata] = await Promise.all([
    requestResult(contactsRequest),
    requestResult(metadataRequest),
  ]);
  await done;

  return {
    contacts: sortNewestFirst(contacts),
    version: metadata?.version ?? 0,
    isComplete: metadata?.isComplete ?? false,
  };
}

export async function applySyncBatch(
  upserts: Contact[],
  deletedIds: string[]
): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(CONTACTS_STORE, "readwrite");
  const store = transaction.objectStore(CONTACTS_STORE);
  const done = transactionDone(transaction);

  for (const contact of upserts) store.put(contact);
  for (const id of deletedIds) store.delete(id);

  await done;
}

export async function saveSyncMetadata(version: number, isComplete: boolean): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction(META_STORE, "readwrite");
  const done = transactionDone(transaction);
  transaction.objectStore(META_STORE).put({
    key: SYNC_META_KEY,
    version,
    isComplete,
  } satisfies SyncMetadata);
  await done;
}

export async function clearCache(): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction([CONTACTS_STORE, META_STORE], "readwrite");
  const done = transactionDone(transaction);
  transaction.objectStore(CONTACTS_STORE).clear();
  transaction.objectStore(META_STORE).clear();
  await done;
}

export async function fetchSyncPage(
  sinceVersion: number,
  cursor?: string,
  limit = 200
): Promise<ContactsSyncPage> {
  const { data } = await apiClient.get("/contacts/sync", {
    params: { sinceVersion, cursor, limit },
  });

  return {
    upserts: data.data.upserts as Contact[],
    deletedIds: data.data.deletedIds as string[],
    version: Number(data.meta.version) || 0,
    nextCursor: data.meta.nextCursor || null,
    complete: Boolean(data.meta.complete),
    resetRequired: Boolean(data.meta.resetRequired),
  };
}

export interface ContactFilter {
  city?: string;
  category?: string;
  search?: string;
  verified?: string; // "true" | "false" | ""
}

// Keep local search semantics identical to GET /api/contacts.
export function filterContacts(all: Contact[], filter: ContactFilter): Contact[] {
  const { city, category, search, verified } = filter;
  const needle = search?.trim().toLowerCase();

  return all.filter((contact) => {
    if (city && contact.city?.slug !== city) return false;
    if (category && contact.category?.slug !== category) return false;
    if (verified === "true" && !contact.isVerified) return false;
    if (verified === "false" && contact.isVerified) return false;
    if (needle) {
      const inName = contact.name?.toLowerCase().includes(needle);
      const inDescription = contact.description?.toLowerCase().includes(needle) ?? false;
      const inEnglishDescription = contact.descriptionEn?.toLowerCase().includes(needle) ?? false;
      if (!inName && !inDescription && !inEnglishDescription) return false;
    }
    return true;
  });
}
