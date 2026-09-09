export type PriceType = "fixed" | "starting_from" | "contact" | "free";

export interface StorefrontItem {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  priceType: PriceType;
  image: string;
  category: string;
  badge?: "Best Seller" | "Recommended" | "Baru" | "Promo" | "Limited";
  available: boolean;
  unit: string;
  details: Array<{ label: string; value: string }>;
  variants: string[];
}

export interface StorefrontCollection {
  id: string;
  title: string;
  description: string;
  image: string;
  itemIds: string[];
  accent: string;
}

export const business = {
  name: "Oleh-Oleh Mira",
  slug: "oleh-oleh-mira",
  description:
    "Oleh-oleh khas Sumbawa pilihan, dibuat oleh produsen lokal dan dikemas aman untuk perjalanan.",
  whatsapp: "6281234567890",
  instagram: "oleholehmira.sumbawa",
  address: "Jl. Garuda No. 18, Sumbawa Besar",
  mapsUrl: "https://maps.google.com/?q=Sumbawa+Besar",
  openingHours: "08.00–21.00 WITA",
  rating: 4.9,
  reviewCount: 127,
  cover: "/storefront/store-cover.jpg",
};

export const storefrontItems: StorefrontItem[] = [
  {
    id: "madu-sumbawa",
    slug: "madu-sumbawa",
    name: "Madu Hutan Sumbawa",
    shortDescription: "250 ml · manis alami dari hutan Sumbawa",
    description:
      "Madu hutan murni dengan rasa manis yang lembut dan aroma khas. Dipanen secara tradisional, disaring, lalu dikemas dalam botol kaca yang aman dibawa pulang.",
    price: 85000,
    priceType: "fixed",
    image: "/storefront/madu-sumbawa.jpg",
    category: "Makanan",
    badge: "Best Seller",
    available: true,
    unit: "botol 250 ml",
    variants: ["250 ml", "500 ml"],
    details: [
      { label: "Isi", value: "250 ml" },
      { label: "Masa simpan", value: "12 bulan" },
      { label: "Kemasan", value: "Botol kaca + bubble wrap" },
      { label: "Dibawa pesawat", value: "Bisa, masuk bagasi" },
    ],
  },
  {
    id: "kopi-tambora",
    slug: "kopi-tambora",
    name: "Kopi Tambora Arabika",
    shortDescription: "200 gr · medium roast, citrus & caramel",
    description:
      "Biji kopi arabika pilihan dari lereng Tambora. Disangrai medium untuk mempertahankan aroma buah, rasa karamel, dan aftertaste yang bersih.",
    price: 75000,
    priceType: "fixed",
    image: "/storefront/kopi-tambora.jpg",
    category: "Minuman",
    badge: "Recommended",
    available: true,
    unit: "pouch 200 gr",
    variants: ["Biji kopi", "Bubuk halus", "Bubuk kasar"],
    details: [
      { label: "Berat", value: "200 gr" },
      { label: "Roast level", value: "Medium" },
      { label: "Proses", value: "Natural" },
      { label: "Masa simpan", value: "6 bulan" },
    ],
  },
  {
    id: "permen-susu",
    slug: "permen-susu",
    name: "Permen Susu Sumbawa",
    shortDescription: "Isi 30 · lembut, milky, favorit anak-anak",
    description:
      "Permen susu khas Sumbawa dengan tekstur lembut dan rasa susu yang legit. Dikemas satu per satu agar praktis dibagikan sebagai buah tangan.",
    price: 35000,
    priceType: "fixed",
    image: "/storefront/permen-susu.jpg",
    category: "Camilan",
    badge: "Best Seller",
    available: true,
    unit: "pouch isi 30",
    variants: ["Original", "Cokelat"],
    details: [
      { label: "Isi", value: "±30 pcs" },
      { label: "Berat", value: "180 gr" },
      { label: "Masa simpan", value: "4 bulan" },
      { label: "Dibawa pesawat", value: "Bisa" },
    ],
  },
  {
    id: "abon-sapi",
    slug: "abon-sapi",
    name: "Abon Sapi Sumbawa",
    shortDescription: "150 gr · gurih, serat halus, tanpa pengawet",
    description:
      "Abon sapi rumahan dari daging pilihan, dimasak perlahan dengan rempah khas hingga gurih dan kering. Cocok untuk lauk praktis selama perjalanan.",
    price: 95000,
    priceType: "fixed",
    image: "/storefront/abon-sapi.jpg",
    category: "Makanan",
    badge: "Limited",
    available: true,
    unit: "jar 150 gr",
    variants: ["Original", "Pedas"],
    details: [
      { label: "Berat", value: "150 gr" },
      { label: "Level pedas", value: "Original / pedas" },
      { label: "Masa simpan", value: "3 bulan" },
      { label: "PIRT", value: "Sudah tersedia" },
    ],
  },
  {
    id: "dodol-rumput-laut",
    slug: "dodol-rumput-laut",
    name: "Dodol Rumput Laut",
    shortDescription: "Isi 24 · kenyal, manis ringan",
    description:
      "Dodol rumput laut bertekstur kenyal dengan rasa manis ringan. Dikemas individual sehingga mudah dibagikan untuk keluarga dan teman kantor.",
    price: 42000,
    priceType: "fixed",
    image: "/storefront/store-cover.jpg",
    category: "Camilan",
    badge: "Baru",
    available: true,
    unit: "box isi 24",
    variants: ["Mix rasa", "Original"],
    details: [
      { label: "Isi", value: "24 pcs" },
      { label: "Masa simpan", value: "3 bulan" },
      { label: "Kemasan", value: "Box food grade" },
      { label: "Dibawa pesawat", value: "Bisa" },
    ],
  },
  {
    id: "kerupuk-kulit",
    slug: "kerupuk-kulit",
    name: "Kerupuk Kulit Sapi",
    shortDescription: "100 gr · renyah dan gurih",
    description:
      "Kerupuk kulit sapi khas Sumbawa yang digoreng kering dan dibumbui ringan. Tetap renyah berkat kemasan bersegel.",
    price: 38000,
    priceType: "fixed",
    image: "/storefront/abon-sapi.jpg",
    category: "Camilan",
    available: false,
    unit: "pouch 100 gr",
    variants: ["Original"],
    details: [
      { label: "Berat", value: "100 gr" },
      { label: "Masa simpan", value: "2 bulan" },
      { label: "Kemasan", value: "Pouch bersegel" },
      { label: "Status", value: "Segera tersedia lagi" },
    ],
  },
  {
    id: "paket-sahabat",
    slug: "paket-sahabat",
    name: "Paket Buah Tangan",
    shortDescription: "3 produk favorit dalam tas anyaman",
    description:
      "Paket praktis berisi Permen Susu, Kopi Tambora, dan Dodol Rumput Laut. Sudah dikemas rapi dan siap langsung diberikan.",
    price: 149000,
    priceType: "starting_from",
    image: "/storefront/store-cover.jpg",
    category: "Paket",
    badge: "Recommended",
    available: true,
    unit: "paket",
    variants: ["Kemasan reguler", "Tas anyaman"],
    details: [
      { label: "Isi", value: "3 produk" },
      { label: "Cocok untuk", value: "Teman & keluarga" },
      { label: "Kartu ucapan", value: "Gratis" },
      { label: "Pesan khusus", value: "Bisa" },
    ],
  },
  {
    id: "paket-kantor",
    slug: "paket-kantor",
    name: "Paket Oleh-Oleh Kantor",
    shortDescription: "Bisa custom · mulai dari 10 orang",
    description:
      "Paket ekonomis untuk dibagikan di kantor. Pilih kombinasi camilan dan tentukan jumlah penerima, tim Mira akan membantu menyesuaikan dengan anggaran Anda.",
    price: 299000,
    priceType: "starting_from",
    image: "/storefront/store-cover.jpg",
    category: "Paket",
    badge: "Promo",
    available: true,
    unit: "paket 10 orang",
    variants: ["Hemat", "Favorit", "Premium"],
    details: [
      { label: "Minimum", value: "10 orang" },
      { label: "Isi", value: "Bisa custom" },
      { label: "Kartu ucapan", value: "Gratis" },
      { label: "Lead time", value: "1–2 hari" },
    ],
  },
];

export const storefrontCollections: StorefrontCollection[] = [
  {
    id: "paling-laris",
    title: "Paling laris",
    description: "Pilihan yang paling sering dibawa pulang",
    image: "/storefront/madu-sumbawa.jpg",
    itemIds: ["madu-sumbawa", "permen-susu", "kopi-tambora"],
    accent: "#E9A23B",
  },
  {
    id: "untuk-kantor",
    title: "Untuk teman kantor",
    description: "Praktis dibagi, mulai Rp35 ribuan",
    image: "/storefront/permen-susu.jpg",
    itemIds: ["permen-susu", "dodol-rumput-laut", "paket-kantor"],
    accent: "#2F6A52",
  },
  {
    id: "tahan-perjalanan",
    title: "Tahan perjalanan jauh",
    description: "Aman dibawa sampai ke luar kota",
    image: "/storefront/kopi-tambora.jpg",
    itemIds: ["kopi-tambora", "abon-sapi", "madu-sumbawa"],
    accent: "#A65A3A",
  },
];

export function formatPrice(item: Pick<StorefrontItem, "price" | "priceType">) {
  if (item.priceType === "contact") return "Hubungi penjual";
  if (item.priceType === "free") return "Gratis";
  const value = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(item.price);
  return item.priceType === "starting_from" ? `Mulai ${value}` : value;
}

export function getItem(slug: string | undefined) {
  return storefrontItems.find((item) => item.slug === slug);
}
