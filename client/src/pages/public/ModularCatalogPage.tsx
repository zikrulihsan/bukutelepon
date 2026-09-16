import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  HiArrowUpTray,
  HiCheckBadge,
  HiChevronRight,
  HiClock,
  HiMapPin,
  HiMinus,
  HiPlus,
  HiShoppingBag,
  HiSparkles,
} from "react-icons/hi2";
import { FaInstagram, FaWhatsapp } from "react-icons/fa";
import { BrandLogo } from "../../components/shared/BrandLogo";
import { BrandLoadingScreen } from "../../components/shared/BrandLoadingScreen";
import { InquiryDrawer } from "../../features/storefront/InquiryDrawer";
import { trackStorefrontEvent, useInquiry } from "../../features/storefront/InquiryContext";
import { catalogDemos, type CatalogDemoKey } from "../../features/storefront/modularCatalogDemo";
import { catalogThemeStyle } from "../../features/storefront/catalogThemes";
import { StorefrontImage } from "../../features/storefront/StorefrontImage";
import {
  formatPrice,
  itemSupportsQuantity,
  type StorefrontBusiness,
  type StorefrontItem,
  type StorefrontSection,
} from "../../features/storefront/storefrontData";
import { usePublicStorefront } from "../../features/storefront/usePublicStorefront";

const presetLabels: Record<StorefrontBusiness["catalogPreset"], string> = {
  restaurant: "Menu & pengalaman",
  service: "Layanan profesional",
  retail: "Produk pilihan",
  activity: "Aktivitas & jadwal",
};

function ItemRow({ item, onOpen }: { item: StorefrontItem; onOpen: () => void }) {
  const { quantities, addItem, setQuantity } = useInquiry();
  const quantity = quantities[item.id] ?? 0;
  const canAdd = itemSupportsQuantity(item);

  return (
    <article onClick={onOpen} className="catalog-item group grid cursor-pointer grid-cols-[68px_1fr_auto] items-center gap-3 border p-2 transition-colors hover:border-[var(--catalog-accent)] sm:grid-cols-[82px_1fr_auto] sm:p-2.5">
      <div className="relative h-[68px] overflow-hidden rounded-xl bg-[var(--catalog-surface-alt)] sm:h-[78px]">
        <StorefrontImage item={item} className="h-full w-full object-cover" />
        {item.badge && <span className="absolute left-1.5 top-1.5 rounded-full bg-[var(--catalog-accent)] px-2 py-1 text-[8px] font-black text-[var(--catalog-accent-text)]">{item.badge}</span>}
      </div>
      <div className="min-w-0 py-1">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--catalog-accent)]">{item.category}</p>
        <h3 className="catalog-heading mt-1 text-[13px] font-bold leading-tight text-[var(--catalog-text)] sm:text-[15px]">{item.name}</h3>
        {item.shortDescription && <p className="mt-1 line-clamp-1 text-[10px] text-[var(--catalog-muted)] sm:text-xs">{item.shortDescription}</p>}
        <p className="mt-2 text-[11px] font-bold text-[var(--catalog-accent)] sm:text-xs">{formatPrice(item)}</p>
      </div>
      <div className="pr-1" onClick={(event) => event.stopPropagation()}>
        {!item.available ? <span className="text-[9px] font-bold text-[#8B918D]">Tidak tersedia</span> : canAdd && quantity > 0 ? (
          <div className="flex items-center rounded-full border border-[var(--catalog-border)] bg-[var(--catalog-soft)] p-0.5">
            <button type="button" onClick={() => setQuantity(item.id, quantity - 1)} className="grid h-7 w-7 place-items-center rounded-full text-[var(--catalog-accent)]"><HiMinus className="h-3.5 w-3.5" /></button>
            <span className="w-5 text-center text-xs font-black">{quantity}</span>
            <button type="button" onClick={() => addItem(item.id)} className="grid h-7 w-7 place-items-center rounded-full text-[var(--catalog-accent)]"><HiPlus className="h-3.5 w-3.5" /></button>
          </div>
        ) : canAdd ? (
          <button type="button" onClick={() => addItem(item.id)} className="grid h-9 w-9 place-items-center rounded-full bg-[var(--catalog-accent)] text-[var(--catalog-accent-text)] shadow-sm"><HiPlus className="h-4 w-4" /></button>
        ) : <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--catalog-soft)] text-[var(--catalog-accent)]"><HiChevronRight className="h-4 w-4" /></span>}
      </div>
    </article>
  );
}

function ItemCard({ item, onOpen }: { item: StorefrontItem; onOpen: () => void }) {
  const { quantities, addItem } = useInquiry();
  const selected = (quantities[item.id] ?? 0) > 0;
  return (
    <article onClick={onOpen} className="catalog-item group cursor-pointer overflow-hidden border transition-colors hover:border-[var(--catalog-accent)]">
      <div className="relative aspect-[1.35] overflow-hidden bg-[var(--catalog-surface-alt)]"><StorefrontImage item={item} className="h-full w-full object-cover" />{item.badge && <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[8px] font-extrabold text-[var(--catalog-accent)] shadow-sm">{item.badge}</span>}</div>
      <div className="p-3.5">
        <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--catalog-accent)]">{item.category}</p>
        <h3 className="catalog-heading mt-1 text-sm font-bold text-[var(--catalog-text)]">{item.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-8 text-[10px] leading-4 text-[var(--catalog-muted)]">{item.shortDescription}</p>
        <div className="mt-3 flex items-center justify-between gap-2"><p className="text-[11px] font-extrabold text-[var(--catalog-accent)]">{formatPrice(item)}</p>{item.available && itemSupportsQuantity(item) && <button type="button" onClick={(event) => { event.stopPropagation(); addItem(item.id); }} className={`grid h-8 w-8 place-items-center rounded-full ${selected ? "bg-[var(--catalog-soft)] text-[var(--catalog-accent)]" : "bg-[var(--catalog-accent)] text-[var(--catalog-accent-text)]"}`}>{selected ? "✓" : <HiPlus className="h-4 w-4" />}</button>}</div>
      </div>
    </article>
  );
}

export default function ModularCatalogPage() {
  const { exampleType } = useParams<{ exampleType?: string }>();
  const [searchParams] = useSearchParams();
  const managedMode = searchParams.has("store");
  const remote = usePublicStorefront(managedMode);
  const demoKey: CatalogDemoKey = exampleType && exampleType in catalogDemos ? exampleType as CatalogDemoKey : "restoran";
  const demo = catalogDemos[demoKey];
  const business = managedMode ? remote.business : demo.business;
  const items = managedMode ? remote.items : demo.items;
  const sections = managedMode ? remote.sections : demo.sections;
  const { configureCatalog, totalCount, totalPrice, hasUnpriced, addItem } = useInquiry();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StorefrontItem | null>(null);
  const [shared, setShared] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const groupSections = useMemo(() => sections.filter((section) => section.type === "item_group"), [sections]);

  useEffect(() => configureCatalog(items, business), [business, configureCatalog, items]);
  useEffect(() => { trackStorefrontEvent("profile_view"); }, []);

  async function shareCatalog() {
    const payload = { title: business.name, text: `Lihat katalog ${business.name} di CariKontak`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(payload);
      else { await navigator.clipboard.writeText(window.location.href); setShared(true); window.setTimeout(() => setShared(false), 1600); }
    } catch { /* Native share can be dismissed. */ }
  }

  function goToSection(id: string) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openSectionAction(section: StorefrontSection) {
    if (section.ctaUrl) window.open(section.ctaUrl, "_blank", "noopener,noreferrer");
    else if (section.type === "promotion" && groupSections[0]) goToSection(groupSections[0].id);
    else window.open(`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(`Halo, saya tertarik dengan ${section.title} di ${business.name}.`)}`, "_blank", "noopener,noreferrer");
  }

  if (managedMode && remote.isLoading) return <BrandLoadingScreen label="Memuat katalog..." />;
  if (managedMode && remote.notFound) return <div className="grid min-h-screen place-items-center bg-[#F4F0E7] px-6 text-center"><div><h1 className="font-serif text-3xl font-black text-[#1D3C2F]">Katalog tidak ditemukan</h1><p className="mt-2 text-sm text-[#6E7A72]">Katalog belum diterbitkan atau alamatnya berubah.</p></div></div>;

  const directWhatsapp = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(`Halo, saya melihat katalog ${business.name} di CariKontak.`)}`;

  return (
    <div id="catalog-theme-page" data-catalog-theme={business.catalogTheme} style={catalogThemeStyle(business)} className="min-h-screen bg-[var(--catalog-bg)] pb-32 text-[var(--catalog-text)] transition-colors duration-300">
      <style>{`
        #catalog-theme-page .catalog-heading { font-family: var(--catalog-heading-font); }
        #catalog-theme-page .catalog-surface { background: var(--catalog-surface); border-color: var(--catalog-border); border-radius: var(--catalog-radius-lg); box-shadow: var(--catalog-shadow); }
        #catalog-theme-page .catalog-item { background: var(--catalog-surface); border-color: var(--catalog-border); border-radius: var(--catalog-radius-md); box-shadow: 0 2px 8px rgba(16,46,70,.045); }
      `}</style>
      {!managedMode && <nav className="sticky top-0 z-50 border-b border-[var(--catalog-border)] bg-white/95 px-3 py-2 backdrop-blur" aria-label="Contoh katalog"><div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto scrollbar-hide"><span className="mr-2 flex-none text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#8994A6]">Contoh</span>{(["ramya", "restoran", "jasa", "retail", "aktivitas"] as CatalogDemoKey[]).map((key) => <Link key={key} to={`/katalog/${key}`} className={`flex-none rounded-xl px-3 py-2 text-[11px] font-bold capitalize transition ${demoKey === key ? "bg-[var(--catalog-soft)] text-[var(--catalog-accent)]" : "text-[#66758C] hover:bg-[#F2F5F3]"}`}>{key}</Link>)}</div></nav>}
      <header className="relative mx-auto h-[250px] max-w-[1180px] overflow-hidden bg-[var(--catalog-dark)] lg:mt-5 lg:h-[300px] lg:rounded-[var(--catalog-radius-lg)]">
        <img src={business.cover} alt={`Sampul ${business.name}`} className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "var(--catalog-hero-gradient)" }} />
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-7">
          <a href="/" className="flex items-center gap-2 rounded-xl border border-white/25 bg-[#08234B]/70 px-3 py-2 text-xs font-bold text-white backdrop-blur"><span className="grid h-7 w-7 place-items-center rounded-full bg-white"><BrandLogo decorative className="h-6 w-6" /></span>CariKontak</a>
          <button type="button" onClick={shareCatalog} className="grid h-10 w-10 place-items-center rounded-xl border border-white/25 bg-[#08234B]/70 text-white backdrop-blur" aria-label="Bagikan katalog"><HiArrowUpTray className="h-5 w-5" /></button>
        </div>
        {shared && <span className="absolute right-4 top-16 rounded-full bg-[var(--catalog-surface)] px-3 py-2 text-xs font-bold text-[var(--catalog-accent)] shadow-xl sm:right-7 sm:top-20">Link tersalin</span>}
      </header>

      <main className="relative mx-auto -mt-12 max-w-6xl px-3 sm:px-6 lg:px-8">
        <section className="catalog-surface border p-5 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="grid h-[72px] w-[72px] flex-none place-items-center overflow-hidden rounded-2xl border border-[var(--catalog-border)] bg-[var(--catalog-accent)] sm:h-20 sm:w-20">
              {business.logo ? <img src={business.logo} alt="" className="h-full w-full object-cover" /> : <span className="catalog-heading text-2xl font-black text-[var(--catalog-accent-text)]">{business.name.split(" ").map((word) => word[0]).join("").slice(0, 2)}</span>}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--catalog-accent)]">{presetLabels[business.catalogPreset]}</p>
              <div className="mt-1 flex items-start gap-1.5"><h1 className="catalog-heading text-[25px] font-extrabold leading-tight tracking-[-0.045em] text-[var(--catalog-text)] sm:text-4xl">{business.name}</h1><HiCheckBadge className="mt-1 h-5 w-5 flex-none text-[var(--catalog-accent)]" /></div>
              <p className="mt-2 hidden max-w-2xl text-sm leading-6 text-[var(--catalog-muted)] sm:block">{business.description}</p>
            </div>
          </div>
          <p className="mt-4 text-[13px] leading-6 text-[var(--catalog-muted)] sm:hidden">{business.description}</p>
          <div className="mt-5 grid grid-cols-[1fr_auto_auto] gap-2 sm:ml-24 sm:max-w-md">
            <a href={directWhatsapp} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--catalog-accent)] px-4 text-sm font-bold text-[var(--catalog-accent-text)] shadow-[0_3px_8px_rgba(16,46,70,.10)]"><FaWhatsapp className="h-5 w-5" /> WhatsApp</a>
            {business.instagram && <a href={`https://instagram.com/${business.instagram}`} target="_blank" rel="noreferrer" className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--catalog-border)] bg-white text-[var(--catalog-accent)]" aria-label="Instagram"><FaInstagram className="h-5 w-5" /></a>}
            <a href={business.mapsUrl} target="_blank" rel="noreferrer" className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--catalog-border)] bg-white text-[var(--catalog-accent)]" aria-label="Lokasi"><HiMapPin className="h-5 w-5" /></a>
          </div>
          <div className="mt-5 grid gap-2 border-t border-[var(--catalog-border)] pt-4 text-[11px] font-medium text-[var(--catalog-muted)] sm:ml-24 sm:grid-cols-2 sm:text-xs"><p className="flex items-center gap-2"><HiClock className="h-4 w-4 text-[var(--catalog-accent)]" />{business.openingHours}</p><p className="flex items-center gap-2"><HiMapPin className="h-4 w-4 text-[var(--catalog-accent)]" />{business.address}</p></div>
        </section>

        {groupSections.length > 0 && (
          <section className="mt-8">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--catalog-muted)]">Jelajahi katalog</p>
            <div className="mt-3 flex snap-x gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
              {groupSections.map((section) => (
                <button key={section.id} type="button" onClick={() => goToSection(section.id)} className="catalog-surface flex h-[70px] w-[220px] flex-none snap-start items-center gap-3 border p-2 text-left transition-colors hover:border-[var(--catalog-accent)]">
                  <img src={section.image || business.cover} alt="" className="h-[52px] w-[52px] flex-none rounded-xl object-cover" />
                  <span className="min-w-0 flex-1"><strong className="catalog-heading block truncate text-sm font-bold text-[var(--catalog-text)]">{section.title}</strong><small className="mt-1 block truncate text-[10px] text-[var(--catalog-muted)]">{section.subtitle}</small></span>
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-xl bg-[var(--catalog-soft)] text-[var(--catalog-accent)]"><HiChevronRight className="h-4 w-4" /></span>
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-6 space-y-8">
          {sections.map((section) => {
            if (section.type === "promotion") return (
              <section key={section.id} style={{ background: "var(--catalog-promo-gradient)" }} className="relative overflow-hidden rounded-[var(--catalog-radius-lg)] border border-[var(--catalog-border)] p-5 text-[var(--catalog-text)] shadow-[0_3px_12px_rgba(16,46,70,.05)] sm:p-6">
                {section.image && <img src={section.image} alt="" className="absolute inset-y-0 right-0 h-full w-1/3 object-cover opacity-15" />}
                <div className="relative max-w-[72%]"><span className="inline-flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--catalog-accent)]"><HiSparkles className="h-4 w-4" />{section.badge || "Promosi"}</span><h2 className="catalog-heading mt-2 text-xl font-extrabold leading-tight tracking-[-0.04em] sm:text-2xl">{section.title}</h2>{section.subtitle && <p className="mt-2 text-xs font-medium leading-5 text-[var(--catalog-muted)] sm:text-sm">{section.subtitle}</p>}<button type="button" onClick={() => openSectionAction(section)} className="mt-4 rounded-xl bg-[var(--catalog-accent)] px-4 py-2.5 text-xs font-bold text-[var(--catalog-accent-text)]">{section.ctaLabel || "Lihat pilihan"}</button></div>
              </section>
            );

            if (section.type === "item_group") {
              const groupItems = items.filter((item) => item.category.toLocaleLowerCase("id") === section.category.toLocaleLowerCase("id"));
              return (
                <section key={section.id} ref={(node) => { sectionRefs.current[section.id] = node; }} className="scroll-mt-5">
                  <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--catalog-accent)]">{section.layout === "row" ? "Daftar pilihan" : "Pilihan visual"}</p><h2 className="catalog-heading mt-1 text-[24px] font-extrabold tracking-[-0.045em] text-[var(--catalog-text)]">{section.title}</h2>{section.subtitle && <p className="mt-1 text-xs text-[var(--catalog-muted)]">{section.subtitle}</p>}</div><span className="flex-none text-[10px] font-semibold text-[var(--catalog-muted)]">{groupItems.length} item</span></div>
                  {groupItems.length > 0 ? <div className={section.layout === "card" ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" : "grid gap-2.5 lg:grid-cols-2"}>{groupItems.map((item) => section.layout === "card" ? <ItemCard key={item.id} item={item} onOpen={() => setSelectedItem(item)} /> : <ItemRow key={item.id} item={item} onOpen={() => setSelectedItem(item)} />)}</div> : <div className="rounded-[var(--catalog-radius-md)] border border-dashed border-[var(--catalog-border)] bg-[var(--catalog-surface)] px-5 py-10 text-center text-xs text-[var(--catalog-muted)]">Belum ada item aktif di grup ini.</div>}
                </section>
              );
            }

            if (section.type === "activity") return (
              <section key={section.id} className="catalog-surface overflow-hidden border sm:grid sm:grid-cols-[0.72fr_1.28fr]">
                <div className="h-44 bg-[var(--catalog-surface-alt)] sm:h-full"><img src={section.image || business.cover} alt="" className="h-full w-full object-cover" /></div>
                <div className="p-5 sm:p-6"><span className="inline-flex rounded-lg bg-[var(--catalog-soft)] px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--catalog-accent)]">{section.badge || "Aktivitas"}</span><h2 className="catalog-heading mt-3 text-xl font-extrabold tracking-[-0.04em] text-[var(--catalog-text)]">{section.title}</h2><p className="mt-2 text-xs leading-5 text-[var(--catalog-muted)] sm:text-sm">{section.subtitle}</p>{section.scheduleLabel && <p className="mt-4 flex items-center gap-2 text-xs font-bold text-[var(--catalog-accent)]"><HiClock className="h-4 w-4" />{section.scheduleLabel}</p>}<button type="button" onClick={() => openSectionAction(section)} className="mt-5 rounded-xl bg-[var(--catalog-accent)] px-4 py-2.5 text-xs font-bold text-[var(--catalog-accent-text)]">{section.ctaLabel || "Tanya jadwal"}</button></div>
              </section>
            );

            return (
              <section key={section.id} className="rounded-[var(--catalog-radius-lg)] border border-[var(--catalog-border)] bg-[var(--catalog-highlight)] p-5 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-6"><div><span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--catalog-accent)]">{section.badge || "Informasi"}</span><h2 className="catalog-heading mt-2 text-lg font-extrabold tracking-[-0.035em] text-[var(--catalog-text)]">{section.title}</h2><p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--catalog-muted)] sm:text-sm">{section.subtitle}</p></div>{section.ctaLabel && <button type="button" onClick={() => openSectionAction(section)} className="mt-4 flex-none rounded-xl border border-[var(--catalog-border)] bg-[var(--catalog-surface)] px-4 py-2.5 text-xs font-bold text-[var(--catalog-accent)] sm:mt-0">{section.ctaLabel}</button>}</section>
            );
          })}
        </div>

        <footer className="mt-12 border-t border-[var(--catalog-border)] py-8 text-center"><p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[var(--catalog-muted)]">Katalog didukung oleh</p><a href="/" className="catalog-heading mt-2 block text-base font-extrabold text-[#08234B]">CariKontak</a></footer>
      </main>

      {totalCount > 0 && !drawerOpen && <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(12px+env(safe-area-inset-bottom))]"><button type="button" onClick={() => setDrawerOpen(true)} className="mx-auto flex w-full max-w-xl items-center gap-3 rounded-2xl bg-[#08234B] px-4 py-3 text-left text-white shadow-[0_8px_24px_rgba(8,35,75,.20)]"><span className="relative grid h-10 w-10 place-items-center rounded-xl bg-white/10"><HiShoppingBag className="h-5 w-5" /><span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--catalog-accent)] px-1 text-[10px] font-bold text-[var(--catalog-accent-text)]">{totalCount}</span></span><span className="min-w-0 flex-1"><strong className="block text-sm">Lihat daftar pilihan</strong><small className="block text-[10px] text-white/65">Kirim melalui WhatsApp</small></span><span className="text-xs font-bold text-white/80">{hasUnpriced ? "Tanya harga" : new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(totalPrice)}</span><HiChevronRight className="h-4 w-4" /></button></div>}

      {selectedItem && <div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#08234B]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true"><button type="button" onClick={() => setSelectedItem(null)} className="absolute inset-0" aria-label="Tutup detail" /><article className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[var(--catalog-radius-lg)] bg-[var(--catalog-surface)] p-5 shadow-[0_18px_50px_rgba(8,35,75,.18)] sm:rounded-[var(--catalog-radius-lg)] sm:p-6"><div className="aspect-[1.7] overflow-hidden rounded-[var(--catalog-radius-md)] bg-[var(--catalog-surface-alt)]"><StorefrontImage item={selectedItem} className="h-full w-full object-cover" /></div><p className="mt-5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--catalog-accent)]">{selectedItem.category}</p><h2 className="catalog-heading mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[var(--catalog-text)]">{selectedItem.name}</h2><p className="mt-2 text-sm leading-6 text-[var(--catalog-muted)]">{selectedItem.description || selectedItem.shortDescription}</p><p className="mt-4 text-sm font-extrabold text-[var(--catalog-accent)]">{formatPrice(selectedItem)}</p><div className="mt-5 flex gap-2"><button type="button" onClick={() => setSelectedItem(null)} className="rounded-xl border border-[var(--catalog-border)] px-4 py-3 text-sm font-bold text-[var(--catalog-muted)]">Tutup</button>{itemSupportsQuantity(selectedItem) ? <button type="button" disabled={!selectedItem.available} onClick={() => { addItem(selectedItem.id); setSelectedItem(null); }} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--catalog-accent)] px-4 py-3 text-sm font-bold text-[var(--catalog-accent-text)] disabled:opacity-40"><HiPlus className="h-4 w-4" /> Tambah pilihan</button> : <a href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(`Halo, saya tertarik dengan ${selectedItem.name}.`)}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--catalog-accent)] px-4 py-3 text-sm font-bold text-[var(--catalog-accent-text)]"><FaWhatsapp className="h-4 w-4" /> Tanya</a>}</div></article></div>}

      <InquiryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}
