import { createContext, useContext, useState, type ReactNode } from "react";
import type { City, Kecamatan } from "../types";

interface CityContextValue {
  citySlug: string | null;
  city: City | null;
  setCity: (city: City) => void;
  clearCity: () => void;
  cities: City[];
  setCities: (cities: City[]) => void;
  kecamatanSlug: string | null;
  kecamatan: Kecamatan | null;
  setKecamatan: (kecamatan: Kecamatan | null) => void;
}

const CityContext = createContext<CityContextValue | null>(null);

const CITY_KEY = "bukutelepon_city";
const KECAMATAN_KEY = "bukutelepon_kecamatan";

export function CityProvider({ children }: { children: ReactNode }) {
  const [citySlug, setCitySlug] = useState<string | null>(() => {
    try { return localStorage.getItem(CITY_KEY); } catch { return null; }
  });
  const [kecamatanSlug, setKecamatanSlug] = useState<string | null>(() => {
    try { return localStorage.getItem(KECAMATAN_KEY); } catch { return null; }
  });
  const [cities, setCities] = useState<City[]>([]);
  const [kecamatans, setKecamatans] = useState<Kecamatan[]>([]);

  const city = cities.find((c) => c.slug === citySlug) ?? null;
  const kecamatan = kecamatans.find((k) => k.slug === kecamatanSlug) ?? null;

  function setCity(c: City) {
    setCitySlug(c.slug);
    // Clear kecamatan when city changes
    setKecamatanSlug(null);
    setKecamatans([]);
    try {
      localStorage.setItem(CITY_KEY, c.slug);
      localStorage.removeItem(KECAMATAN_KEY);
    } catch { /* noop */ }
  }

  function clearCity() {
    setCitySlug(null);
    setKecamatanSlug(null);
    setKecamatans([]);
    try {
      localStorage.removeItem(CITY_KEY);
      localStorage.removeItem(KECAMATAN_KEY);
    } catch { /* noop */ }
  }

  function setKecamatan(k: Kecamatan | null) {
    setKecamatanSlug(k?.slug ?? null);
    try {
      if (k) localStorage.setItem(KECAMATAN_KEY, k.slug);
      else localStorage.removeItem(KECAMATAN_KEY);
    } catch { /* noop */ }
  }

  return (
    <CityContext.Provider value={{
      citySlug, city, setCity, clearCity,
      cities, setCities,
      kecamatanSlug, kecamatan, setKecamatan,
    }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}
