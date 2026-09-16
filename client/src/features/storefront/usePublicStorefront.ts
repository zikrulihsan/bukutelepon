import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { apiClient } from "../../lib/axios";
import type { ApiResponse, ManagedBusiness } from "../../types";
import {
  business as fallbackBusiness,
  itemAvailabilityLabel,
  itemTypeLabel,
  storefrontCollections as fallbackCollections,
  storefrontItems as fallbackItems,
  type StorefrontBusiness,
  type StorefrontCollection,
  type StorefrontItem,
  type StorefrontSection,
} from "./storefrontData";

function displayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const local = digits.startsWith("62") ? `0${digits.slice(2)}` : digits;
  return local.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function adaptBusiness(value: ManagedBusiness): StorefrontBusiness {
  return {
    name: value.name,
    slug: value.slug,
    description: value.description,
    whatsapp: value.whatsapp,
    whatsappDisplay: displayPhone(value.whatsapp),
    whatsappSecondary: value.alternateWhatsapp ?? "",
    whatsappSecondaryDisplay: value.alternateWhatsapp ? displayPhone(value.alternateWhatsapp) : "",
    instagram: value.instagram ?? "",
    address: value.address ?? "Alamat dikonfirmasi melalui WhatsApp",
    mapsUrl: value.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value.name)}`,
    openingHours: value.openingHours ?? "Konfirmasi via WhatsApp",
    cover: value.coverUrl ?? fallbackBusiness.cover,
    poster: value.coverUrl ?? fallbackBusiness.poster,
    logo: value.logoUrl ?? undefined,
    catalogPreset: value.catalogPreset.toLowerCase() as StorefrontBusiness["catalogPreset"],
    defaultItemLayout: value.defaultItemLayout.toLowerCase() as StorefrontBusiness["defaultItemLayout"],
    catalogTheme: value.catalogTheme.toLowerCase() as StorefrontBusiness["catalogTheme"],
    catalogAccent: value.catalogAccent,
    catalogNavigationStyle: (value.catalogNavigationStyle ?? "COMPACT_SLIDER").toLowerCase() as StorefrontBusiness["catalogNavigationStyle"],
  };
}

function adaptItems(value: ManagedBusiness): StorefrontItem[] {
  return value.items.map((item) => ({
    id: item.id,
    type: item.type.toLowerCase() as StorefrontItem["type"],
    slug: item.slug,
    name: item.name,
    shortDescription: item.shortDescription,
    description: item.description,
    price: item.price,
    priceType: item.priceType.toLowerCase() as StorefrontItem["priceType"],
    image: item.imageUrl ?? value.coverUrl ?? fallbackBusiness.cover,
    category: item.category,
    badge: item.badge ?? undefined,
    available: item.status !== "SOLD_OUT",
    unit: item.unit ?? (item.type === "PRODUCT" ? "item" : "layanan"),
    details: [],
    variants: [],
  })).map((item) => ({
    ...item,
    details: [
      { label: "Jenis", value: itemTypeLabel(item) },
      { label: item.type === "product" ? "Satuan" : "Satuan layanan", value: item.unit ?? (item.type === "product" ? "Item" : "Layanan") },
      { label: "Harga", value: item.priceType === "contact" ? "Konsultasikan" : "Sesuai keterangan" },
      { label: "Ketersediaan", value: itemAvailabilityLabel(item) },
    ],
  }));
}

function collectionsFor(items: StorefrontItem[]): StorefrontCollection[] {
  const groups = new Map<string, StorefrontItem[]>();
  items.forEach((item) => groups.set(item.category, [...(groups.get(item.category) ?? []), item]));
  const accents = ["#E9A23B", "#2F6A52", "#A65A3A"];
  return [...groups.entries()].slice(0, 3).map(([category, categoryItems], index) => ({
    id: category.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `koleksi-${index + 1}`,
    title: category,
    description: `${categoryItems.length} pilihan dari etalase`,
    image: categoryItems[0].image,
    itemIds: categoryItems.map((item) => item.id),
    accent: accents[index % accents.length],
  }));
}

function sectionsFor(value: ManagedBusiness, items: StorefrontItem[]): StorefrontSection[] {
  if (value.sections?.length) {
    return value.sections.map((section) => ({
      id: section.id,
      type: section.type.toLowerCase() as StorefrontSection["type"],
      title: section.title,
      subtitle: section.subtitle ?? "",
      category: section.category ?? "",
      layout: section.layout.toLowerCase() as StorefrontSection["layout"],
      image: section.imageUrl ?? value.coverUrl ?? fallbackBusiness.cover,
      badge: section.badge ?? "",
      ctaLabel: section.ctaLabel ?? "",
      ctaUrl: section.ctaUrl ?? "",
      scheduleLabel: section.scheduleLabel ?? "",
      sortOrder: section.sortOrder,
    }));
  }

  return collectionsFor(items).map((collection, index) => ({
    id: `generated-${collection.id}`,
    type: "item_group",
    title: collection.title,
    subtitle: collection.description,
    category: collection.title,
    layout: value.defaultItemLayout.toLowerCase() as StorefrontSection["layout"],
    image: collection.image,
    badge: "",
    ctaLabel: "",
    ctaUrl: "",
    scheduleLabel: "",
    sortOrder: index,
  }));
}

export function usePublicStorefront(enabled = true) {
  const [searchParams] = useSearchParams();
  const requestedSlug = searchParams.get("store") || fallbackBusiness.slug;
  const query = useQuery<ApiResponse<ManagedBusiness>>({
    queryKey: ["storefront", requestedSlug],
    queryFn: async () => (await apiClient.get(`/storefront/${requestedSlug}`)).data,
    enabled,
    retry: false,
    staleTime: 60_000,
  });

  return useMemo(() => {
    const remote = query.data?.data;
    if (!remote) {
      return {
        business: fallbackBusiness,
        items: fallbackItems,
        collections: fallbackCollections,
        sections: fallbackCollections.map((collection, index) => ({
          id: `fallback-${collection.id}`,
          type: "item_group" as const,
          title: collection.title,
          subtitle: collection.description,
          category: collection.title,
          layout: fallbackBusiness.defaultItemLayout,
          image: collection.image,
          badge: "",
          ctaLabel: "",
          ctaUrl: "",
          scheduleLabel: "",
          sortOrder: index,
        })),
        isManaged: false,
        isLoading: enabled && query.isLoading,
        notFound: requestedSlug !== fallbackBusiness.slug && query.isError,
        requestedSlug,
      };
    }
    const items = adaptItems(remote);
    return {
      business: adaptBusiness(remote),
      items,
      collections: collectionsFor(items),
      sections: sectionsFor(remote, items),
      isManaged: true,
      isLoading: false,
      notFound: false,
      requestedSlug,
    };
  }, [enabled, query.data, query.isError, query.isLoading, requestedSlug]);
}
