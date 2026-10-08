import { createContext, useContext, useState, type ReactNode } from "react";
import type { City } from "../types";
import { region } from "../config/region";

/**
 * Each deployment serves exactly one city (see config/region.ts), so the city
 * is fixed rather than user-selectable. `cities` still holds the API's city
 * list so forms can resolve the region's database id.
 */
interface CityContextValue {
  citySlug: string;
  city: City;
  cities: City[];
  setCities: (cities: City[]) => void;
}

const CityContext = createContext<CityContextValue | null>(null);

const FALLBACK_CITY: City = {
  id: "",
  name: region.cityName,
  province: region.province,
  slug: region.citySlug,
  imageUrl: null,
  createdAt: "",
  updatedAt: "",
};

export function CityProvider({ children }: { children: ReactNode }) {
  const [cities, setCities] = useState<City[]>([]);
  const city = cities.find((c) => c.slug === region.citySlug) ?? FALLBACK_CITY;

  return (
    <CityContext.Provider value={{ citySlug: region.citySlug, city, cities, setCities }}>
      {children}
    </CityContext.Provider>
  );
}

export function useCity() {
  const ctx = useContext(CityContext);
  if (!ctx) throw new Error("useCity must be used within CityProvider");
  return ctx;
}
