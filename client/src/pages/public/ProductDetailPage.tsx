import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiArrowUpTray,
  HiCheck,
  HiChevronLeft,
  HiChevronRight,
  HiMinus,
  HiPlus,
  HiShoppingBag,
} from "react-icons/hi2";
import { FaWhatsapp } from "react-icons/fa";
import { InquiryDrawer } from "../../features/storefront/InquiryDrawer";
import { trackStorefrontEvent, useInquiry } from "../../features/storefront/InquiryContext";
import { StorefrontImage } from "../../features/storefront/StorefrontImage";
import { formatPrice } from "../../features/storefront/storefrontData";
import { usePublicStorefront } from "../../features/storefront/usePublicStorefront";

export default function ProductDetailPage() {
  const { itemSlug } = useParams();
  const navigate = useNavigate();
  const { business, items: storefrontItems, isLoading, notFound, requestedSlug } = usePublicStorefront();
  const item = storefrontItems.find((entry) => entry.slug === itemSlug);
  const [quantity, setQuantity] = useState(1);
  const [variant, setVariant] = useState(item?.variants[0] ?? "");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const { quantities, addItem, totalCount, configureCatalog } = useInquiry();

  useEffect(() => configureCatalog(storefrontItems, business), [business, configureCatalog, storefrontItems]);

  useEffect(() => {
    setVariant(item?.variants[0] ?? "");
  }, [item]);

  useEffect(() => {
    if (item) trackStorefrontEvent("product_view", item.id);
  }, [item]);

  if ((isLoading && requestedSlug !== "toko-evi") || (isLoading && !item)) {
    return <div className="min-h-screen animate-pulse bg-[#F4F0E7]" />;
  }

  if (notFound || !item) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F4F0E7] px-6 text-center">
        <div>
          <p className="font-serif text-3xl font-black text-[#1D3C2F]">Produk tidak ditemukan</p>
          <button onClick={() => navigate(`/catalog?store=${encodeURIComponent(business.slug)}`)} className="mt-4 rounded-full bg-[#245843] px-5 py-3 text-sm font-bold text-white">Kembali ke etalase</button>
        </div>
      </div>
    );
  }

  const product = item;

  const relatedItems = storefrontItems.filter((entry) => entry.id !== product.id && entry.category === product.category).slice(0, 3);
  const directMessage = [
    "Halo, saya melihat etalase Anda di CariKontak.",
    "",
    `Saya tertarik dengan ${quantity}x ${product.name}${variant ? ` (${variant})` : ""}.`,
    "Apakah produknya tersedia?",
  ].join("\n");

  function addSelected() {
    addItem(product.id, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  async function shareItem() {
    const payload = { title: product.name, text: `${product.name} dari ${business.name}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(payload);
      else await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Native share may be dismissed.
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F0E7] pb-32 text-[#19362A]">
      <div className="mx-auto max-w-6xl lg:px-8 lg:py-7">
        <div className="overflow-hidden bg-[#FFFEFA] lg:grid lg:min-h-[640px] lg:grid-cols-[1.05fr_0.95fr] lg:rounded-[32px] lg:border lg:border-[#E6DFD2] lg:shadow-[0_24px_70px_rgba(41,58,47,0.12)]">
          <div className="relative min-h-[420px] bg-[#E9E2D6] sm:min-h-[560px] lg:min-h-full">
            <StorefrontImage item={item} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/45 to-transparent px-4 pb-12 pt-4 sm:px-6 sm:pt-6">
              <button onClick={() => navigate(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-[#152A20]/45 text-white backdrop-blur-md transition hover:bg-[#152A20]/70" aria-label="Kembali">
                <HiChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                {totalCount > 0 && (
                  <button onClick={() => setDrawerOpen(true)} className="relative grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-[#152A20]/45 text-white backdrop-blur-md transition hover:bg-[#152A20]/70" aria-label="Daftar pilihan">
                    <HiShoppingBag className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#F2C965] px-1 text-[10px] font-black text-[#503708]">{totalCount}</span>
                  </button>
                )}
                <button onClick={shareItem} className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-[#152A20]/45 text-white backdrop-blur-md transition hover:bg-[#152A20]/70" aria-label="Bagikan produk">
                  <HiArrowUpTray className="h-5 w-5" />
                </button>
              </div>
            </div>
            {!item.available && <div className="absolute bottom-5 left-5 rounded-full bg-[#24332C]/90 px-4 py-2 text-xs font-bold text-white">Stok habis sementara</div>}
          </div>

          <section className="px-5 pb-8 pt-7 sm:px-8 lg:flex lg:flex-col lg:justify-center lg:px-12 lg:py-12">
            <button onClick={() => navigate(`/catalog?store=${encodeURIComponent(business.slug)}`)} className="mb-5 hidden items-center gap-2 text-xs font-bold text-[#78847D] transition hover:text-[#245843] lg:flex">
              <HiChevronLeft className="h-4 w-4" /> Kembali ke etalase
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A36B3F]">{item.category}</span>
              {item.badge && <span className="rounded-full bg-[#F4E1A7] px-2.5 py-1 text-[9px] font-extrabold text-[#71500C]">{item.badge}</span>}
            </div>
            <h1 className="mt-3 font-serif text-[33px] font-black leading-[1.1] tracking-[-0.025em] text-[#193B2D] sm:text-4xl lg:text-[42px]">{item.name}</h1>
            <p className="mt-3 text-xl font-black text-[#A25824]">{formatPrice(item)}</p>
            <p className="mt-5 text-[13px] leading-6 text-[#657269] sm:text-sm">{item.description}</p>

            {item.variants.length > 0 && (
              <div className="mt-7">
                <p className="text-xs font-extrabold text-[#2B4539]">Pilih varian</p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {item.variants.map((entry) => (
                    <button key={entry} onClick={() => setVariant(entry)} className={`rounded-full border px-4 py-2.5 text-xs font-bold transition ${variant === entry ? "border-[#245843] bg-[#E9F1EB] text-[#1E503A] ring-2 ring-[#245843]/10" : "border-[#DDD7CA] bg-white text-[#6C776F] hover:border-[#A4B2A8]"}`}>
                      {variant === entry && <HiCheck className="mr-1 inline h-3.5 w-3.5" />} {entry}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-[#E5DFD3] bg-[#E5DFD3]">
              {item.details.map((detail) => (
                <div key={detail.label} className="bg-[#FAF8F3] px-4 py-3.5">
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#9A8C7D]">{detail.label}</p>
                  <p className="mt-1 text-xs font-bold leading-snug text-[#334B3F]">{detail.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-3">
              <div className="flex h-12 items-center rounded-full border border-[#D9D3C7] bg-[#FAF8F3] p-1">
                <button onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-9 w-9 place-items-center rounded-full text-[#506158] hover:bg-white" aria-label="Kurangi jumlah"><HiMinus className="h-4 w-4" /></button>
                <span className="w-8 text-center text-sm font-extrabold">{quantity}</span>
                <button onClick={() => setQuantity((value) => value + 1)} className="grid h-9 w-9 place-items-center rounded-full text-[#506158] hover:bg-white" aria-label="Tambah jumlah"><HiPlus className="h-4 w-4" /></button>
              </div>
              <button disabled={!item.available} onClick={addSelected} className={`flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold transition active:scale-[0.98] ${item.available ? "bg-[#245843] text-white shadow-[0_9px_24px_rgba(36,88,67,0.22)] hover:bg-[#193F30]" : "cursor-not-allowed bg-[#DFDDD7] text-[#999B97]"}`}>
                {added ? <><HiCheck className="h-5 w-5" /> Ditambahkan</> : <><HiShoppingBag className="h-[18px] w-[18px]" /> Tambah ke pilihan</>}
              </button>
            </div>

            <a
              href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(directMessage)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackStorefrontEvent("whatsapp_click", item.id)}
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#1A8158] bg-white text-sm font-extrabold text-[#14724C] transition hover:bg-[#F0F7F2]"
            >
              <FaWhatsapp className="h-5 w-5" /> Tanya produk ini
            </a>
          </section>
        </div>

        {relatedItems.length > 0 && (
          <section className="px-4 py-12 sm:px-0 sm:py-14">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.19em] text-[#A36B3F]">Mungkin cocok juga</p>
                <h2 className="mt-1 font-serif text-2xl font-black text-[#193B2D]">Pilihan lainnya</h2>
              </div>
              <button onClick={() => navigate(`/catalog?store=${encodeURIComponent(business.slug)}`)} className="flex items-center gap-1 text-xs font-extrabold text-[#476B5A]">Lihat etalase <HiChevronRight className="h-4 w-4" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-5">
              {relatedItems.map((entry) => (
                <button key={entry.id} onClick={() => navigate(`/catalog/${entry.slug}?store=${encodeURIComponent(business.slug)}`)} className="overflow-hidden rounded-[18px] border border-[#E3DDCF] bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <StorefrontImage item={entry} loading="lazy" className="aspect-square w-full object-cover" />
                  <div className="p-2.5 sm:p-4">
                    <p className="line-clamp-2 text-[10px] font-extrabold leading-snug text-[#254235] sm:text-sm">{entry.name}</p>
                    <p className="mt-1 text-[9px] font-bold text-[#A45A22] sm:text-xs">{formatPrice(entry)}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {(quantities[item.id] ?? 0) > 0 && (
        <button onClick={() => setDrawerOpen(true)} className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-[#193D2E] px-4 py-3 text-xs font-extrabold text-white shadow-[0_14px_35px_rgba(20,45,34,0.3)] sm:bottom-6 sm:right-6">
          <HiShoppingBag className="h-5 w-5" /> Lihat {totalCount} pilihan
        </button>
      )}
      <InquiryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
