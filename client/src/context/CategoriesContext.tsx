import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Category } from "../types";
import { loadCache, saveCache, fetchVersion, fetchAll } from "../lib/localCategories";

interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesState | undefined>(undefined);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const cached = useRef(loadCache()).current;
  const [categories, setCategories] = useState<Category[]>(cached?.categories ?? []);
  const [isLoading, setIsLoading] = useState(!cached);
  const [error, setError] = useState<Error | null>(null);

  async function sync(force = false) {
    try {
      const current = loadCache();

      if (!force && current) {
        const serverVersion = await fetchVersion();
        if (serverVersion === current.version) {
          setError(null);
          setIsLoading(false);
          return;
        }
      }

      const fresh = await fetchAll();
      saveCache(fresh.categories, fresh.version);
      setCategories(fresh.categories);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CategoriesContext.Provider
      value={{ categories, isLoading, error, refresh: () => sync(true) }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
}
