export type PriceType = "fixed" | "starting_from" | "contact" | "free";
export type ItemType = "product" | "service" | "package" | "promo";

export interface StorefrontItem {
  id: string;
  type: ItemType;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  priceType: PriceType;
  image: string;
  imageStyle?: { backgroundSize: string; backgroundPosition: string };
  category: string;
  badge?: string;
  available: boolean;
  unit: string;
  details: Array<{ label: string; value: string }>;
  variants: string[];
}

export interface StorefrontBusiness {
  name: string;
  slug: string;
  description: string;
  whatsapp: string;
  whatsappDisplay: string;
  whatsappSecondary: string;
  whatsappSecondaryDisplay: string;
  instagram: string;
  address: string;
  mapsUrl: string;
  openingHours: string;
  cover: string;
  poster: string;
  logo?: string;
}

export interface StorefrontCollection {
  id: string;
  title: string;
  description: string;
  image: string;
  itemIds: string[];
  accent: string;
}

export const business: StorefrontBusiness = {
  name: "Toko Evi",
  slug: "toko-evi",
  description:
    "Pusat oleh-oleh khas Sumbawa: madu, permen susu, susu kuda liar, manjareal, kacang mete, dan pilihan khas lainnya.",
  whatsapp: "6281909020111",
  whatsappDisplay: "0819 0902 0111",
  whatsappSecondary: "6281233266111",
  whatsappSecondaryDisplay: "0812 3326 6111",
  instagram: "oleh_oleh.sumbawa",
  address: "Jl. Dr. Wahidin, depan Gerbang Masjid Jami' Nurul Huda, Brang Bara, Sumbawa Besar",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Toko+Evi+Oleh-Oleh+Khas+Sumbawa",
  openingHours: "Konfirmasi via WhatsApp",
  cover: "/storefront/store-cover.jpg",
  poster: "/storefront/toko-evi-poster.jpg",
};

export const storefrontItems: StorefrontItem[] = [
  {
    id: "madu-sumbawa",
    type: "product",
    slug: "madu-sumbawa",
    name: "Madu Sumbawa",
    shortDescription: "Tersedia dalam beberapa ukuran kemasan",
    description:
      "Pilihan madu khas Sumbawa yang tersedia di Toko Evi. Pilih ukuran yang dibutuhkan lalu tanyakan harga dan ketersediaannya langsung kepada admin.",
    price: 0,
    priceType: "contact",
    image: "/storefront/toko-evi-poster.jpg",
    imageStyle: { backgroundSize: "300% auto", backgroundPosition: "13% 32%" },
    category: "Madu",
    badge: "Best Seller",
    available: true,
    unit: "beragam ukuran",
    variants: ["Botol kecil", "Botol sedang", "Jeriken"],
    details: [
      { label: "Pilihan ukuran", value: "Kecil, sedang, jeriken" },
      { label: "Harga", value: "Tanyakan admin" },
      { label: "Ketersediaan", value: "Konfirmasi via WhatsApp" },
      { label: "Lokasi", value: "Toko Evi, Sumbawa Besar" },
    ],
  },
  {
    id: "susu-kuda-liar",
    type: "product",
    slug: "susu-kuda-liar",
    name: "Susu Kuda Liar Sumbawa",
    shortDescription: "Oleh-oleh ikonik khas Sumbawa",
    description:
      "Susu kuda liar khas Sumbawa tersedia dalam beberapa pilihan kemasan dan merek. Admin Toko Evi akan membantu menginformasikan stok terbaru.",
    price: 0,
    priceType: "contact",
    image: "/storefront/toko-evi-poster.jpg",
    imageStyle: { backgroundSize: "300% auto", backgroundPosition: "13% 64%" },
    category: "Minuman",
    badge: "Recommended",
    available: true,
    unit: "beragam kemasan",
    variants: ["Kemasan botol", "Kemasan kotak"],
    details: [
      { label: "Jenis", value: "Susu kuda liar" },
      { label: "Kemasan", value: "Botol / kotak" },
      { label: "Harga", value: "Tanyakan admin" },
      { label: "Ketersediaan", value: "Konfirmasi via WhatsApp" },
    ],
  },
  {
    id: "permen-susu",
    type: "product",
    slug: "permen-susu",
    name: "Permen Susu Sumbawa",
    shortDescription: "Camilan manis khas untuk buah tangan",
    description:
      "Permen susu khas Sumbawa, praktis untuk dibawa pulang dan dibagikan kepada keluarga atau teman. Tanyakan pilihan kemasan yang sedang tersedia.",
    price: 0,
    priceType: "contact",
    image: "/storefront/permen-susu.jpg",
    category: "Camilan",
    badge: "Best Seller",
    available: true,
    unit: "beragam kemasan",
    variants: ["Kemasan reguler"],
    details: [
      { label: "Jenis", value: "Permen susu" },
      { label: "Kemasan", value: "Tanyakan admin" },
      { label: "Harga", value: "Tanyakan admin" },
      { label: "Ketersediaan", value: "Konfirmasi via WhatsApp" },
    ],
  },
  {
    id: "kacang-mete",
    type: "product",
    slug: "kacang-mete",
    name: "Kacang Mete",
    shortDescription: "Camilan khas dalam kemasan praktis",
    description:
      "Kacang mete pilihan yang cocok untuk camilan dan buah tangan. Hubungi admin Toko Evi untuk mengetahui pilihan ukuran dan stok saat ini.",
    price: 0,
    priceType: "contact",
    image: "/storefront/toko-evi-poster.jpg",
    imageStyle: { backgroundSize: "300% auto", backgroundPosition: "55% 32%" },
    category: "Camilan",
    available: true,
    unit: "pouch",
    variants: ["Kemasan pouch"],
    details: [
      { label: "Jenis", value: "Kacang mete" },
      { label: "Kemasan", value: "Pouch" },
      { label: "Harga", value: "Tanyakan admin" },
      { label: "Ketersediaan", value: "Konfirmasi via WhatsApp" },
    ],
  },
  {
    id: "manjareal",
    type: "product",
    slug: "manjareal",
    name: "Manjareal",
    shortDescription: "Jajanan tradisional khas Sumbawa",
    description:
      "Manjareal merupakan salah satu jajanan khas Sumbawa yang cocok dijadikan buah tangan. Tanyakan pilihan merek dan kemasan kepada admin.",
    price: 0,
    priceType: "contact",
    image: "/storefront/toko-evi-poster.jpg",
    imageStyle: { backgroundSize: "300% auto", backgroundPosition: "94% 32%" },
    category: "Camilan",
    badge: "Recommended",
    available: true,
    unit: "box",
    variants: ["Kemasan box"],
    details: [
      { label: "Jenis", value: "Jajanan tradisional" },
      { label: "Kemasan", value: "Box" },
      { label: "Harga", value: "Tanyakan admin" },
      { label: "Ketersediaan", value: "Konfirmasi via WhatsApp" },
    ],
  },
  {
    id: "sirup-khas-sumbawa",
    type: "product",
    slug: "sirup-khas-sumbawa",
    name: "Sirup Khas Sumbawa",
    shortDescription: "Pilihan minuman lokal dalam botol",
    description:
      "Pilihan sirup khas Sumbawa dalam beberapa ukuran botol. Hubungi admin untuk memastikan rasa, ukuran, dan stok yang tersedia.",
    price: 0,
    priceType: "contact",
    image: "/storefront/toko-evi-poster.jpg",
    imageStyle: { backgroundSize: "300% auto", backgroundPosition: "94% 64%" },
    category: "Minuman",
    available: true,
    unit: "botol",
    variants: ["Botol kecil", "Botol besar"],
    details: [
      { label: "Jenis", value: "Sirup khas" },
      { label: "Ukuran", value: "Kecil / besar" },
      { label: "Harga", value: "Tanyakan admin" },
      { label: "Ketersediaan", value: "Konfirmasi via WhatsApp" },
    ],
  },
];

export const storefrontCollections: StorefrontCollection[] = [
  {
    id: "paling-laris",
    title: "Khas Sumbawa",
    description: "Pilihan ikonik untuk dibawa pulang",
    image: "/storefront/madu-sumbawa.jpg",
    itemIds: ["madu-sumbawa", "susu-kuda-liar", "permen-susu"],
    accent: "#E9A23B",
  },
  {
    id: "untuk-keluarga",
    title: "Untuk keluarga",
    description: "Camilan khas yang mudah dibagikan",
    image: "/storefront/permen-susu.jpg",
    itemIds: ["permen-susu", "kacang-mete", "manjareal"],
    accent: "#2F6A52",
  },
  {
    id: "pilihan-minuman",
    title: "Pilihan minuman",
    description: "Madu, susu kuda liar, dan sirup khas",
    image: "/storefront/toko-evi-poster.jpg",
    itemIds: ["madu-sumbawa", "susu-kuda-liar", "sirup-khas-sumbawa"],
    accent: "#A65A3A",
  },
];

export function formatPrice(item: Pick<StorefrontItem, "price" | "priceType">) {
  if (item.priceType === "contact") return "Tanya harga";
  if (item.priceType === "free") return "Gratis";
  const value = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(item.price);
  return item.priceType === "starting_from" ? `Mulai ${value}` : value;
}

export function itemSupportsQuantity(item: Pick<StorefrontItem, "type">) {
  return item.type === "product";
}

export function itemTypeLabel(item: Pick<StorefrontItem, "type">) {
  return {
    product: "Produk",
    service: "Layanan",
    package: "Paket",
    promo: "Promo",
  }[item.type];
}

export function itemAvailabilityLabel(item: Pick<StorefrontItem, "type" | "available">) {
  if (item.available) return item.type === "service" ? "Menerima permintaan" : "Tersedia";
  return item.type === "product" ? "Stok habis" : "Tidak tersedia sementara";
}

export function getItem(slug: string | undefined) {
  return storefrontItems.find((item) => item.slug === slug);
}
