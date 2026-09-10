import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { business, storefrontItems, type StorefrontBusiness, type StorefrontItem } from "./storefrontData";

type InquiryMap = Record<string, number>;

interface InquiryContextValue {
  quantities: InquiryMap;
  totalCount: number;
  totalPrice: number;
  hasUnpriced: boolean;
  catalogItems: StorefrontItem[];
  catalogBusiness: StorefrontBusiness;
  addItem: (itemId: string, amount?: number) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;
  configureCatalog: (items: StorefrontItem[], business: StorefrontBusiness) => void;
  whatsappUrl: string;
}

const InquiryContext = createContext<InquiryContextValue | null>(null);
const STORAGE_KEY = "carikontak-storefront-inquiry";

function readInitialState(): InquiryMap {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as InquiryMap;
  } catch {
    return {};
  }
}

export function InquiryProvider({ children }: { children: ReactNode }) {
  const [quantities, setQuantities] = useState<InquiryMap>(readInitialState);
  const [catalogItems, setCatalogItems] = useState(storefrontItems);
  const [catalogBusiness, setCatalogBusiness] = useState(business);

  const configureCatalog = useCallback((items: StorefrontItem[], nextBusiness: StorefrontBusiness) => {
    setCatalogItems(items);
    setCatalogBusiness(nextBusiness);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
  }, [quantities]);

  const value = useMemo<InquiryContextValue>(() => {
    const selectedItems = catalogItems.filter((item) => (quantities[item.id] ?? 0) > 0);
    const totalCount = selectedItems.reduce((sum, item) => sum + quantities[item.id], 0);
    const totalPrice = selectedItems.reduce((sum, item) => sum + item.price * quantities[item.id], 0);
    const hasUnpriced = selectedItems.some((item) => item.priceType === "contact");
    const message = [
      "Halo, saya melihat etalase Anda di CariKontak.",
      "",
      "Saya tertarik dengan:",
      ...selectedItems.map((item) => `• ${quantities[item.id]}x ${item.name}`),
      "",
      "Apakah produknya tersedia?",
    ].join("\n");

    return {
      quantities,
      totalCount,
      totalPrice,
      hasUnpriced,
      catalogItems,
      catalogBusiness,
      addItem: (itemId, amount = 1) =>
        setQuantities((current) => ({ ...current, [itemId]: (current[itemId] ?? 0) + amount })),
      setQuantity: (itemId, quantity) =>
        setQuantities((current) => {
          const next = { ...current };
          if (quantity <= 0) delete next[itemId];
          else next[itemId] = quantity;
          return next;
        }),
      clear: () => setQuantities({}),
      configureCatalog,
      whatsappUrl: `https://wa.me/${catalogBusiness.whatsapp}?text=${encodeURIComponent(message)}`,
    };
  }, [catalogBusiness, catalogItems, configureCatalog, quantities]);

  return <InquiryContext.Provider value={value}>{children}</InquiryContext.Provider>;
}

export function useInquiry() {
  const context = useContext(InquiryContext);
  if (!context) throw new Error("useInquiry must be used within InquiryProvider");
  return context;
}

export function trackStorefrontEvent(event: string, itemId?: string) {
  const key = "carikontak-storefront-events";
  try {
    const events = JSON.parse(localStorage.getItem(key) ?? "[]") as unknown[];
    events.push({ event, itemId, createdAt: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(events.slice(-100)));
  } catch {
    // Analytics must never interrupt the storefront experience.
  }
}
