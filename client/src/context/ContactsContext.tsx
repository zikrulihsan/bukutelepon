import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Contact } from "../types";
import {
  applySyncBatch,
  clearCache,
  clearLegacyCache,
  fetchSyncPage,
  loadCache,
  loadLegacyCache,
  saveSyncMetadata,
} from "../lib/localContacts";

interface ContactsState {
  contacts: Contact[];
  /** True only while opening the browser cache for the first time. */
  isLoading: boolean;
  /** True when the local collection is complete and safe for authoritative search. */
  isCacheReady: boolean;
  /** Background delta/bootstrap activity; cached data remains usable while true. */
  isSyncing: boolean;
  error: Error | null;
  getById: (id: string) => Contact | undefined;
  refresh: () => Promise<void>;
}

const ContactsContext = createContext<ContactsState | undefined>(undefined);

function waitForBrowserIdle(): Promise<void> {
  return new Promise((resolve) => {
    const idleWindow = window as typeof window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    };
    if (idleWindow.requestIdleCallback) {
      idleWindow.requestIdleCallback(resolve, { timeout: 750 });
    } else {
      window.setTimeout(resolve, 150);
    }
  });
}

export function ContactsProvider({ children }: { children: ReactNode }) {
  const legacy = useRef(loadLegacyCache()).current;
  const [contacts, setContacts] = useState<Contact[]>(legacy?.contacts ?? []);
  const [isLoading, setIsLoading] = useState(!legacy);
  const [isCacheReady, setIsCacheReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const versionRef = useRef(0);
  const syncPromiseRef = useRef<Promise<void> | null>(null);

  const publishCache = useCallback(async () => {
    const cache = await loadCache();
    versionRef.current = cache.version;
    if (!mountedRef.current) return;
    setContacts(cache.contacts);
    setIsCacheReady(cache.isComplete);
  }, []);

  const sync = useCallback(async () => {
    if (syncPromiseRef.current) return syncPromiseRef.current;

    const run = (async () => {
      if (mountedRef.current) setIsSyncing(true);
      let sinceVersion = versionRef.current;
      let cursor: string | undefined;
      let resetAttempted = false;

      try {
        while (true) {
          const page = await fetchSyncPage(sinceVersion, cursor);

          if (page.resetRequired) {
            if (resetAttempted) throw new Error("Server repeatedly requested a cache reset");
            resetAttempted = true;
            await clearCache();
            sinceVersion = 0;
            versionRef.current = 0;
            cursor = undefined;
            if (mountedRef.current) {
              setContacts([]);
              setIsCacheReady(false);
            }
            continue;
          }

          await applySyncBatch(page.upserts, page.deletedIds);

          if (page.nextCursor) {
            cursor = page.nextCursor;
            continue;
          }

          if (!page.complete) throw new Error("Contacts sync ended before the snapshot completed");
          await saveSyncMetadata(page.version, true);
          await publishCache();
          clearLegacyCache();
          if (mountedRef.current) setError(null);
          break;
        }
      } catch (syncError) {
        if (mountedRef.current) setError(syncError as Error);
        throw syncError;
      } finally {
        if (mountedRef.current) setIsSyncing(false);
      }
    })();

    syncPromiseRef.current = run.finally(() => {
      syncPromiseRef.current = null;
    });
    return syncPromiseRef.current;
  }, [publishCache]);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;
    const handleOnline = () => void sync().catch(() => undefined);
    window.addEventListener("online", handleOnline);

    async function initialize() {
      try {
        const cache = await loadCache();
        if (cancelled) return;
        versionRef.current = cache.version;
        setContacts(cache.contacts.length > 0 ? cache.contacts : (legacy?.contacts ?? []));
        setIsCacheReady(cache.isComplete);
        setIsLoading(false);

        await waitForBrowserIdle();
        if (!cancelled) void sync().catch(() => undefined);
      } catch (cacheError) {
        if (cancelled) return;
        setError(cacheError as Error);
        setIsCacheReady(false);
        setIsLoading(false);
      }
    }

    void initialize();
    return () => {
      cancelled = true;
      mountedRef.current = false;
      window.removeEventListener("online", handleOnline);
    };
  }, [legacy, sync]);

  const getById = useCallback(
    (id: string): Contact | undefined => contacts.find((contact) => contact.id === id),
    [contacts]
  );

  return (
    <ContactsContext.Provider
      value={{ contacts, isLoading, isCacheReady, isSyncing, error, getById, refresh: sync }}
    >
      {children}
    </ContactsContext.Provider>
  );
}

export function useContactsData() {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error("useContactsData must be used within a ContactsProvider");
  }
  return context;
}
