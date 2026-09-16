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
  catalogTheme: "modern",
  catalogAccent: "#0F8B8D",
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

const serviceBusiness: StorefrontBusiness = {
  name: "Studio Rapi",
  slug: "studio-rapi-demo",
  description: "Hair, makeup, dan grooming profesional dengan konsultasi personal dan reservasi yang jelas.",
  whatsapp: "6281234567891",
  whatsappDisplay: "0812 3456 7891",
  whatsappSecondary: "",
  whatsappSecondaryDisplay: "",
  instagram: "studiorapi",
  address: "Jl. Hasanuddin No. 7, Sumbawa Besar",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Salon+Sumbawa",
  openingHours: "Senin–Sabtu, 09.00–19.00",
  cover: "/storefront/discovery-delivery.webp",
  poster: "/storefront/discovery-delivery.webp",
  catalogPreset: "service",
  defaultItemLayout: "card",
  catalogTheme: "minimal",
  catalogAccent: "#111827",
};

const serviceItems: StorefrontItem[] = [
  demoItem({ id: "haircut-styling", slug: "haircut-styling", type: "service", name: "Haircut & Styling", category: "Hair", shortDescription: "Konsultasi bentuk wajah · 60 menit", description: "Potongan dan styling personal sesuai karakter rambut dan aktivitas harian.", price: 85000, priceType: "starting_from", unit: "sesi", image: "/storefront/discovery-delivery.webp" }),
  demoItem({ id: "hair-coloring", slug: "hair-coloring", type: "service", name: "Hair Coloring", category: "Hair", shortDescription: "Konsultasi warna dan tes rambut", description: "Pewarnaan menyeluruh dengan rekomendasi tone dan perawatan setelahnya.", price: 0, priceType: "contact", unit: "sesi", image: "/storefront/store-cover.jpg" }),
  demoItem({ id: "makeup-wisuda", slug: "makeup-wisuda", type: "service", name: "Makeup Wisuda", category: "Makeup", shortDescription: "Makeup, lashes, dan touch-up kit", description: "Tampilan tahan lama untuk wisuda, termasuk konsultasi look.", price: 350000, priceType: "starting_from", unit: "orang", badge: "Favorit", image: "/storefront/toko-evi-poster.jpg" }),
  demoItem({ id: "bridal-package", slug: "bridal-package", type: "package", name: "Bridal Essential", category: "Paket", shortDescription: "Trial, makeup, dan hairdo hari-H", description: "Paket rias pengantin dengan sesi trial dan koordinasi jadwal.", price: 0, priceType: "contact", unit: "paket", image: "/storefront/discovery-souvenir.webp" }),
  demoItem({ id: "hair-spa", slug: "hair-spa", type: "service", name: "Hair Spa", category: "Paket", shortDescription: "Perawatan intensif · 75 menit", description: "Perawatan kulit kepala dan batang rambut dengan pijat relaksasi.", price: 150000, priceType: "fixed", unit: "sesi", image: "/storefront/madu-sumbawa.jpg" }),
];

const serviceSections: StorefrontSection[] = [
  { id: "service-info", type: "information", title: "Konsultasi sebelum reservasi", subtitle: "Kirim referensi dan ceritakan kebutuhanmu. Tim kami akan menyarankan layanan dan durasi yang tepat.", category: "", layout: "row", image: "", badge: "CARA PESAN", ctaLabel: "Mulai konsultasi", ctaUrl: "", scheduleLabel: "", sortOrder: 0 },
  { id: "service-hair", type: "item_group", title: "Hair", subtitle: "Potong, warna, dan styling yang disesuaikan.", category: "Hair", layout: "card", image: "/storefront/discovery-delivery.webp", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 1 },
  { id: "service-makeup", type: "item_group", title: "Makeup", subtitle: "Untuk momen penting dan dokumentasi.", category: "Makeup", layout: "row", image: "/storefront/toko-evi-poster.jpg", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 2 },
  { id: "service-package", type: "item_group", title: "Paket perawatan", subtitle: "Pilihan lengkap dengan waktu dan hasil yang jelas.", category: "Paket", layout: "card", image: "/storefront/madu-sumbawa.jpg", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 3 },
  { id: "service-slot", type: "activity", title: "Slot konsultasi minggu ini", subtitle: "Konsultasi 30 menit tanpa biaya untuk menentukan layanan dan jadwal.", category: "", layout: "row", image: "/storefront/discovery-delivery.webp", badge: "TERSEDIA", ctaLabel: "Pilih jadwal", ctaUrl: "", scheduleLabel: "Senin–Sabtu · 10.00–17.00", sortOrder: 4 },
];

const retailBusiness: StorefrontBusiness = {
  name: "Nusa Local",
  slug: "nusa-local-demo",
  description: "Produk lokal pilihan untuk hadiah, oleh-oleh, dan kebutuhan rumah dengan cerita dari pembuatnya.",
  whatsapp: "6281234567892",
  whatsappDisplay: "0812 3456 7892",
  whatsappSecondary: "",
  whatsappSecondaryDisplay: "",
  instagram: "nusalocal",
  address: "Jl. Garuda No. 24, Sumbawa Besar",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Oleh-oleh+Sumbawa",
  openingHours: "Setiap hari, 08.00–21.00",
  cover: "/storefront/discovery-souvenir.webp",
  poster: "/storefront/discovery-souvenir.webp",
  catalogPreset: "retail",
  defaultItemLayout: "card",
  catalogTheme: "warm",
  catalogAccent: "#B45309",
};

const retailItems: StorefrontItem[] = [
  demoItem({ id: "gift-box-sumbawa", slug: "gift-box-sumbawa", name: "Gift Box Sumbawa", category: "Hadiah", shortDescription: "Lima produk lokal dalam satu box", description: "Paket hadiah siap kirim dengan kartu ucapan yang dapat dikustomisasi.", price: 175000, priceType: "fixed", unit: "box", badge: "Pilihan", image: "/storefront/discovery-souvenir.webp" }),
  demoItem({ id: "hampers-kain", slug: "hampers-kain", name: "Hampers Kain", category: "Hadiah", shortDescription: "Kemasan kain guna ulang", description: "Hampers berisi produk lokal dengan pilihan warna kain dan kartu ucapan.", price: 225000, priceType: "starting_from", unit: "paket", image: "/storefront/toko-evi-poster.jpg" }),
  demoItem({ id: "madu-hutan", slug: "madu-hutan", name: "Madu Hutan", category: "Oleh-oleh", shortDescription: "Botol 500 ml", description: "Madu lokal dalam kemasan aman untuk dibawa bepergian.", price: 120000, priceType: "fixed", unit: "botol", image: "/storefront/madu-sumbawa.jpg" }),
  demoItem({ id: "kopi-tambora", slug: "kopi-tambora", name: "Kopi Tambora", category: "Oleh-oleh", shortDescription: "Arabika roasted bean 200 gr", description: "Biji kopi lokal dengan profil cokelat, caramel, dan citrus.", price: 78000, priceType: "fixed", unit: "pack", image: "/storefront/kopi-tambora.jpg" }),
  demoItem({ id: "abon-sapi", slug: "abon-sapi", name: "Abon Sapi", category: "Oleh-oleh", shortDescription: "Kemasan 250 gram", description: "Abon sapi gurih dalam pouch yang praktis.", price: 68000, priceType: "fixed", unit: "pouch", image: "/storefront/abon-sapi.jpg" }),
  demoItem({ id: "home-basket", slug: "home-basket", name: "Anyaman Serbaguna", category: "Rumah", shortDescription: "Dibuat tangan oleh perajin lokal", description: "Keranjang ringan untuk penyimpanan atau dekorasi rumah.", price: 95000, priceType: "starting_from", unit: "item", image: "/storefront/store-cover.jpg" }),
];

const retailSections: StorefrontSection[] = [
  { id: "retail-promo", type: "promotion", title: "Gratis kirim area kota", subtitle: "Minimum belanja Rp150.000 sampai akhir minggu.", category: "", layout: "card", image: "/storefront/discovery-souvenir.webp", badge: "WEEKEND", ctaLabel: "Belanja sekarang", ctaUrl: "", scheduleLabel: "", sortOrder: 0 },
  { id: "retail-gifts", type: "item_group", title: "Hadiah", subtitle: "Siap diberikan, tetap terasa personal.", category: "Hadiah", layout: "card", image: "/storefront/toko-evi-poster.jpg", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 1 },
  { id: "retail-souvenir", type: "item_group", title: "Oleh-oleh", subtitle: "Rasa lokal yang mudah dibawa pulang.", category: "Oleh-oleh", layout: "card", image: "/storefront/madu-sumbawa.jpg", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 2 },
  { id: "retail-home", type: "item_group", title: "Rumah", subtitle: "Benda sehari-hari dari perajin lokal.", category: "Rumah", layout: "row", image: "/storefront/store-cover.jpg", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 3 },
  { id: "retail-live", type: "activity", title: "Live shopping produk baru", subtitle: "Lihat detail produk, tanya langsung, dan dapatkan voucher khusus selama live.", category: "", layout: "row", image: "/storefront/discovery-souvenir.webp", badge: "SABTU", ctaLabel: "Ingatkan saya", ctaUrl: "", scheduleLabel: "19.00 WITA · Instagram Live", sortOrder: 4 },
];

const activityBusiness: StorefrontBusiness = {
  name: "Jelajah Sumbawa",
  slug: "jelajah-sumbawa-demo",
  description: "Trip lokal, kelas budaya, dan pengalaman akhir pekan bersama pemandu komunitas.",
  whatsapp: "6281234567893",
  whatsappDisplay: "0812 3456 7893",
  whatsappSecondary: "",
  whatsappSecondaryDisplay: "",
  instagram: "jelajahsumbawa",
  address: "Titik kumpul berbeda untuk setiap aktivitas",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sumbawa",
  openingHours: "Admin aktif, 07.00–20.00",
  cover: "/storefront/store-cover.jpg",
  poster: "/storefront/store-cover.jpg",
  catalogPreset: "activity",
  defaultItemLayout: "row",
  catalogTheme: "bold",
  catalogAccent: "#F05A28",
};

const activityItems: StorefrontItem[] = [
  demoItem({ id: "one-day-moyo", slug: "one-day-moyo", type: "package", name: "One Day Moyo", category: "Trip Alam", shortDescription: "10 jam · makan siang · maksimal 10 orang", description: "Perjalanan sehari dengan pemandu, transportasi lokal, dan makan siang.", price: 650000, priceType: "starting_from", unit: "orang", badge: "6 slot", image: "/storefront/store-cover.jpg" }),
  demoItem({ id: "sunrise-hike", slug: "sunrise-hike", type: "service", name: "Sunrise Hike", category: "Trip Alam", shortDescription: "5 jam · level sedang", description: "Pendakian pagi dengan pemandu dan sarapan ringan.", price: 220000, priceType: "fixed", unit: "orang", image: "/storefront/discovery-delivery.webp" }),
  demoItem({ id: "kelas-tenun", slug: "kelas-tenun", type: "service", name: "Kelas Tenun", category: "Kelas", shortDescription: "3 jam · alat dan bahan tersedia", description: "Belajar pola dasar dan proses menenun bersama perajin lokal.", price: 175000, priceType: "fixed", unit: "orang", image: "/storefront/discovery-souvenir.webp" }),
  demoItem({ id: "kelas-masak", slug: "kelas-masak", type: "service", name: "Kelas Masak Lokal", category: "Kelas", shortDescription: "2,5 jam · makan bersama", description: "Memasak menu lokal dari persiapan bumbu hingga penyajian.", price: 195000, priceType: "fixed", unit: "orang", image: "/storefront/abon-sapi.jpg" }),
  demoItem({ id: "snorkeling-pemula", slug: "snorkeling-pemula", type: "package", name: "Snorkeling Pemula", category: "Keluarga", shortDescription: "4 jam · usia 8+ · perlengkapan termasuk", description: "Aktivitas air ramah pemula dengan instruktur dan perlengkapan keselamatan.", price: 325000, priceType: "fixed", unit: "orang", image: "/storefront/discovery-coffee.webp" }),
];

const activitySections: StorefrontSection[] = [
  { id: "activity-promo", type: "promotion", title: "Early bird trip Moyo", subtitle: "Potongan 15% untuk keberangkatan bulan ini.", category: "", layout: "card", image: "/storefront/store-cover.jpg", badge: "EARLY BIRD", ctaLabel: "Lihat trip", ctaUrl: "", scheduleLabel: "", sortOrder: 0 },
  { id: "activity-trip", type: "item_group", title: "Trip Alam", subtitle: "Perjalanan kecil dengan pemandu lokal.", category: "Trip Alam", layout: "row", image: "/storefront/store-cover.jpg", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 1 },
  { id: "activity-class", type: "item_group", title: "Kelas", subtitle: "Belajar langsung dari pelaku budaya.", category: "Kelas", layout: "card", image: "/storefront/discovery-souvenir.webp", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 2 },
  { id: "activity-family", type: "item_group", title: "Keluarga", subtitle: "Pengalaman yang ramah untuk berbagai usia.", category: "Keluarga", layout: "row", image: "/storefront/discovery-coffee.webp", badge: "", ctaLabel: "", ctaUrl: "", scheduleLabel: "", sortOrder: 3 },
  { id: "activity-departure", type: "activity", title: "Keberangkatan terdekat", subtitle: "One Day Moyo dengan enam slot yang masih tersedia.", category: "", layout: "row", image: "/storefront/store-cover.jpg", badge: "21 SEP", ctaLabel: "Pesan slot", ctaUrl: "", scheduleLabel: "07.00–17.00 · 6 slot tersisa", sortOrder: 4 },
  { id: "activity-info", type: "information", title: "Perlu trip privat?", subtitle: "Tanggal, kapasitas, dan rute dapat disusun untuk keluarga atau tim kecil.", category: "", layout: "row", image: "", badge: "CUSTOM TRIP", ctaLabel: "Diskusikan rute", ctaUrl: "", scheduleLabel: "", sortOrder: 5 },
];

export type CatalogDemoKey = "restoran" | "jasa" | "retail" | "aktivitas";

export const catalogDemos: Record<CatalogDemoKey, { business: StorefrontBusiness; items: StorefrontItem[]; sections: StorefrontSection[] }> = {
  restoran: { business: modularDemoBusiness, items: modularDemoItems, sections: modularDemoSections },
  jasa: { business: serviceBusiness, items: serviceItems, sections: serviceSections },
  retail: { business: retailBusiness, items: retailItems, sections: retailSections },
  aktivitas: { business: activityBusiness, items: activityItems, sections: activitySections },
};
