import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { City } from "../types";

interface CityContextValue {
  citySlug: string | null;
  city: City | null;
  setCity: (city: City) => void;
  clearCity: () => void;
  cities: City[];
  setCities: (cities: City[]) => void;
}

const CityContext = createContext<CityContextValue | null>(null);

const STORAGE_KEY = "bukutelepon_city";

export function CityProvider({ children }: { children: ReactNode }) {
  const [citySlug, setCitySlug] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [cities, setCities] = useState<City[]>([]);
  const city = cities.find((c) => c.slug === citySlug) ?? null;

  function setCity(c: City) {
    setCitySlug(c.slug);
    try {
      localStorage.setItem(STORAGE_KEY, c.slug);
    } catch { /* noop */ }
  }

  function clearCity() {
    setCitySlug(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch { /* noop */ }
  }

  return (
    <CityContext.Provider value={{ citySlug, city, setCity, clearCity, cities, setCities }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}
