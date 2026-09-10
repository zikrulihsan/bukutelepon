import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowUpTray,
  HiCheckBadge,
  HiChevronRight,
  HiClock,
  HiMagnifyingGlass,
  HiMapPin,
  HiMinus,
  HiPlus,
  HiShoppingBag,
} from "react-icons/hi2";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { InquiryDrawer } from "../../features/storefront/InquiryDrawer";
import { trackStorefrontEvent, useInquiry } from "../../features/storefront/InquiryContext";
import { StorefrontImage } from "../../features/storefront/StorefrontImage";
import {
  formatPrice,
  type StorefrontItem,
} from "../../features/storefront/storefrontData";
import { usePublicStorefront } from "../../features/storefront/usePublicStorefront";

function ProductCard({ item, onOpen }: { item: StorefrontItem; onOpen: () => void }) {
  const { quantities, addItem, setQuantity } = useInquiry();
  const quantity = quantities[item.id] ?? 0;

  return (
    <article
      onClick={onOpen}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-[22px] border border-[#E8E2D5] bg-white shadow-[0_8px_24px_rgba(38,55,45,0.055)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(38,55,45,0.12)]"
    >
      <div className="relative aspect-[1.05] overflow-hidden bg-[#EDE8DE]">
        <StorefrontImage
          item={item}
          loading="lazy"
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${!item.available ? "grayscale-[35%]" : ""}`}
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {item.badge ? (
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-sm backdrop-blur ${
              item.badge === "Promo"
                ? "bg-[#A5482E] text-white"
                : item.badge === "Best Seller"
                  ? "bg-[#F6C85F] text-[#5B3B08]"
                  : "bg-white/90 text-[#2D5F49]"
            }`}>
              {item.badge}
            </span>
          ) : <span />}
          {!item.available && (
            <span className="rounded-full bg-[#24332C]/85 px-2.5 py-1 text-[10px] font-bold text-white">Habis</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <p className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#A6784F]">{item.category}</p>
        <h3 className="text-[14px] font-extrabold leading-snug text-[#1D382C] sm:text-base">{item.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#7B857E] sm:text-xs">{item.shortDescription}</p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="text-[12px] font-extrabold text-[#A45A22] sm:text-sm">{formatPrice(item)}</p>
          {item.available && (
            quantity > 0 ? (
              <div className="flex flex-none items-center rounded-full border border-[#C7D6CC] bg-[#F2F7F3] p-0.5" onClick={(event) => event.stopPropagation()}>
                <button onClick={() => setQuantity(item.id, quantity - 1)} className="grid h-7 w-7 place-items-center rounded-full text-[#245843] hover:bg-white" aria-label={`Kurangi ${item.name}`}>
                  <HiMinus className="h-3.5 w-3.5" />
                </button>
                <span className="w-5 text-center text-xs font-extrabold text-[#1F4A38]">{quantity}</span>
                <button onClick={() => addItem(item.id)} className="grid h-7 w-7 place-items-center rounded-full text-[#245843] hover:bg-white" aria-label={`Tambah ${item.name}`}>
                  <HiPlus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  addItem(item.id);
                }}
                className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[#245843] text-white shadow-sm transition hover:bg-[#173F2F] active:scale-90"
                aria-label={`Tambah ${item.name} ke daftar pilihan`}
              >
                <HiPlus className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </div>
    </article>
  );
}

export default function BusinessShowcasePage() {
  const navigate = useNavigate();
  const productsRef = useRef<HTMLElement>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const { business, items: storefrontItems, collections: storefrontCollections, isLoading, notFound, requestedSlug } = usePublicStorefront();
  const { totalCount, totalPrice, hasUnpriced, configureCatalog } = useInquiry();
  const categories = useMemo(() => ["Semua", ...new Set(storefrontItems.map((item) => item.category))], [storefrontItems]);

  useEffect(() => configureCatalog(storefrontItems, business), [business, configureCatalog, storefrontItems]);

  useEffect(() => {
    trackStorefrontEvent("profile_view");
  }, []);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id");
    const collection = storefrontCollections.find((entry) => entry.id === collectionId);
    return storefrontItems.filter((item) => {
      const matchesCategory = category === "Semua" || item.category === category;
      const matchesCollection = !collection || collection.itemIds.includes(item.id);
      const matchesSearch = !query || `${item.name} ${item.shortDescription} ${item.category}`.toLocaleLowerCase("id").includes(query);
      return matchesCategory && matchesCollection && matchesSearch;
    });
  }, [category, collectionId, search, storefrontCollections, storefrontItems]);

  function openItem(item: StorefrontItem) {
    trackStorefrontEvent("product_view", item.id);
    navigate(`/catalog/${item.slug}?store=${encodeURIComponent(business.slug)}`);
  }

  function chooseCollection(id: string) {
    setCollectionId((current) => current === id ? null : id);
    setCategory("Semua");
    window.setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }

  async function shareStore() {
    const payload = { title: business.name, text: `Lihat etalase ${business.name} di CariKontak`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(payload);
      else {
        await navigator.clipboard.writeText(window.location.href);
        setShared(true);
        window.setTimeout(() => setShared(false), 1800);
      }
    } catch {
      // The native share sheet may be dismissed by the user.
    }
  }

  const directWhatsapp = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(`Halo, saya melihat etalase ${business.name} di CariKontak.`)}`;

  if (isLoading && requestedSlug !== "toko-evi") {
    return <div className="min-h-screen animate-pulse bg-[#F4F0E7]" />;
  }

  if (notFound) {
    return <div className="grid min-h-screen place-items-center bg-[#F4F0E7] px-6 text-center"><div><h1 className="font-serif text-3xl font-black text-[#1D3C2F]">Etalase tidak ditemukan</h1><p className="mt-2 text-sm text-[#6E7A72]">Etalase ini belum diterbitkan atau alamatnya berubah.</p><button onClick={() => navigate("/catalog")} className="mt-5 rounded-full bg-[#245843] px-5 py-3 text-sm font-bold text-white">Lihat katalog utama</button></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#F4F0E7] text-[#19362A] selection:bg-[#DDE9DF]">
      <header className="relative mx-auto h-[270px] max-w-[1280px] overflow-hidden bg-[#203C2E] sm:h-[340px] lg:mt-5 lg:rounded-[32px]">
        <img src={business.cover} alt={`Etalase ${business.name}`} className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#10251A]/65 via-transparent to-[#10251A]/65" />
        <div className="absolute inset-x-0 top-0 mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-7 sm:py-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 rounded-full border border-white/25 bg-[#142A20]/55 px-3 py-2 text-white shadow-sm backdrop-blur-md transition hover:bg-[#142A20]/75">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-white text-[10px] font-black text-[#245843]">CK</span>
            <span className="text-xs font-extrabold tracking-tight">CariKontak</span>
          </button>
          <button onClick={shareStore} className="grid h-10 w-10 place-items-center rounded-full border border-white/25 bg-[#142A20]/55 text-white backdrop-blur-md transition hover:bg-[#142A20]/75" aria-label="Bagikan etalase">
            <HiArrowUpTray className="h-5 w-5" />
          </button>
        </div>
        {shared && <div className="absolute right-4 top-16 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#245843] shadow-xl sm:right-7 sm:top-20">Link tersalin</div>}
      </header>

      <main className="relative mx-auto -mt-16 max-w-6xl px-3 pb-36 sm:-mt-20 sm:px-6 lg:px-8">
        <section className="rounded-[28px] border border-white/70 bg-[#FFFEFA] px-5 pb-6 pt-5 shadow-[0_20px_60px_rgba(41,58,47,0.12)] sm:px-8 sm:pb-8">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="grid h-[72px] w-[72px] flex-none place-items-center overflow-hidden rounded-[22px] border-4 border-white bg-[#245843] shadow-[0_8px_25px_rgba(36,88,67,0.24)] sm:h-24 sm:w-24 sm:rounded-[28px]">
              {business.logo ? <img src={business.logo} alt={`Logo ${business.name}`} className="h-full w-full object-cover" /> : <div className="text-center text-white"><span className="block font-serif text-[22px] font-black leading-none sm:text-3xl">{business.name.trim().split(/\s+/).at(-1)?.slice(0, 3).toUpperCase()}</span><span className="mt-1 block text-[7px] font-bold uppercase tracking-[0.2em] text-[#E7C982] sm:text-[8px]">Pro</span></div>}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate font-serif text-[25px] font-black leading-tight tracking-[-0.02em] text-[#173C2C] sm:text-4xl">{business.name}</h1>
                <HiCheckBadge className="h-5 w-5 flex-none text-[#2B7A5A] sm:h-6 sm:w-6" title="Informasi bisnis dari pemilik" />
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-[#68756D] sm:text-xs">
                <span className="flex items-center gap-1 text-[#7A6339]"><span className="h-1.5 w-1.5 rounded-full bg-[#D5A441]" /> Jam buka via WhatsApp</span>
                <span className="hidden sm:inline">Etalase bisnis terverifikasi</span>
              </div>
            </div>
          </div>

          <p className="mt-5 max-w-2xl text-[13px] leading-6 text-[#66736B] sm:ml-[116px] sm:mt-[-26px] sm:text-sm">{business.description}</p>

          <div className="mt-5 grid grid-cols-[1fr_auto_auto] gap-2 sm:ml-[116px] sm:max-w-md">
            <a
              href={directWhatsapp}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackStorefrontEvent("whatsapp_click")}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#167C52] px-4 text-sm font-extrabold text-white shadow-[0_8px_22px_rgba(22,124,82,0.22)] transition hover:bg-[#116642] active:scale-[0.98]"
            >
              <FaWhatsapp className="h-[19px] w-[19px]" /> WhatsApp
            </a>
            {business.instagram && <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noreferrer" className="grid h-12 w-12 place-items-center rounded-full border border-[#DED9CD] bg-[#FAF7F1] text-[#875046] transition hover:bg-[#F1EAE1]" aria-label="Instagram"><FaInstagram className="h-5 w-5" /></a>}
            <a href={business.mapsUrl} target="_blank" rel="noreferrer" className="grid h-12 w-12 place-items-center rounded-full border border-[#DED9CD] bg-[#FAF7F1] text-[#5D705F] transition hover:bg-[#EDF3ED]" aria-label="Lihat peta">
              <HiMapPin className="h-5 w-5" />
            </a>
          </div>

          <p className="mt-3 text-[11px] text-[#78837C] sm:ml-[116px]">
            WA utama: <a href={`https://wa.me/${business.whatsapp}`} target="_blank" rel="noreferrer" className="font-extrabold text-[#246248] hover:underline">{business.whatsappDisplay}</a>
            {business.whatsappSecondary && <><span className="mx-1.5 text-[#C4BDB1]">•</span>Alternatif: <a href={`https://wa.me/${business.whatsappSecondary}`} target="_blank" rel="noreferrer" className="font-extrabold text-[#246248] hover:underline">{business.whatsappSecondaryDisplay}</a></>}
          </p>

          <div className="mt-5 grid gap-2 border-t border-[#EEE9DE] pt-4 text-[11px] font-semibold text-[#66736B] sm:ml-[116px] sm:grid-cols-2 sm:text-xs">
            <p className="flex items-center gap-2"><HiClock className="h-4 w-4 text-[#8C6848]" /> {business.openingHours}</p>
            <p className="flex items-center gap-2"><HiMapPin className="h-4 w-4 text-[#8C6848]" /> {business.address}</p>
          </div>
        </section>

        <section className="mt-5 overflow-hidden rounded-[26px] border border-[#E5DED1] bg-[#FFFEFA] shadow-[0_10px_30px_rgba(38,55,45,0.07)] sm:grid sm:grid-cols-[0.9fr_1.1fr]">
          <div className="h-48 overflow-hidden bg-[#F6E9D4] sm:h-64">
            <img src={business.poster} alt={`Foto resmi ${business.name}`} className="h-full w-full object-cover object-top" />
          </div>
          <div className="flex flex-col justify-center p-5 sm:p-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A36B3F]">Etalase resmi pemilik</p>
            <h2 className="mt-2 font-serif text-2xl font-black leading-tight text-[#193B2D]">Kenali pilihan dari {business.name}.</h2>
            <p className="mt-3 text-xs leading-5 text-[#6E7A72]">Temukan produk terbaru dan hubungi penjual langsung melalui kanal resminya.</p>
            {business.instagram && <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#D7CFC1] px-4 py-2.5 text-xs font-extrabold text-[#7C4A42] transition hover:bg-[#F6EEE8]"><FaInstagram className="h-4 w-4" /> @{business.instagram}</a>}
          </div>
        </section>

        <section className="mt-10 sm:mt-14">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A36B3F]">Bantu saya memilih</p>
              <h2 className="mt-1 font-serif text-[25px] font-black tracking-tight text-[#193B2D] sm:text-3xl">Belanja sesuai kebutuhan</h2>
            </div>
            {collectionId && <button onClick={() => setCollectionId(null)} className="text-xs font-bold text-[#47705D] underline underline-offset-4">Reset</button>}
          </div>
          <div className="scrollbar-hide -mx-3 flex snap-x gap-3 overflow-x-auto px-3 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {storefrontCollections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => chooseCollection(collection.id)}
                className={`group relative h-44 w-[78vw] max-w-[320px] flex-none snap-start overflow-hidden rounded-[24px] text-left shadow-[0_8px_22px_rgba(36,51,43,0.09)] transition sm:h-48 sm:w-auto sm:max-w-none ${collectionId === collection.id ? "ring-4 ring-[#2D694F]/20" : "hover:-translate-y-1"}`}
              >
                <img src={collection.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#172C22]/95 via-[#172C22]/30 to-transparent" />
                <span className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#254F3E] shadow-sm"><HiChevronRight className="h-4 w-4" /></span>
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="font-serif text-xl font-black">{collection.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-white/75">{collection.description}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section ref={productsRef} className="scroll-mt-5 mt-11 sm:mt-16">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#A36B3F]">Etalase</p>
              <h2 className="mt-1 font-serif text-[27px] font-black tracking-tight text-[#193B2D] sm:text-3xl">Temukan favoritmu</h2>
              <p className="mt-1 text-xs text-[#7B867F]">{filteredItems.length} pilihan tersedia untuk dilihat</p>
            </div>
            <label className="flex h-12 w-full items-center gap-2.5 rounded-full border border-[#DED8CB] bg-[#FFFEFA] px-4 shadow-sm focus-within:border-[#739380] focus-within:ring-4 focus-within:ring-[#72927F]/10 lg:w-[330px]">
              <HiMagnifyingGlass className="h-[18px] w-[18px] flex-none text-[#7B887F]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari madu, susu, camilan..." className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[#294337] outline-none placeholder:text-[#A3A8A3]" />
            </label>
          </div>

          <div className="scrollbar-hide -mx-3 mb-5 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
            {categories.map((entry) => (
              <button
                key={entry}
                onClick={() => {
                  setCategory(entry);
                  setCollectionId(null);
                }}
                className={`flex-none rounded-full border px-4 py-2 text-xs font-bold transition ${category === entry && !collectionId ? "border-[#245843] bg-[#245843] text-white shadow-sm" : "border-[#DDD7CA] bg-[#FFFEFA] text-[#66736B] hover:border-[#9BAFA1]"}`}
              >
                {entry}
              </button>
            ))}
          </div>

          {collectionId && (
            <div className="mb-5 flex items-center justify-between rounded-2xl border border-[#D8E2D9] bg-[#EBF2EC] px-4 py-3 text-xs text-[#37614D]">
              <span>Menampilkan koleksi <b>{storefrontCollections.find((entry) => entry.id === collectionId)?.title}</b></span>
              <button onClick={() => setCollectionId(null)} className="font-extrabold">Lihat semua</button>
            </div>
          )}

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {filteredItems.map((item) => <ProductCard key={item.id} item={item} onOpen={() => openItem(item)} />)}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-[#D7D1C4] bg-[#FFFEFA]/60 px-6 py-16 text-center">
              <HiMagnifyingGlass className="mx-auto h-8 w-8 text-[#9CA69E]" />
              <p className="mt-3 font-bold text-[#395247]">Belum ada produk yang cocok</p>
              <button onClick={() => { setSearch(""); setCategory("Semua"); setCollectionId(null); }} className="mt-2 text-sm font-bold text-[#A15A2B] underline underline-offset-4">Lihat semua produk</button>
            </div>
          )}
        </section>

        <footer className="mt-16 border-t border-[#DDD6C8] py-8 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#9A8C7B]">Etalase didukung oleh</p>
          <button onClick={() => navigate("/")} className="mt-2 font-serif text-lg font-black text-[#254F3D]">CariKontak</button>
          <p className="mt-1 text-[11px] text-[#8C948E]">Temukan. Pilih. Hubungi.</p>
        </footer>
      </main>

      {totalCount > 0 && !drawerOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(12px+env(safe-area-inset-bottom))] sm:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-[20px] border border-white/15 bg-[#193D2E] px-4 py-3.5 text-left text-white shadow-[0_16px_38px_rgba(20,45,34,0.32)] transition hover:bg-[#123326] active:scale-[0.99]"
          >
            <span className="relative grid h-10 w-10 flex-none place-items-center rounded-full bg-white/12">
              <HiShoppingBag className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#F1C767] px-1 text-[10px] font-black text-[#573B0C]">{totalCount}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-extrabold">Lihat daftar pilihan</span>
              <span className="block text-[10px] text-white/65">Kirim dan tanyakan ketersediaan via WhatsApp</span>
            </span>
            <span className="text-right text-xs font-bold text-[#F0D89D]">
              {hasUnpriced
                ? "Tanya harga"
                : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalPrice)}
            </span>
            <HiChevronRight className="h-4 w-4 flex-none text-white/60" />
          </button>
        </div>
      )}

      <InquiryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
