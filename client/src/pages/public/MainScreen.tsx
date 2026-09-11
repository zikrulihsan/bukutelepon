import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaWhatsapp } from "react-icons/fa";
import {
  HiBookmark,
  HiOutlineBookmark,
  HiOutlineBuildingOffice2,
  HiOutlineSquares2X2,
  HiOutlineUserGroup,
} from "react-icons/hi2";
import { apiClient } from "../../lib/axios";
import { useCity } from "../../context/CityContext";
import { useCategories } from "../../context/CategoriesContext";
import { useContacts } from "../../hooks/useContacts";
import { CityPickerOverlay } from "../../components/shared/CityPickerOverlay";
import { CategoryIcon } from "../../components/shared/CategoryIcon";
import { CategoryPhoto } from "../../components/shared/CategoryPhoto";
import { LanguageToggle } from "../../components/shared/LanguageToggle";
import { formatWhatsAppUrl } from "../../lib/phone";
import { isSaved, toggleSaved } from "../../lib/saved";
import { useI18n } from "../../i18n/LanguageContext";
import type { City, Contact } from "../../types";

const CATEGORY_FALLBACK = [
  { slug: "jasa", name: "Jasa" },
  { slug: "kuliner", name: "Kuliner" },
  { slug: "kesehatan", name: "Kesehatan" },
  { slug: "transportasi", name: "Otomotif" },
  { slug: "laundry", name: "Laundry" },
  { slug: "penginapan", name: "Penginapan" },
  { slug: "oleh-oleh", name: "Oleh-Oleh" },
  { slug: "lainnya", name: "Lainnya" },
];

function PinIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

function SearchIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path strokeLinecap="round" d="m16 16 4.25 4.25" /></svg>;
}

function ChatIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M20.5 11.4a8.3 8.3 0 0 1-8.6 8.1 9.8 9.8 0 0 1-3.6-.7L4 20l1.3-3.7a7.7 7.7 0 0 1-1.8-4.9 8.3 8.3 0 0 1 8.5-8.1 8.3 8.3 0 0 1 8.5 8.1Z" /><path d="M8.3 11.5h.1m3.5 0h.1m3.5 0h.1" strokeWidth="2.7" /></svg>;
}

function SirenIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true"><path d="M21 43V29.5C21 22.6 25.9 17 32 17s11 5.6 11 12.5V43" fill="#FF4A50" /><path d="M17 46.5h30M24 43h16" stroke="#D8242D" strokeWidth="4" strokeLinecap="round" /><path d="M32 9V3M48.3 15.7l4.2-4.2M15.7 15.7l-4.2-4.2M52 31h6M6 31h6" stroke="#FF4A50" strokeWidth="3" strokeLinecap="round" /><path d="M28 24.5c1.1-1.2 2.4-1.8 4-1.8" stroke="#FFADB0" strokeWidth="3" strokeLinecap="round" /></svg>;
}

function StoreIllustration() {
  return <div className="pointer-events-none absolute bottom-0 right-0 h-full w-[165px]" aria-hidden="true">
    <svg viewBox="0 0 330 190" className="absolute -bottom-0.5 -right-1 h-[93px] w-[161px]">
      <path d="M177 177h137" stroke="#55E39A" strokeWidth="5" strokeLinecap="round" opacity=".55" />
      <path d="M211 177V61c0-20 13-32 33-32h48c18 0 28 11 28 28v120" fill="#E7FFF1" stroke="#8FF0BA" strokeWidth="10" />
      <rect x="227" y="47" width="72" height="108" rx="8" fill="white" />
      <path d="M217 96h94l-8-29h-77l-9 29Z" fill="#B6F8CF" />
      <path d="M217 96c0 10 16 10 16 0 0 10 17 10 17 0 0 10 16 10 16 0 0 10 17 10 17 0 0 10 19 10 19 0" fill="#43D789" stroke="#20A969" strokeWidth="3" strokeLinejoin="round" />
      <rect x="238" y="108" width="53" height="46" rx="3" fill="#45D98C" />
      <rect x="257" y="123" width="16" height="31" rx="2" fill="#08785B" />
      <rect x="244" y="55" width="37" height="5" rx="2.5" fill="#A8EFC7" />
      <rect x="233" y="39" width="59" height="5" rx="2.5" fill="#A8EFC7" />
      <path d="m311 71 13-8m-11 20 16-1m-19 12 12 7" stroke="#D5F23E" strokeWidth="5" strokeLinecap="round" />
    </svg>
    <div className="absolute right-2.5 top-1.5 rounded-[9px] bg-white px-2 py-1 text-center text-[7px] font-extrabold leading-[9px] text-primary-700 shadow-sm">Lebih mudah<br />ditemukan!</div>
  </div>;
}

function BookmarkButton({ contactId, compact = false }: { contactId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(() => isSaved(contactId));
  return <button type="button" onClick={(event) => { event.stopPropagation(); setSaved(toggleSaved(contactId)); }} aria-label={saved ? "Hapus dari tersimpan" : "Simpan kontak"} className={`${compact ? "h-[22px] w-[22px]" : "h-6 w-6"} absolute right-1.5 top-1.5 grid place-items-center rounded-full bg-white/95 text-[#71809B] shadow-[0_2px_7px_rgba(9,36,71,0.14)] transition active:scale-90`}>
    {saved ? <HiBookmark className="h-3 w-3 text-primary-700" /> : <HiOutlineBookmark className="h-3 w-3" />}
  </button>;
}

function ContactImage({ contact, className = "" }: { contact: Contact; className?: string }) {
  return contact.imageUrl
    ? <img src={contact.imageUrl} alt={contact.name} className={`${className} object-cover`} />
    : <CategoryPhoto slug={contact.category?.slug} className={`${className} bg-gradient-to-br`} iconClassName="h-6 w-6" />;
}

function SectionHeading({ title, onMore }: { title: string; onMore?: () => void }) {
  return <div className="mb-1 flex h-[21px] items-center justify-between px-px">
    <h2 className="text-[16px] font-extrabold leading-5 tracking-[-0.055em] text-[#08234B]">{title}</h2>
    {onMore && <button type="button" onClick={onMore} className="inline-flex items-center gap-0.5 text-[12px] font-bold text-primary-700 transition active:scale-95">Lihat semua <ArrowIcon className="h-3 w-3" /></button>}
  </div>;
}

export default function MainScreen() {
  const navigate = useNavigate();
  const { citySlug, city, cities, setCity, setCities } = useCity();
  const { categories, isLoading: categoriesLoading } = useCategories();
  const { categoryName, t } = useI18n();
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [query, setQuery] = useState("");
  const { data: citiesData } = useQuery<{ success: boolean; data: City[] }>({ queryKey: ["cities"], queryFn: async () => (await apiClient.get("/cities")).data });

  useEffect(() => { if (citiesData?.data) setCities(citiesData.data); }, [citiesData, setCities]);
  const { data: contactsData, isLoading: contactsLoading } = useContacts({ city: citySlug || undefined, limit: 10 });
  const contacts = contactsData?.data ?? [];
  const displayCategories = categories.length ? categories.slice(0, 8).map((category) => ({ slug: category.slug, name: categoryName(category) })) : CATEGORY_FALLBACK;
  const totalContacts = contactsData?.meta?.total ?? contacts.length;
  const totalCategories = categories.length || displayCategories.length;
  const selectedCityName = city?.name ?? "Sumbawa Besar";
  const cityPickerVisible = showCityPicker || (!citySlug && (citiesData?.data?.length ?? cities.length) > 0);
  const goToSearch = (keyword = query) => { const value = keyword.trim(); navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/search"); };
  const chooseCity = (nextCity: City) => { setCity(nextCity); setShowCityPicker(false); };

  return <div className="min-h-screen bg-[radial-gradient(circle_at_30%_8%,rgba(226,241,231,.62),transparent_26%),#F8FAF7] pb-[72px] text-[#08234B]">
    {cityPickerVisible && <CityPickerOverlay cities={citiesData?.data ?? cities} onSelect={chooseCity} onClose={citySlug ? () => setShowCityPicker(false) : undefined} />}
    <div className="mx-auto max-w-[425px] overflow-hidden px-5 pt-3 sm:shadow-[0_0_24px_rgba(15,47,45,0.06)]">
      <section className="relative h-[252px] overflow-hidden rounded-[22px] bg-[#E6F2E9] shadow-[0_8px_20px_rgba(13,74,57,0.10)]">
        <img
          src="/hero-sumbawa-v2.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,251,247,.97)_0%,rgba(240,249,242,.88)_49%,rgba(229,244,234,.30)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(238,248,241,.97)_0%,rgba(238,248,241,.12)_48%,rgba(246,251,247,.32)_100%)]" />

        <div className="relative z-10 flex h-full flex-col px-3.5 pb-3 pt-3">
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => setShowCityPicker(true)} className="flex min-w-0 items-center gap-2 rounded-full bg-white/72 py-1 pl-1 pr-2.5 text-left shadow-[0_2px_10px_rgba(9,60,45,.08)] backdrop-blur-sm transition active:scale-[0.98]">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-700 text-white"><PinIcon className="h-4 w-4" /></span>
              <span className="truncate text-[13px] font-extrabold leading-none tracking-[-0.04em] text-[#08234B]">{selectedCityName}</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 shrink-0 text-primary-700"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.09 1.03l-4.25 4.5a.75.75 0 01-1.09 0l-4.25-4.5a.75.75 0 01.02-1.05z" clipRule="evenodd" /></svg>
            </button>
            <div className="flex shrink-0 items-center gap-2"><LanguageToggle className="shadow-[0_3px_9px_rgba(4,44,37,0.06)]" /><a href={`https://wa.me/6282338588078?text=${encodeURIComponent(t("home.helpWhatsappText"))}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white px-[13px] text-[12px] font-extrabold text-[#08234B] shadow-[0_3px_9px_rgba(4,44,37,0.10)] transition active:scale-95"><ChatIcon className="h-4 w-4" /><span className="hidden min-[390px]:inline">Bantuan</span></a></div>
          </div>

          <div className="mt-2.5 max-w-[265px]">
            <h1 className="text-[27px] font-extrabold leading-[28px] tracking-[-0.065em] text-[#071F43]">{t("home.heroTitleFirst")}<br /><span className="text-primary-700">{t("home.heroTitleAccent")}</span></h1>
            <p className="mt-1 max-w-[245px] text-[11px] font-medium leading-[14px] tracking-[-0.025em] text-[#5F6F86]">{t("home.heroSubtitle")}</p>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); goToSearch(); }} className="mt-auto flex h-12 items-center rounded-[15px] bg-white p-1 shadow-[0_5px_14px_rgba(21,66,53,0.13)]">
            <SearchIcon className="ml-2 h-[22px] w-[22px] shrink-0 text-[#8998B1]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("home.heroSearchPlaceholder")} className="min-w-0 flex-1 bg-transparent px-2 text-[12px] font-medium tracking-[-0.035em] text-[#08234B] outline-none placeholder:text-[#8D99AE]" />
            <button aria-label="Cari" type="submit" className="grid h-10 w-12 shrink-0 place-items-center rounded-[12px] bg-primary-700 text-white shadow-[0_3px_8px_rgba(0,111,74,0.24)] transition hover:bg-primary-600 active:scale-95"><ArrowIcon className="h-[22px] w-[22px]" /></button>
          </form>

          <div className="mt-2 flex h-5 items-center divide-x divide-primary-700/15 text-[9.5px] font-bold leading-none tracking-[-0.03em] text-[#315F55]">
            <span className="flex flex-1 items-center gap-1.5 pr-2"><HiOutlineBuildingOffice2 className="h-4 w-4 shrink-0 text-primary-700" />{totalContacts} {t("home.statContacts")}</span>
            <span className="flex flex-1 items-center gap-1.5 px-2"><HiOutlineSquares2X2 className="h-4 w-4 shrink-0 text-primary-700" />{totalCategories} {t("home.statCategories")}</span>
            <span className="flex flex-1 items-center gap-1.5 pl-2"><HiOutlineUserGroup className="h-4 w-4 shrink-0 text-primary-700" />{t("home.heroReady")}</span>
          </div>
        </div>
      </section>

      <section className="mt-[9px]">
        <button type="button" onClick={() => setShowEmergency((value) => !value)} className="flex h-[60px] w-full items-center justify-between rounded-[13px] bg-[linear-gradient(105deg,#fff6f6,#fff1f5)] px-2.5 text-left shadow-[0_4px_10px_rgba(126,52,67,0.08)] transition active:scale-[0.99]"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-[11px] bg-[#FFE0E0]"><SirenIcon className="h-7 w-7" /></span><span><span className="block text-[14px] font-extrabold leading-[18px] tracking-[-0.05em] text-[#08234B]">Panggilan Darurat</span><span className="block text-[12px] font-medium leading-4 text-[#8190AA]">Polisi · Ambulans · Damkar</span></span></span><svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 text-[#95A0B8] transition-transform ${showEmergency ? "rotate-90" : ""}`}><path fillRule="evenodd" d="M7.23 4.21a.75.75 0 011.06.02L12.5 8.7a1.75 1.75 0 010 2.6l-4.21 4.47a.75.75 0 11-1.09-1.03l4.21-4.47a.25.25 0 000-.34L7.2 5.26a.75.75 0 01.03-1.05z" clipRule="evenodd" /></svg></button>
        {showEmergency && <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-[10px] bg-white p-1.5 shadow-[0_3px_9px_rgba(15,47,45,0.07)]">{[{ label: "Polisi", phone: "110" }, { label: "Ambulans", phone: "119" }, { label: "Damkar", phone: "113" }].map((item) => <a key={item.label} href={`tel:${item.phone}`} className="rounded-lg bg-[#F7F9F5] px-1 py-1.5 text-center text-[8px] font-bold text-[#08234B]"><span className="block text-primary-700">{item.phone}</span>{item.label}</a>)}</div>}
      </section>

      <section className="mt-[19px]">
        <SectionHeading title="Pilihan di Sumbawa" onMore={() => navigate("/search")} />
        {contactsLoading ? <div className="flex gap-2 overflow-hidden"><div className="h-[220px] w-[173px] shrink-0 rounded-xl shimmer" /><div className="h-[220px] w-[173px] shrink-0 rounded-xl shimmer" /></div> : contacts.length ? <><div className="-mx-2 flex snap-x gap-2 overflow-x-auto px-2 pb-1.5 scrollbar-hide">{contacts.slice(0, 6).map((contact) => <article key={contact.id} onClick={() => navigate(`/kontak/${contact.id}`)} className="relative h-[220px] w-[173px] shrink-0 snap-start overflow-hidden rounded-xl bg-white p-[7px] shadow-[0_4px_10px_rgba(16,46,70,0.09)] transition active:scale-[0.98]"><div className="relative h-24 overflow-hidden rounded-[9px] bg-[#E8F0E8]"><ContactImage contact={contact} className="h-full w-full" /><BookmarkButton contactId={contact.id} /></div><h3 className="mt-1 truncate text-[12px] font-extrabold leading-[15px] tracking-[-0.055em] text-[#08234B]">{contact.name}</h3><p className="mt-0.5 flex items-center gap-0.5 truncate text-[9.5px] font-medium leading-3 text-[#7988A2]"><PinIcon className="h-2.5 w-2.5 shrink-0 text-primary-700" />{categoryName(contact.category)} <span>·</span> {contact.city?.name ?? selectedCityName}</p><p className="mt-1 h-[39px] overflow-hidden text-[10px] leading-[13px] text-[#74829C]">{contact.description ?? "Temukan informasi, alamat, dan kontak usaha di sekitar Anda."}</p><div className="mt-[5px] flex gap-1"><a href={formatWhatsAppUrl(contact.phone)} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="flex h-[29px] flex-1 items-center justify-center gap-1 rounded-lg bg-primary-700 px-1.5 text-[10px] font-bold text-white transition hover:bg-primary-600 active:scale-95"><FaWhatsapp className="h-3.5 w-3.5" />WhatsApp</a><button type="button" onClick={(event) => { event.stopPropagation(); navigate(`/kontak/${contact.id}`); }} className="h-[29px] rounded-lg border border-[#DDE4ED] px-2 text-[9px] font-bold text-[#08234B] transition active:scale-95">Lihat Detail</button></div></article>)}</div><div className="mt-0.5 flex justify-center gap-1"><span className="h-[5px] w-6 rounded-full bg-primary-700" /><span className="h-[5px] w-6 rounded-full bg-[#D5D9DB]" /><span className="h-[5px] w-6 rounded-full bg-[#D5D9DB]" /></div></> : <div className="grid h-[220px] place-items-center rounded-xl bg-white p-4 text-center text-[11px] text-[#71809B]">Belum ada pilihan untuk kota ini.</div>}
      </section>

      <section className="mt-[22px]">
        <SectionHeading title="Kategori Populer" onMore={() => navigate("/search")} />
        <div className="grid grid-cols-4 gap-2">{categoriesLoading ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[60px] rounded-[11px] shimmer" />) : displayCategories.map((category) => <button key={category.slug} type="button" onClick={() => navigate(`/search?category=${encodeURIComponent(category.slug)}`)} className="flex h-[60px] flex-col items-center justify-center gap-1 rounded-[11px] bg-white px-1 shadow-[0_4px_8px_rgba(11,49,45,0.06)] transition hover:-translate-y-0.5 active:scale-95"><CategoryIcon slug={category.slug} className="h-6 w-6 text-[#08234B]" /><span className="max-w-full truncate text-[11px] font-bold tracking-[-0.04em] text-[#08234B]">{category.name}</span></button>)}</div>
      </section>

      <section className="relative mt-2.5 h-[100px] overflow-hidden rounded-[11px] bg-[radial-gradient(circle_at_92%_12%,#15795c,transparent_32%),linear-gradient(120deg,#003f32,#007352)] px-4 py-3 text-white shadow-[0_6px_13px_rgba(0,91,69,0.20)]"><div className="relative z-10 max-w-[235px]"><h2 className="text-[17px] font-extrabold leading-5 tracking-[-0.055em]">Punya usaha di Sumbawa?</h2><p className="mt-0.5 max-w-[220px] text-[10.5px] leading-[14px] text-white/90">Jangan cuma bagikan nomor WhatsApp. Buat halaman usaha dengan katalog, lokasi, dan lainnya.</p><button type="button" onClick={() => navigate("/submit")} className="mt-1.5 min-w-[112px] rounded-lg bg-white px-3 py-[5px] text-[10px] font-extrabold text-primary-700 transition active:scale-95">Daftarkan Usaha</button></div><StoreIllustration /></section>

      <section className="mb-1.5 mt-2.5">
        <SectionHeading title="Terbaru di CariKontak" onMore={() => navigate("/search")} />
        <div className="space-y-1.5">{contacts.slice(0, 3).map((contact) => <article key={contact.id} onClick={() => navigate(`/kontak/${contact.id}`)} className="relative flex min-h-[72px] gap-2.5 rounded-xl bg-white p-1.5 shadow-[0_4px_9px_rgba(14,43,66,0.07)] transition active:scale-[0.99]"><div className="h-[66px] w-[100px] shrink-0 overflow-hidden rounded-[9px] bg-[#E8F0E8]"><ContactImage contact={contact} className="h-full w-full" /></div><div className="min-w-0 flex-1 pr-4 pt-0.5"><h3 className="truncate text-[13px] font-extrabold leading-4 tracking-[-0.05em] text-[#08234B]">{contact.name}</h3><p className="mt-0.5 flex items-center gap-0.5 truncate text-[10px] font-medium leading-3 text-[#7988A2]"><PinIcon className="h-3 w-3 shrink-0 text-primary-700" />{categoryName(contact.category)} · {contact.city?.name ?? selectedCityName}</p><p className="mt-0.5 line-clamp-2 text-[10px] leading-[13px] text-[#74829C]">{contact.description ?? "Lihat informasi lengkap dan cara menghubungi."}</p></div><BookmarkButton contactId={contact.id} compact /></article>)}</div>
      </section>
    </div>
  </div>;
}
