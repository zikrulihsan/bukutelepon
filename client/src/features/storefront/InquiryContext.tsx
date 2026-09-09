import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { business, storefrontItems } from "./storefrontData";

type InquiryMap = Record<string, number>;

interface InquiryContextValue {
  quantities: InquiryMap;
  totalCount: number;
  totalPrice: number;
  hasUnpriced: boolean;
  addItem: (itemId: string, amount?: number) => void;
  setQuantity: (itemId: string, quantity: number) => void;
  clear: () => void;
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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
  }, [quantities]);

  const value = useMemo<InquiryContextValue>(() => {
    const selectedItems = storefrontItems.filter((item) => (quantities[item.id] ?? 0) > 0);
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
      whatsappUrl: `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`,
    };
  }, [quantities]);

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
