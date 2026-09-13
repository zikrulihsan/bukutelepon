import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiArrowRight,
  HiBars3,
  HiBriefcase,
  HiBuildingStorefront,
  HiChatBubbleLeftRight,
  HiCheck,
  HiChevronDown,
  HiCube,
  HiLink,
  HiMapPin,
  HiPhone,
  HiPhoto,
  HiQrCode,
  HiSparkles,
  HiXMark,
} from "react-icons/hi2";
import { useAuth } from "../../hooks/useAuth";

type BusinessKind = "shop" | "cafe" | "service";

const whatsappBase = "https://wa.me/6282338588078";
const activationMessage = `${whatsappBase}?text=${encodeURIComponent(
  "Halo, saya ingin berkonsultasi dan mengajukan aktivasi Katalog Pro CariKontak.",
)}`;
const starterMessage = `${whatsappBase}?text=${encodeURIComponent(
  "Halo, saya ingin mendapat kabar saat paket Starter CariKontak tersedia.",
)}`;
const businessMessage = `${whatsappBase}?text=${encodeURIComponent(
  "Halo, saya ingin mendiskusikan kebutuhan paket Business CariKontak.",
)}`;

const businessTabs: Array<{
  id: BusinessKind;
  label: string;
  kicker: string;
  title: string;
  description: string;
  value: string;
}> = [
  {
    id: "shop",
    label: "Toko",
    kicker: "Untuk toko",
    title: "Biarkan pelanggan melihat pilihan sebelum bertanya.",
    description:
      "Tampilkan produk, harga, kategori, dan koleksi terbaru. Kamu tidak perlu lagi mengirim foto produk satu per satu melalui WhatsApp.",
    value: "Satu tautan untuk seluruh produkmu.",
  },
  {
    id: "cafe",
    label: "Restoran & Kedai Kopi",
    kicker: "Untuk usaha kuliner",
    title: "Menu dan harga bisa dilihat sebelum pelanggan datang.",
    description:
      "Susun menu dalam satu halaman agar pelanggan dapat memilih, mencari lokasi, lalu menghubungi tempatmu dengan mudah.",
    value: "Perbarui menu tanpa mencetak ulang.",
  },
  {
    id: "service",
    label: "Jasa",
    kicker: "Untuk penyedia jasa",
    title: "Tunjukkan layanan sekaligus hasil pekerjaanmu.",
    description:
      "Tampilkan layanan, kisaran harga, dan dokumentasi pekerjaan agar calon pelanggan lebih yakin sebelum menghubungi.",
    value: "Bukan hanya mengatakan bisa—tunjukkan hasilnya.",
  },
];

const benefits = [
  {
    icon: HiCube,
    title: "Penawaran yang mudah dipahami",
    copy: "Susun produk, menu, layanan, harga, dan pilihan yang tersedia dalam satu tempat.",
  },
  {
    icon: HiPhoto,
    title: "Bukti yang menambah keyakinan",
    copy: "Tampilkan foto, informasi terbaru, dan dokumentasi pekerjaan bisnismu.",
  },
  {
    icon: HiChatBubbleLeftRight,
    title: "Jalur kontak yang jelas",
    copy: "Arahkan pelanggan ke WhatsApp, telepon, lokasi, dan jam buka tanpa perlu mencari lagi.",
  },
];

const faqs = [
  [
    "Apakah katalog hanya untuk toko?",
    "Tidak. Katalog dapat digunakan oleh toko, restoran, kedai kopi, maupun penyedia jasa. Isi halaman menyesuaikan jenis bisnismu.",
  ],
  [
    "Saya sudah punya Instagram. Mengapa masih perlu katalog?",
    "Instagram cocok untuk berbagi konten. Katalog CariKontak menyusun produk, layanan, harga, kontak, dan lokasi dalam satu halaman yang mudah dicari dan dibagikan.",
  ],
  [
    "Apakah pelanggan harus memasang aplikasi?",
    "Tidak. Katalog dapat langsung dibuka melalui peramban di ponsel maupun komputer.",
  ],
  [
    "Paket apa saja yang akan tersedia?",
    "CariKontak disiapkan dalam empat pilihan: Gratis, Starter, Pro, dan Business. Saat ini aktivasi katalog dilakukan melalui paket Pro; paket Starter dan Business masih disiapkan.",
  ],
  [
    "Bagaimana proses aktivasi Katalog Pro?",
    "Tekan Ajukan Aktivasi Pro untuk menghubungi tim melalui WhatsApp. Tim akan mengonfirmasi kebutuhan bisnismu dan membantu proses aktivasi akun.",
  ],
  [
    "Apakah produk, harga, atau menu bisa diubah?",
    "Ya. Setelah akun Pro aktif, informasi katalog dapat diperbarui melalui dasbor tanpa mengganti tautan yang sudah dibagikan.",
  ],
  [
    "Apakah pembayaran pelanggan diproses oleh CariKontak?",
    "Belum. CariKontak membantu pelanggan menemukan, memahami, dan menghubungi bisnis. Transaksi tetap dilakukan langsung dengan pemilik bisnis.",
  ],
];

function BrandMark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#09634e] text-white">
        <HiPhone className="h-[18px] w-[18px]" />
      </span>
      <span className="text-[18px] font-extrabold tracking-[-0.035em] text-[#102a43]">
        CariKontak
      </span>
    </span>
  );
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={`text-[11px] font-extrabold uppercase tracking-[0.15em] ${
        light ? "text-[#8de0bd]" : "text-[#08745a]"
      }`}
    >
      {children}
    </p>
  );
}

function PrimaryAction({
  children,
  href,
  light = false,
}: {
  children: React.ReactNode;
  href: string;
  light?: boolean;
}) {
  const classes = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-[13px] font-extrabold transition hover:-translate-y-0.5 active:translate-y-0 ${
    light
      ? "bg-white text-[#075a46] shadow-[0_10px_25px_rgba(0,0,0,.12)]"
      : "bg-[#08745a] text-white shadow-[0_10px_25px_rgba(8,116,90,.2)] hover:bg-[#075f4b]"
  }`;

  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
        <HiArrowRight className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link to={href} className={classes}>
      {children}
      <HiArrowRight className="h-4 w-4" />
    </Link>
  );
}

function HeroCards() {
  return (
    <div className="relative mx-auto h-[430px] w-full max-w-[510px] sm:h-[480px]" aria-label="Contoh isi katalog bisnis">
      <div className="absolute left-1/2 top-0 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/90 px-4 py-2 text-[11px] font-extrabold text-[#08745a] shadow-[0_12px_35px_rgba(16,42,67,.12)] backdrop-blur">
        Produk · Menu · Layanan
      </div>

      <article className="absolute left-0 top-[82px] z-10 w-[72%] -rotate-[6deg] overflow-hidden rounded-[24px] border border-[#e6ece8] bg-white shadow-[0_22px_55px_rgba(16,42,67,.12)] sm:w-[66%]">
        <img src="/storefront/discovery-souvenir.webp" alt="Contoh katalog produk toko oleh-oleh" className="h-28 w-full object-cover" />
        <div className="p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#b7612b]">Produk</p>
          <h3 className="mt-1 text-[15px] font-extrabold tracking-[-0.025em]">Toko Oleh-Oleh</h3>
          <div className="mt-3 space-y-2 text-[11px] font-semibold text-[#5c7084]">
            <p className="flex justify-between"><span>Madu Hutan</span><span>Rp85rb</span></p>
            <p className="flex justify-between"><span>Susu Kuda Liar</span><span>Rp65rb</span></p>
          </div>
        </div>
      </article>

      <article className="absolute right-0 top-[98px] z-20 w-[70%] rotate-[5deg] overflow-hidden rounded-[24px] border border-[#e6ece8] bg-white shadow-[0_22px_55px_rgba(16,42,67,.14)] sm:w-[64%]">
        <img src="/storefront/discovery-coffee.webp" alt="Contoh katalog menu kedai kopi" className="h-28 w-full object-cover" />
        <div className="p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#966225]">Menu</p>
          <h3 className="mt-1 text-[15px] font-extrabold tracking-[-0.025em]">Kopi Ruang</h3>
          <div className="mt-3 grid grid-cols-2 gap-1.5 text-center text-[9px] font-bold text-[#5c7084]">
            <span className="rounded-lg bg-[#f7f2ea] p-2">Es Kopi Susu</span>
            <span className="rounded-lg bg-[#f7f2ea] p-2">Americano</span>
          </div>
        </div>
      </article>

      <article className="absolute bottom-0 left-1/2 z-30 w-[78%] -translate-x-1/2 overflow-hidden rounded-[26px] border border-white/80 bg-[#0d3b34] text-white shadow-[0_28px_65px_rgba(9,63,50,.25)] sm:w-[70%]">
        <div className="relative h-28 overflow-hidden">
          <img src="/storefront/store-cover.jpg" alt="Contoh hasil pekerjaan bisnis jasa" className="h-full w-full object-cover opacity-75" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d3b34] via-transparent to-transparent" />
        </div>
        <div className="relative -mt-4 p-5 pt-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#8de0bd]">Layanan & hasil kerja</p>
          <h3 className="mt-1 text-[17px] font-extrabold tracking-[-0.025em]">Sumbawa Interior</h3>
          <p className="mt-3 text-[11px] font-semibold text-[#d7efe7]">Kitchen set · Renovasi · Partisi</p>
        </div>
      </article>
    </div>
  );
}

function PhonePreview({ kind }: { kind: BusinessKind }) {
  return (
    <div aria-hidden="true" className="mx-auto w-full max-w-[320px] rounded-[36px] border-[8px] border-[#153a34] bg-white shadow-[0_30px_70px_rgba(22,58,52,.22)]">
      <div className="mx-auto h-5 w-24 rounded-b-2xl bg-[#153a34]" />
      <div className="px-3 pb-4 pt-2">
        {kind === "shop" && (
          <>
            <div className="relative overflow-hidden rounded-2xl">
              <img src="/storefront/discovery-souvenir.webp" alt="" className="h-28 w-full object-cover" />
              <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-extrabold text-[#08745a]">Buka hari ini</span>
            </div>
            <h4 className="mt-3 text-[15px] font-extrabold">Oleh-Oleh Khas Sumbawa</h4>
            <p className="mt-1 text-[9px] font-semibold text-[#7b8996]">Sumbawa Besar · Produk lokal</p>
            {[['Madu Hutan', 'Rp85.000'], ['Susu Kuda Liar', 'Rp65.000'], ['Permen Susu', 'Rp25.000']].map(([name, price]) => (
              <div key={name} className="mt-2 flex items-center gap-2 rounded-xl bg-[#f5f7f3] p-2.5 text-[10px] font-bold">
                <span className="min-w-0 flex-1">{name}</span>
                <span className="font-extrabold text-[#08745a]">{price}</span>
              </div>
            ))}
            <div className="mt-3 w-full rounded-xl bg-[#08745a] py-2.5 text-center text-[10px] font-extrabold text-white">Hubungi melalui WhatsApp</div>
          </>
        )}

        {kind === "cafe" && (
          <>
            <div className="relative overflow-hidden rounded-2xl">
              <img src="/storefront/discovery-coffee.webp" alt="" className="h-28 w-full object-cover" />
              <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-extrabold text-[#815523]">Buka sampai 22.00</span>
            </div>
            <h4 className="mt-3 text-[15px] font-extrabold">Kopi Ruang</h4>
            <p className="mt-1 text-[9px] font-semibold text-[#7b8996]">Kedai kopi · Sumbawa Besar</p>
            <p className="mt-4 text-[9px] font-extrabold uppercase tracking-wider text-[#966225]">Menu favorit</p>
            {[['Es Kopi Susu', 'Rp20.000'], ['Americano', 'Rp18.000'], ['Matcha', 'Rp25.000']].map(([name, price]) => (
              <p key={name} className="flex justify-between border-b border-[#eef0ec] py-2.5 text-[10px] font-semibold"><span>{name}</span><span>{price}</span></p>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[9px] font-extrabold">
              <span className="rounded-xl bg-[#eef4f0] py-2.5 text-[#08745a]">Petunjuk arah</span>
              <span className="rounded-xl bg-[#08745a] py-2.5 text-white">WhatsApp</span>
            </div>
          </>
        )}

        {kind === "service" && (
          <>
            <div className="rounded-2xl bg-[#113d35] p-4 text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"><HiBriefcase className="h-5 w-5" /></span>
              <h4 className="mt-3 text-[15px] font-extrabold">Sumbawa Interior</h4>
              <p className="mt-1 text-[9px] font-medium text-white/65">Interior · Renovasi · Sumbawa</p>
            </div>
            <p className="mt-4 text-[10px] font-extrabold">Layanan</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["Kitchen Set", "Plafon", "Partisi", "Renovasi"].map((item) => <span key={item} className="rounded-full bg-[#eef5f1] px-2.5 py-1.5 text-[9px] font-bold text-[#08745a]">{item}</span>)}
            </div>
            <div className="mt-4 overflow-hidden rounded-xl border border-[#e8ece8]">
              <img src="/storefront/store-cover.jpg" alt="" className="h-24 w-full object-cover" />
              <div className="p-3"><p className="text-[10px] font-extrabold">Renovasi dapur — Unter Iwes</p></div>
            </div>
            <div className="mt-3 w-full rounded-xl bg-[#08745a] py-2.5 text-center text-[10px] font-extrabold text-white">Konsultasi melalui WhatsApp</div>
          </>
        )}
      </div>
    </div>
  );
}

function FeatureList({ items, light = false }: { items: string[]; light?: boolean }) {
  return (
    <ul className={`mt-6 space-y-3 border-t pt-6 ${light ? "border-white/10" : "border-[#e5ece7]"}`}>
      {items.map((feature) => (
        <li key={feature} className={`flex items-start gap-3 text-[13px] font-semibold leading-5 ${light ? "text-white/75" : "text-[#53697d]"}`}>
          <HiCheck className={`mt-0.5 h-4 w-4 shrink-0 ${light ? "text-[#8de0bd]" : "text-[#08745a]"}`} />
          {feature}
        </li>
      ))}
    </ul>
  );
}

export default function CatalogPlansPage() {
  const { user, profile } = useAuth();
  const [activeKind, setActiveKind] = useState<BusinessKind>("shop");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const activeTab = businessTabs.find((tab) => tab.id === activeKind) ?? businessTabs[0];
  const canManageCatalog = profile?.plan === "PRO" || profile?.role === "ADMIN";
  const accountHref = canManageCatalog ? "/pro" : "/account";
  const accountLabel = canManageCatalog ? "Kelola Katalog" : "Akun Saya";

  useEffect(() => {
    const previousTitle = document.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = description?.content;

    document.title = "Buat Katalog Bisnis Online | CariKontak";
    if (description) {
      description.content = "Tampilkan produk, layanan, harga, lokasi, dan WhatsApp bisnismu dalam satu katalog online CariKontak.";
    }

    return () => {
      document.title = previousTitle;
      if (description && previousDescription) description.content = previousDescription;
    };
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[#fbfcf8] text-[#102a43] selection:bg-[#bfead8]">
      <header className="relative z-40 border-b border-[#e6ece8] bg-[#fbfcf8]/95 backdrop-blur lg:sticky lg:top-0">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" aria-label="Kembali ke beranda CariKontak"><BrandMark /></Link>
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigasi halaman katalog">
            <a href="#contoh" className="text-[13px] font-bold text-[#53697d] hover:text-[#08745a]">Contoh</a>
            <a href="#manfaat" className="text-[13px] font-bold text-[#53697d] hover:text-[#08745a]">Manfaat</a>
            <a href="#harga" className="text-[13px] font-bold text-[#53697d] hover:text-[#08745a]">Harga</a>
            <a href="#faq" className="text-[13px] font-bold text-[#53697d] hover:text-[#08745a]">Tanya Jawab</a>
          </nav>
          <div className="hidden items-center gap-3 sm:flex">
            {user ? (
              <Link to={accountHref} className="px-3 py-2 text-[13px] font-extrabold text-[#41586d] hover:text-[#08745a]">{accountLabel}</Link>
            ) : (
              <Link to="/login" className="px-3 py-2 text-[13px] font-extrabold text-[#41586d] hover:text-[#08745a]">Masuk</Link>
            )}
            <a href={activationMessage} target="_blank" rel="noreferrer" className="rounded-full bg-[#08745a] px-4 py-2.5 text-[12px] font-extrabold text-white shadow-sm transition hover:bg-[#075f4b]">Ajukan Katalog Pro</a>
          </div>
          <button
            type="button"
            onClick={() => setMobileMenu((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-full border border-[#dfe8e2] bg-white text-[#28485e] sm:hidden"
            aria-label={mobileMenu ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileMenu}
          >
            {mobileMenu ? <HiXMark className="h-5 w-5" /> : <HiBars3 className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenu && (
          <div className="border-t border-[#e6ece8] bg-white px-5 py-4 sm:hidden">
            <div className="grid gap-1">
              {[['#contoh', 'Contoh'], ['#manfaat', 'Manfaat'], ['#harga', 'Harga'], ['#faq', 'Tanya Jawab']].map(([href, label]) => (
                <a key={href} href={href} onClick={() => setMobileMenu(false)} className="rounded-xl px-3 py-2.5 text-sm font-bold text-[#41586d]">{label}</a>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to={user ? accountHref : "/login"} className="rounded-full border border-[#dce6e0] px-4 py-3 text-center text-xs font-extrabold">{user ? accountLabel : "Masuk"}</Link>
                <a href={activationMessage} target="_blank" rel="noreferrer" className="rounded-full bg-[#08745a] px-4 py-3 text-center text-xs font-extrabold text-white">Ajukan Pro</a>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(190,235,216,.75),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(255,227,163,.5),transparent_25%)]" />
          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_.95fr] lg:px-10 lg:py-20">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#cbe5d8] bg-white/75 px-3.5 py-2 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#08745a] shadow-sm">
                <HiSparkles className="h-4 w-4" /> Katalog bisnis CariKontak
              </span>
              <h1 className="mt-6 text-[42px] font-extrabold leading-[1.04] tracking-[-0.052em] text-[#102a43] sm:text-[62px] lg:text-[68px]">
                Satu halaman untuk produk, layanan, dan <span className="text-[#08745a]">kontak bisnismu.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[16px] font-medium leading-7 text-[#5e7184] sm:text-[18px] sm:leading-8">
                Tampilkan harga, foto, lokasi, dan WhatsApp dalam katalog yang mudah ditemukan dan dibagikan—agar pelanggan lebih cepat memahami bisnismu.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <PrimaryAction href={activationMessage}>Konsultasikan Katalog</PrimaryAction>
                <a href="#contoh" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#cfdcd5] bg-white px-5 py-3 text-[13px] font-extrabold text-[#294c5d] transition hover:border-[#8abca9] hover:text-[#08745a]">
                  Lihat Tampilannya <HiArrowRight className="h-4 w-4" />
                </a>
              </div>
              <p className="mt-4 text-[12px] font-semibold leading-5 text-[#6f8190]">
                Akun CariKontak gratis <span className="mx-1.5 text-[#bdc8c1]">·</span> Pro Rp29.000 per bulan atau Rp299.000 per tahun
              </p>
            </div>
            <HeroCards />
          </div>
        </section>

        <section id="contoh" className="scroll-mt-20 px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <Eyebrow>Disesuaikan dengan bisnismu</Eyebrow>
              <h2 className="mx-auto mt-4 max-w-3xl text-[34px] font-extrabold leading-[1.12] tracking-[-0.042em] sm:text-[48px]">
                Lihat bentuk katalog untuk jenis usaha yang berbeda.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] font-medium leading-7 text-[#66798b]">
                Pilih jenis usaha untuk melihat informasi yang bisa ditampilkan kepada pelanggan.
              </p>
            </div>
            <div className="mx-auto mt-9 flex max-w-2xl rounded-2xl bg-[#edf2ee] p-1.5" role="tablist" aria-label="Jenis bisnis">
              {businessTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveKind(tab.id)}
                  role="tab"
                  aria-selected={activeKind === tab.id}
                  className={`min-w-0 flex-1 rounded-xl px-2 py-3 text-[11px] font-extrabold leading-4 transition sm:px-4 sm:text-[12px] ${
                    activeKind === tab.id ? "bg-white text-[#08745a] shadow-sm" : "text-[#687b8c] hover:text-[#294c5d]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="mt-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-24">
              <div className="order-2 lg:order-1">
                <Eyebrow>{activeTab.kicker}</Eyebrow>
                <h3 className="mt-4 text-[30px] font-extrabold leading-[1.15] tracking-[-0.038em] sm:text-[40px]">{activeTab.title}</h3>
                <p className="mt-5 text-[15px] font-medium leading-7 text-[#66798b]">{activeTab.description}</p>
                <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[#dce8e1] bg-white p-4 shadow-sm">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#dff3ea] text-[#08745a]"><HiCheck className="h-5 w-5" /></span>
                  <p className="pt-2 text-[13px] font-extrabold text-[#284b5d]">{activeTab.value}</p>
                </div>
              </div>
              <div className="order-1 rounded-[32px] bg-[radial-gradient(circle_at_85%_15%,#fff0c7,transparent_30%),linear-gradient(145deg,#e2f2e9,#f4f5ef)] px-5 py-9 lg:order-2">
                <PhonePreview kind={activeKind} />
              </div>
            </div>
          </div>
        </section>

        <section id="manfaat" className="scroll-mt-20 border-y border-[#e5ece7] bg-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <Eyebrow>Informasi yang pelanggan butuhkan</Eyebrow>
              <h2 className="mt-4 text-[34px] font-extrabold leading-[1.12] tracking-[-0.042em] sm:text-[48px]">Bantu pelanggan yakin sebelum menghubungimu.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {benefits.map(({ icon: Icon, title, copy }, index) => (
                <article key={title} className="relative overflow-hidden rounded-[24px] border border-[#dfe8e2] bg-[#fbfcf8] p-6 sm:p-7">
                  <span className="absolute right-5 top-4 text-[32px] font-black text-[#dfe9e3]">0{index + 1}</span>
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dff3ea] text-[#08745a]"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-7 text-[18px] font-extrabold leading-6 tracking-[-0.025em]">{title}</h3>
                  <p className="mt-3 text-[13px] font-medium leading-6 text-[#687b8c]">{copy}</p>
                </article>
              ))}
            </div>
            <div className="mt-8 grid gap-4 rounded-[28px] bg-[#103d35] p-6 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
              <div>
                <div className="flex items-center gap-2 text-[#8de0bd]"><HiLink className="h-5 w-5" /><span className="text-[11px] font-extrabold uppercase tracking-[0.14em]">Satu tautan, banyak tempat</span></div>
                <h3 className="mt-3 text-[25px] font-extrabold leading-[1.2] tracking-[-0.035em]">Bagikan lewat WhatsApp, Instagram, Google, atau QR.</h3>
                <p className="mt-3 max-w-2xl text-[13px] font-medium leading-6 text-[#bfd4cd]">Pelanggan dapat membuka katalog langsung dari peramban tanpa memasang aplikasi.</p>
              </div>
              <div className="flex gap-2 text-[#8de0bd]" aria-hidden="true">
                {[HiChatBubbleLeftRight, HiMapPin, HiQrCode].map((Icon, index) => <span key={index} className="grid h-11 w-11 place-items-center rounded-xl bg-white/10"><Icon className="h-5 w-5" /></span>)}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div>
              <Eyebrow>Contoh yang bisa dibuka</Eyebrow>
              <h2 className="mt-4 text-[34px] font-extrabold leading-[1.12] tracking-[-0.042em] sm:text-[48px]">Lihat pengalaman pelanggan secara langsung.</h2>
              <p className="mt-5 text-[15px] font-medium leading-7 text-[#66798b]">Buka contoh katalog Toko Evi untuk melihat bagaimana produk, harga, dan kontak disusun dalam satu halaman.</p>
              <a href="/catalog?store=toko-evi" className="mt-7 inline-flex min-h-11 items-center gap-2 text-[13px] font-extrabold text-[#08745a]">Buka Contoh Katalog <HiArrowRight className="h-4 w-4" /></a>
            </div>
            <div className="overflow-hidden rounded-[28px] border border-[#dee7e1] bg-[#f6f4ed] shadow-[0_22px_55px_rgba(16,42,67,.1)]">
              <img src="/storefront/toko-evi-poster.jpg" alt="Tampilan katalog Toko Evi" className="h-72 w-full object-cover sm:h-96" />
              <div className="flex items-center justify-between bg-white p-5">
                <div><p className="text-[14px] font-extrabold">Toko Evi</p><p className="mt-1 text-[11px] font-semibold text-[#748592]">Oleh-oleh khas Sumbawa</p></div>
                <span className="rounded-full bg-[#e5f5ee] px-3 py-2 text-[10px] font-extrabold text-[#08745a]">KATALOG PRO</span>
              </div>
            </div>
          </div>
        </section>

        <section id="harga" className="scroll-mt-20 bg-[#eef5f1] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <Eyebrow>Empat pilihan paket</Eyebrow>
              <h2 className="mt-4 text-[34px] font-extrabold leading-[1.12] tracking-[-0.042em] sm:text-[48px]">Pilih sesuai tahap dan kebutuhan bisnismu.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-[14px] font-medium leading-7 text-[#66798b]">Paket Starter dan Business sedang disiapkan. Katalog yang dapat diaktifkan saat ini menggunakan paket Pro.</p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
              <article className="flex flex-col rounded-[26px] border border-[#dce6e0] bg-white p-6">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#08745a]">Gratis</p>
                <p className="mt-3 min-h-12 text-[13px] font-semibold leading-6 text-[#66798b]">Untuk memakai fitur dasar CariKontak.</p>
                <div className="mt-5 flex items-end gap-2"><strong className="text-[34px] font-extrabold tracking-[-0.04em]">Rp0</strong><span className="mb-1.5 text-[11px] font-bold text-[#718392]">selamanya</span></div>
                <FeatureList items={["Simpan kontak penting", "Tambahkan data usaha ke direktori", "Pantau status pengajuan"]} />
                <div className="mt-auto pt-7"><PrimaryAction href="/register">Buat Akun Gratis</PrimaryAction></div>
              </article>

              <article className="relative flex flex-col rounded-[26px] border border-[#dce6e0] bg-white p-6">
                <span className="absolute -top-3 left-5 rounded-full bg-[#e1e8e4] px-3 py-1.5 text-[9px] font-black tracking-[0.1em] text-[#53697d]">SEGERA HADIR</span>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#08745a]">Starter</p>
                <p className="mt-3 min-h-12 text-[13px] font-semibold leading-6 text-[#66798b]">Untuk katalog ringkas yang mudah dibagikan.</p>
                <div className="mt-5 flex items-end gap-2"><strong className="text-[34px] font-extrabold tracking-[-0.04em]">Rp99.000</strong><span className="mb-1.5 text-[11px] font-bold text-[#718392]">per tahun</span></div>
                <FeatureList items={["Katalog produk atau layanan", "QR untuk membuka katalog", "Kategori dan statistik dasar"]} />
                <div className="mt-auto pt-7"><PrimaryAction href={starterMessage}>Kabari Saat Tersedia</PrimaryAction></div>
              </article>

              <article className="relative flex flex-col rounded-[26px] bg-[#103d35] p-6 text-white shadow-[0_24px_55px_rgba(16,61,53,.2)]">
                <span className="absolute -top-3 left-5 rounded-full bg-[#ffe28a] px-3 py-1.5 text-[9px] font-black tracking-[0.1em] text-[#715300]">TERSEDIA SEKARANG</span>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#8de0bd]">Pro</p>
                <p className="mt-3 min-h-12 text-[13px] font-semibold leading-6 text-white/70">Untuk menampilkan dan mengelola katalog bisnis.</p>
                <div className="mt-5 flex items-end gap-2"><strong className="text-[34px] font-extrabold tracking-[-0.04em]">Rp29.000</strong><span className="mb-1.5 text-[11px] font-bold text-white/60">per bulan</span></div>
                <p className="mt-2 text-[11px] font-bold text-[#8de0bd]">atau Rp299.000 per tahun</p>
                <FeatureList light items={["Halaman katalog khusus", "Produk, layanan, harga, dan foto", "WhatsApp, lokasi, dan jam buka", "Kelola katalog melalui dasbor"]} />
                <div className="mt-auto pt-7"><PrimaryAction href={activationMessage} light>Ajukan Aktivasi Pro</PrimaryAction></div>
              </article>

              <article className="relative flex flex-col rounded-[26px] border border-[#d7c99f] bg-[#fffaf0] p-6">
                <span className="absolute -top-3 left-5 rounded-full bg-[#f4e8c1] px-3 py-1.5 text-[9px] font-black tracking-[0.1em] text-[#765e13]">DALAM PENGEMBANGAN</span>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#765e13]">Business</p>
                <p className="mt-3 min-h-12 text-[13px] font-semibold leading-6 text-[#6f654c]">Untuk kebutuhan bisnis yang lebih kompleks.</p>
                <div className="mt-5"><strong className="text-[29px] font-extrabold tracking-[-0.035em]">Hubungi kami</strong></div>
                <FeatureList items={["Cakupan disusun sesuai kebutuhan", "Kebutuhan tim atau cabang dibahas bersama", "Harga dikonfirmasi sebelum aktivasi"]} />
                <div className="mt-auto pt-7"><PrimaryAction href={businessMessage}>Diskusikan Kebutuhan</PrimaryAction></div>
              </article>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <Eyebrow>Proses aktivasi Pro</Eyebrow>
              <h2 className="mt-4 text-[34px] font-extrabold leading-[1.12] tracking-[-0.042em] sm:text-[48px]">Tiga langkah menuju katalog aktif.</h2>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { icon: HiChatBubbleLeftRight, title: "Ceritakan kebutuhanmu", copy: "Hubungi tim melalui WhatsApp dan pilih Katalog Pro." },
                { icon: HiBuildingStorefront, title: "Konfirmasi bisnis", copy: "Tim membantu memeriksa akun dan informasi bisnis yang akan ditampilkan." },
                { icon: HiCube, title: "Isi dan bagikan katalog", copy: "Setelah akun aktif, tambahkan produk atau layanan lalu bagikan tautannya." },
              ].map(({ icon: Icon, title, copy }, index) => (
                <article key={title} className="rounded-[24px] border border-[#dfe8e2] bg-white p-6 shadow-[0_10px_28px_rgba(16,42,67,.05)]">
                  <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#dff3ea] text-[#08745a]"><Icon className="h-5 w-5" /></span><span className="text-[11px] font-black tracking-[0.14em] text-[#a9b8af]">0{index + 1}</span></div>
                  <h3 className="mt-6 text-[17px] font-extrabold tracking-[-0.025em]">{title}</h3>
                  <p className="mt-3 text-[13px] font-medium leading-6 text-[#66798b]">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 border-y border-[#e5ece7] bg-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-14">
            <div>
              <Eyebrow>Pertanyaan umum</Eyebrow>
              <h2 className="mt-4 text-[34px] font-extrabold leading-[1.12] tracking-[-0.042em]">Hal penting sebelum memulai.</h2>
              <p className="mt-5 text-[13px] font-medium leading-6 text-[#718392]">Butuh jawaban yang lebih spesifik? Ceritakan kebutuhan bisnismu kepada tim kami.</p>
              <a href={activationMessage} target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 text-[13px] font-extrabold text-[#08745a]">Tanya melalui WhatsApp <HiArrowRight className="h-4 w-4" /></a>
            </div>
            <div className="divide-y divide-[#dfe8e2] border-y border-[#dfe8e2]">
              {faqs.map(([question, answer], index) => (
                <div key={question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="flex min-h-16 w-full items-center justify-between gap-5 py-4 text-left text-[14px] font-extrabold leading-5"
                    aria-expanded={openFaq === index}
                  >
                    <span>{question}</span>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eef5f1] text-[#08745a] transition ${openFaq === index ? "rotate-180" : ""}`}><HiChevronDown className="h-4 w-4" /></span>
                  </button>
                  {openFaq === index && <p className="max-w-2xl pb-5 pr-10 text-[13px] font-medium leading-6 text-[#66798b]">{answer}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-8 sm:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] bg-[radial-gradient(circle_at_85%_10%,#16745d,transparent_25%),linear-gradient(120deg,#082f29,#0d5745)] px-6 py-14 text-center text-white sm:px-10 lg:py-20">
            <Eyebrow light>Katalog bisnis CariKontak</Eyebrow>
            <h2 className="mx-auto mt-4 max-w-3xl text-[36px] font-extrabold leading-[1.1] tracking-[-0.045em] sm:text-[54px]">Buat bisnismu lebih mudah dipahami dan dihubungi.</h2>
            <p className="mx-auto mt-5 max-w-2xl text-[15px] font-medium leading-7 text-[#c2d9d1]">Ceritakan kebutuhanmu. Tim kami akan membantu proses aktivasi Katalog Pro.</p>
            <div className="mt-8"><PrimaryAction href={activationMessage} light>Konsultasikan Katalog</PrimaryAction></div>
            <p className="mt-5 text-[12px] font-semibold text-white/70">Pro Rp29.000 per bulan atau Rp299.000 per tahun · Aktivasi melalui WhatsApp</p>
          </div>
        </section>
      </main>

      <footer className="px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 border-t border-[#e1e9e4] pt-8 sm:flex-row">
          <Link to="/" aria-label="Kembali ke beranda"><BrandMark /></Link>
          <p className="text-center text-[11px] font-semibold leading-5 text-[#748592]">© {new Date().getFullYear()} CariKontak. Temukan, pahami, lalu hubungi.</p>
          <div className="flex gap-5 text-[11px] font-bold text-[#627686]"><Link to="/search">Cari Bisnis</Link><a href="#harga">Harga</a></div>
        </div>
      </footer>
    </div>
  );
}
