import type { StorefrontBusiness, StorefrontItem, StorefrontSection } from "./storefrontData";

export const modularDemoBusiness: StorefrontBusiness = {
  name: "Kopi Kawan",
  slug: "kopi-kawan-demo",
  description: "Kopi harian, pastry hangat, dan ruang singgah untuk bekerja atau bertemu teman di pusat kota.",
  whatsapp: "6281234567890",
  whatsappDisplay: "0812 3456 7890",
  whatsappSecondary: "",
  whatsappSecondaryDisplay: "",
  instagram: "kopikawan",
  address: "Jl. Diponegoro No. 18, Sumbawa Besar",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Kopi+Sumbawa",
  openingHours: "Setiap hari, 07.00–22.00",
  cover: "/storefront/discovery-coffee.webp",
  poster: "/storefront/discovery-coffee.webp",
  catalogPreset: "restaurant",
  defaultItemLayout: "row",
};

function demoItem(value: Partial<StorefrontItem> & Pick<StorefrontItem, "id" | "slug" | "name" | "category">): StorefrontItem {
  return {
    type: "product",
    shortDescription: "",
    description: "",
    price: 0,
    priceType: "contact",
    image: "/storefront/discovery-coffee.webp",
    available: true,
    unit: "porsi",
    details: [],
    variants: [],
    ...value,
  };
}

export const modularDemoItems: StorefrontItem[] = [
  demoItem({ id: "kopi-susu-kawan", slug: "kopi-susu-kawan", name: "Kopi Susu Kawan", category: "Coffee", shortDescription: "Espresso, susu, dan gula aren", description: "Kopi susu creamy dengan gula aren lokal. Tersedia panas atau dingin.", price: 22000, priceType: "fixed", badge: "Best Seller" }),
  demoItem({ id: "cold-brew-citrus", slug: "cold-brew-citrus", name: "Cold Brew Citrus", category: "Coffee", shortDescription: "Segar, ringan, dan low sugar", description: "Cold brew 16 jam dengan sentuhan jeruk segar.", price: 28000, priceType: "fixed" }),
  demoItem({ id: "cappuccino", slug: "cappuccino", name: "Cappuccino", category: "Coffee", shortDescription: "Double shot dengan microfoam", description: "Racikan klasik dengan pilihan biji house blend.", price: 25000, priceType: "fixed" }),
  demoItem({ id: "butter-croissant", slug: "butter-croissant", name: "Butter Croissant", category: "Pastry", shortDescription: "Dipanggang segar setiap pagi", description: "Croissant berlapis dengan butter premium.", price: 18000, priceType: "fixed", image: "/storefront/permen-susu.jpg" }),
  demoItem({ id: "basque-cheesecake", slug: "basque-cheesecake", name: "Basque Cheesecake", category: "Pastry", shortDescription: "Creamy dengan permukaan caramelized", description: "Cheesecake lembut, dijual per slice.", price: 32000, priceType: "fixed", image: "/storefront/permen-susu.jpg" }),
  demoItem({ id: "chicken-sando", slug: "chicken-sando", name: "Chicken Sando", category: "Brunch", shortDescription: "Ayam, slaw, dan roti lembut", description: "Menu brunch lengkap dengan side salad.", price: 39000, priceType: "fixed", image: "/storefront/store-cover.jpg" }),
  demoItem({ id: "breakfast-set", slug: "breakfast-set", name: "Breakfast Set", category: "Brunch", shortDescription: "Kopi, toast, telur, dan salad", description: "Paket sarapan praktis sampai pukul 11.00.", price: 48000, priceType: "fixed", badge: "Paket Hemat", image: "/storefront/store-cover.jpg" }),
];

export const modularDemoSections: StorefrontSection[] = [
  {
    id: "promo-sarapan",
    type: "promotion",
    title: "Paket kopi + pastry hemat 20%",
    subtitle: "Berlaku setiap hari sampai pukul 10.00.",
    category: "",
    layout: "card",
    image: "/storefront/discovery-coffee.webp",
    badge: "PROMO PAGI",
    ctaLabel: "Lihat Coffee",
    ctaUrl: "",
    scheduleLabel: "",
    sortOrder: 0,
  },
  { id: "coffee", type: "item_group", title: "Coffee", subtitle: "Espresso-based, manual brew, dan minuman dingin.", category: "Coffee", layout: "row", image: "/storefront/discovery-coffee.webp", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 1 },
  { id: "pastry", type: "item_group", title: "Pastry", subtitle: "Dipanggang segar setiap pagi.", category: "Pastry", layout: "card", image: "/storefront/permen-susu.jpg", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 2 },
  { id: "brunch", type: "item_group", title: "Brunch", subtitle: "Menu lengkap untuk pagi yang lebih santai.", category: "Brunch", layout: "row", image: "/storefront/store-cover.jpg", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 3 },
  {
    id: "coffee-cupping",
    type: "activity",
    title: "Coffee cupping terbuka",
    subtitle: "Kenali karakter biji lokal bersama barista kami. Kapasitas 12 orang.",
    category: "",
    layout: "row",
    image: "/storefront/discovery-coffee.webp",
    badge: "JUMAT",
    ctaLabel: "Reservasi",
    ctaUrl: "",
    scheduleLabel: "16.00–17.30 · Rp50.000/orang",
    sortOrder: 4,
  },
  {
    id: "info-reservasi",
    type: "information",
    title: "Reservasi meja & ruang kecil",
    subtitle: "Untuk pertemuan hingga 12 orang, hubungi kami minimal satu hari sebelumnya.",
    category: "",
    layout: "row",
    image: "",
    badge: "INFORMASI",
    ctaLabel: "Tanya via WhatsApp",
    ctaUrl: "",
    scheduleLabel: "",
    sortOrder: 5,
  },
];
