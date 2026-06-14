import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Contact } from "../types";
import { loadCache, saveCache, fetchVersion, fetchAll } from "../lib/localContacts";

interface ContactsState {
  contacts: Contact[];
  /** True only on the very first visit (no cache to render yet). */
  isLoading: boolean;
  error: Error | null;
  getById: (id: string) => Contact | undefined;
  refresh: () => Promise<void>;
}

const ContactsContext = createContext<ContactsState | undefined>(undefined);

export function ContactsProvider({ children }: { children: ReactNode }) {
  // Seed synchronously from cache so repeat visits render instantly (no flash).
  const cached = useRef(loadCache()).current;
  const [contacts, setContacts] = useState<Contact[]>(cached?.contacts ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<Error | null>(null);

  async function sync(force = false) {
    try {
      const current = loadCache();

      if (!force && current) {
        const serverVersion = await fetchVersion();
        if (serverVersion === current.version) {
          // Local copy is up to date — skip the full download.
          setError(null);
          setIsLoading(false);
          return;
        }
      }

      const fresh = await fetchAll();
      saveCache(fresh.contacts, fresh.version);
      setContacts(fresh.contacts);
      setError(null);
    } catch (err) {
      // Offline / server error: keep whatever cached data we already have.
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getById(id: string): Contact | undefined {
    return contacts.find((c) => c.id === id);
  }

  return (
    <ContactsContext.Provider
      value={{ contacts, isLoading, error, getById, refresh: () => sync(true) }}
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
