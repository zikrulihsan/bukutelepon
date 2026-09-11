import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FaWhatsapp } from "react-icons/fa";
import { HiBookmark, HiOutlineBookmark } from "react-icons/hi2";
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

const POPULAR_SEARCHES = ["rental mobil", "oleh-oleh", "rumah sakit", "puskesmas", "laundry"];
const CATEGORY_FALLBACK = [
  { slug: "jasa", name: "Jasa" }, { slug: "kuliner", name: "Kuliner" },
  { slug: "kesehatan", name: "Kesehatan" }, { slug: "transportasi", name: "Otomotif" },
  { slug: "laundry", name: "Laundry" }, { slug: "penginapan", name: "Penginapan" },
  { slug: "oleh-oleh", name: "Oleh-Oleh" }, { slug: "lainnya", name: "Lainnya" },
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
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d="M20.5 11.4a8.3 8.3 0 0 1-8.6 8.1 9.8 9.8 0 0 1-3.6-.7L4 20l1.3-3.7a7.7 7.7 0 0 1-1.8-4.9 8.3 8.3 0 0 1 8.5-8.1 8.3 8.3 0 0 1 8.5 8.1Z"/><path d="M8.3 11.5h.1m3.5 0h.1m3.5 0h.1" strokeWidth="2.7"/></svg>;
}

function SirenIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true"><path d="M21 43V29.5C21 22.6 25.9 17 32 17s11 5.6 11 12.5V43" fill="#FF4A50"/><path d="M17 46.5h30M24 43h16" stroke="#D8242D" strokeWidth="4" strokeLinecap="round"/><path d="M32 9V3M48.3 15.7l4.2-4.2M15.7 15.7l-4.2-4.2M52 31h6M6 31h6" stroke="#FF4A50" strokeWidth="3" strokeLinecap="round"/><path d="M28 24.5c1.1-1.2 2.4-1.8 4-1.8" stroke="#FFADB0" strokeWidth="3" strokeLinecap="round"/></svg>;
}

function StoreIllustration() {
  return <div className="pointer-events-none absolute bottom-0 right-0 hidden h-full w-[330px] min-[650px]:block" aria-hidden="true">
    <svg viewBox="0 0 330 190" className="absolute bottom-[-5px] right-[-8px] h-[185px] w-[322px]">
      <path d="M177 177h137" stroke="#55E39A" strokeWidth="5" strokeLinecap="round" opacity=".55"/>
      <path d="M211 177V61c0-20 13-32 33-32h48c18 0 28 11 28 28v120" fill="#E7FFF1" stroke="#8FF0BA" strokeWidth="10"/>
      <rect x="227" y="47" width="72" height="108" rx="8" fill="white"/>
      <path d="M217 96h94l-8-29h-77l-9 29Z" fill="#B6F8CF"/>
      <path d="M217 96c0 10 16 10 16 0 0 10 17 10 17 0 0 10 16 10 16 0 0 10 17 10 17 0 0 10 19 10 19 0" fill="#43D789" stroke="#20A969" strokeWidth="3" strokeLinejoin="round"/>
      <rect x="238" y="108" width="53" height="46" rx="3" fill="#45D98C"/>
      <rect x="257" y="123" width="16" height="31" rx="2" fill="#08785B"/>
      <rect x="244" y="55" width="37" height="5" rx="2.5" fill="#A8EFC7"/>
      <rect x="233" y="39" width="59" height="5" rx="2.5" fill="#A8EFC7"/>
      <path d="m311 71 13-8m-11 20 16-1m-19 12 12 7" stroke="#D5F23E" strokeWidth="5" strokeLinecap="round"/>
    </svg>
    <div className="absolute right-5 top-3 rounded-[17px] bg-white px-4 py-2 text-center text-[14px] font-extrabold leading-[18px] text-primary-700 shadow-sm">Lebih mudah<br/>ditemukan!</div>
  </div>;
}

function BookmarkButton({ contactId, compact = false }: { contactId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(() => isSaved(contactId));
  return <button type="button" onClick={(event) => { event.stopPropagation(); setSaved(toggleSaved(contactId)); }} aria-label={saved ? "Hapus dari tersimpan" : "Simpan kontak"} className={`${compact ? "h-10 w-10" : "h-12 w-12"} absolute right-3 top-3 grid place-items-center rounded-full bg-white/95 text-[#71809B] shadow-[0_4px_14px_rgba(9,36,71,0.14)] transition active:scale-90`}>
    {saved ? <HiBookmark className="h-5 w-5 text-primary-700" /> : <HiOutlineBookmark className="h-5 w-5" />}
  </button>;
}

function ContactImage({ contact, className = "" }: { contact: Contact; className?: string }) {
  return contact.imageUrl
    ? <img src={contact.imageUrl} alt={contact.name} className={`${className} object-cover`} />
    : <CategoryPhoto slug={contact.category?.slug} className={`${className} bg-gradient-to-br`} iconClassName="h-12 w-12" />;
}

function SectionHeading({ title, onMore }: { title: string; onMore?: () => void }) {
  return <div className="home-section-heading mb-3 flex items-center justify-between px-0.5">
    <h2 className="text-[25px] font-extrabold tracking-[-0.055em] text-[#08234B] min-[700px]:text-[29px] min-[700px]:leading-tight">{title}</h2>
    {onMore && <button type="button" onClick={onMore} className="inline-flex items-center gap-1 text-[16px] font-bold text-primary-700 transition active:scale-95 min-[700px]:text-[19px]">Lihat semua <ArrowIcon className="h-4 w-4 min-[700px]:h-5 min-[700px]:w-5" /></button>}
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
  const selectedCityName = city?.name ?? "Sumbawa Besar";
  const cityPickerVisible = showCityPicker || (!citySlug && (citiesData?.data?.length ?? cities.length) > 0);
  const goToSearch = (keyword = query) => { const value = keyword.trim(); navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/search"); };
  const chooseCity = (nextCity: City) => { setCity(nextCity); setShowCityPicker(false); };

  return <div className="min-h-screen bg-[radial-gradient(circle_at_30%_8%,rgba(226,241,231,.62),transparent_26%),#F8FAF7] pb-28 text-[#08234B] min-[700px]:pb-36">
    {cityPickerVisible && <CityPickerOverlay cities={citiesData?.data ?? cities} onSelect={chooseCity} onClose={citySlug ? () => setShowCityPicker(false) : undefined} />}
    <div className="home-shell mx-auto max-w-[850px] overflow-hidden px-5 pt-5 min-[700px]:px-[38px] min-[700px]:pt-6">
      <header className="mb-4 flex items-start justify-between gap-3 min-[700px]:mb-[18px]">
        <div><button type="button" onClick={() => navigate("/")} className="text-left text-[38px] font-extrabold leading-none tracking-[-0.07em] text-[#08234B] min-[700px]:text-[40px]">CariKontak</button><p className="mt-1 text-[16px] font-medium tracking-[-0.04em] text-[#697894] min-[700px]:text-[18px] min-[700px]:leading-tight">Temukan kebutuhanmu di Sumbawa</p></div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5 min-[700px]:gap-5"><LanguageToggle className="shadow-[0_5px_18px_rgba(4,44,37,0.06)] min-[700px]:min-h-[52px] min-[700px]:px-1" /><a href={`https://wa.me/6282338588078?text=${encodeURIComponent(t("home.helpWhatsappText"))}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-4 text-[15px] font-extrabold text-[#08234B] shadow-[0_6px_18px_rgba(4,44,37,0.10)] transition active:scale-95 min-[700px]:h-[58px] min-[700px]:gap-3 min-[700px]:px-7 min-[700px]:text-[21px]"><ChatIcon className="h-6 w-6 min-[700px]:h-7 min-[700px]:w-7"/><span className="hidden min-[410px]:inline">Bantuan</span></a></div>
      </header>

      <section className="rounded-[26px] bg-[radial-gradient(circle_at_12%_0%,#f6fbf8,transparent_42%),linear-gradient(135deg,#edf5ef,#e6efe9)] px-4 pb-5 pt-4 shadow-[0_10px_25px_rgba(15,67,54,0.04)] min-[700px]:rounded-[28px] min-[700px]:px-[19px] min-[700px]:pb-[20px] min-[700px]:pt-[18px]">
        <div className="mb-4 flex items-center justify-between gap-2 min-[700px]:mb-[17px] min-[700px]:px-1"><button type="button" onClick={() => setShowCityPicker(true)} className="flex min-w-0 items-center gap-2 text-left active:scale-[0.98] min-[700px]:gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-primary-700 text-white min-[700px]:h-[42px] min-[700px]:w-[42px]"><PinIcon className="h-5 w-5 min-[700px]:h-6 min-[700px]:w-6" /></span><span className="truncate text-[22px] font-extrabold tracking-[-0.05em] text-[#08234B] min-[700px]:text-[25px]">{selectedCityName}</span><svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-[#697894] min-[700px]:h-6 min-[700px]:w-6"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.09 1.03l-4.25 4.5a.75.75 0 01-1.09 0l-4.25-4.5a.75.75 0 01.02-1.05z" clipRule="evenodd" /></svg></button><button type="button" onClick={() => navigator.geolocation?.getCurrentPosition(() => setShowCityPicker(true), () => setShowCityPicker(true))} className="flex shrink-0 items-center gap-1.5 text-[14px] font-bold text-primary-700 min-[700px]:gap-3 min-[700px]:text-[19px]"><span className="grid h-7 w-7 place-items-center rounded-full border-2 border-primary-700 min-[700px]:h-9 min-[700px]:w-9"><span className="h-2 w-2 rounded-full bg-primary-700 min-[700px]:h-2.5 min-[700px]:w-2.5" /></span><span className="hidden min-[390px]:inline">Pakai lokasi saya</span></button></div>
        <form onSubmit={(event) => { event.preventDefault(); goToSearch(); }} className="flex h-[76px] items-center rounded-[22px] bg-white p-2 shadow-[0_8px_18px_rgba(37,74,63,0.08)] min-[700px]:h-[84px] min-[700px]:rounded-[23px]"><SearchIcon className="ml-3 h-8 w-8 shrink-0 text-[#94A1BB] min-[700px]:ml-4 min-[700px]:h-10 min-[700px]:w-10" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari rental mobil, oleh-oleh, servis AC..." className="min-w-0 flex-1 bg-transparent px-3 text-[16px] font-medium tracking-[-0.04em] text-[#08234B] outline-none placeholder:text-[#95A0B8] min-[700px]:px-5 min-[700px]:text-[20px]" /><button aria-label="Cari" type="submit" className="grid h-[60px] w-[60px] shrink-0 place-items-center rounded-[19px] bg-primary-700 text-white shadow-[0_6px_13px_rgba(0,111,74,0.22)] transition hover:bg-primary-600 active:scale-95 min-[700px]:h-[68px] min-[700px]:w-[78px] min-[700px]:rounded-[21px]"><ArrowIcon className="h-8 w-8 min-[700px]:h-10 min-[700px]:w-10" /></button></form>
        <p className="mb-2 mt-3 text-[14px] font-medium text-[#60708A] min-[700px]:mt-2 min-[700px]:text-[17px]">Pencarian populer</p><div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 scrollbar-hide min-[700px]:gap-4">{POPULAR_SEARCHES.map((keyword) => <button key={keyword} type="button" onClick={() => goToSearch(keyword)} className="shrink-0 rounded-full bg-white px-4 py-2 text-[14px] font-bold text-[#315785] shadow-[0_4px_10px_rgba(29,73,64,0.06)] transition active:scale-95 min-[700px]:px-5 min-[700px]:text-[17px]">{keyword}</button>)}</div>
      </section>

      <section className="mt-5 min-[700px]:mt-[18px]"><button type="button" onClick={() => setShowEmergency((value) => !value)} className="flex w-full items-center justify-between rounded-[22px] bg-[linear-gradient(105deg,#fff6f6,#fff1f5)] px-4 py-4 text-left shadow-[0_8px_20px_rgba(126,52,67,0.08)] transition active:scale-[0.99] min-[700px]:h-[112px] min-[700px]:rounded-[23px] min-[700px]:px-[18px]"><span className="flex items-center gap-4 min-[700px]:gap-5"><span className="grid h-[72px] w-[72px] place-items-center rounded-[19px] bg-[#FFE0E0]"><SirenIcon className="h-[50px] w-[50px]"/></span><span><span className="block text-[20px] font-extrabold tracking-[-0.05em] text-[#08234B] min-[700px]:text-[23px]">Panggilan Darurat</span><span className="mt-0.5 block text-[16px] font-medium text-[#8190AA] min-[700px]:text-[19px]">Polisi · Ambulans · Damkar</span></span></span><svg viewBox="0 0 20 20" fill="currentColor" className={`h-6 w-6 text-[#95A0B8] transition-transform min-[700px]:h-7 min-[700px]:w-7 ${showEmergency ? "rotate-90" : ""}`}><path fillRule="evenodd" d="M7.23 4.21a.75.75 0 011.06.02L12.5 8.7a1.75 1.75 0 010 2.6l-4.21 4.47a.75.75 0 11-1.09-1.03l4.21-4.47a.25.25 0 000-.34L7.2 5.26a.75.75 0 01.03-1.05z" clipRule="evenodd" /></svg></button>{showEmergency && <div className="mt-3 grid grid-cols-3 gap-2 rounded-[20px] bg-white p-3 shadow-[0_6px_18px_rgba(15,47,45,0.07)]">{[{ label: "Polisi", phone: "110" }, { label: "Ambulans", phone: "119" }, { label: "Damkar", phone: "113" }].map((item) => <a key={item.label} href={`tel:${item.phone}`} className="rounded-2xl bg-[#F7F9F5] px-2 py-3 text-center text-[13px] font-bold text-[#08234B]"><span className="block text-primary-700">{item.phone}</span>{item.label}</a>)}</div>}</section>

      <section className="mt-8 min-[700px]:mt-[35px]"><SectionHeading title="Pilihan di Sumbawa" onMore={() => navigate("/search")} />{contactsLoading ? <div className="flex gap-3 overflow-hidden"><div className="h-[422px] w-[322px] shrink-0 rounded-[22px] shimmer" /><div className="h-[422px] w-[322px] shrink-0 rounded-[22px] shimmer" /></div> : contacts.length ? <><div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-3 scrollbar-hide min-[700px]:-mx-[15px] min-[700px]:gap-2.5 min-[700px]:px-[15px]">{contacts.slice(0, 6).map((contact) => <article key={contact.id} onClick={() => navigate(`/kontak/${contact.id}`)} className="relative w-[312px] shrink-0 snap-start overflow-hidden rounded-[22px] bg-white p-3 shadow-[0_8px_20px_rgba(16,46,70,0.09)] transition active:scale-[0.98] min-[700px]:h-[422px] min-[700px]:w-[322px]"><div className="relative h-[180px] overflow-hidden rounded-[15px] bg-[#E8F0E8]"><ContactImage contact={contact} className="h-full w-full" /><BookmarkButton contactId={contact.id} /></div><h3 className="mt-2 truncate text-[20px] font-extrabold tracking-[-0.055em] text-[#08234B] min-[700px]:text-[21px] min-[700px]:leading-tight">{contact.name}</h3><p className="mt-1 flex items-center gap-1.5 truncate text-[14px] font-medium text-[#7988A2] min-[700px]:text-[15px]"><PinIcon className="h-4 w-4 shrink-0 text-primary-700" />{categoryName(contact.category)} <span>·</span> {contact.city?.name ?? selectedCityName}</p><p className="mt-2 h-[50px] overflow-hidden text-[15px] leading-6 text-[#74829C] min-[700px]:h-[66px]">{contact.description ?? "Temukan informasi, alamat, dan kontak usaha di sekitar Anda."}</p><div className="mt-3 flex gap-2"><a href={formatWhatsAppUrl(contact.phone)} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[14px] bg-primary-700 px-3 text-[15px] font-bold text-white transition hover:bg-primary-600 active:scale-95"><FaWhatsapp className="h-5 w-5" />WhatsApp</a><button type="button" onClick={(event) => { event.stopPropagation(); navigate(`/kontak/${contact.id}`); }} className="h-12 rounded-[14px] border border-[#DDE4ED] px-4 text-[14px] font-bold text-[#08234B] transition active:scale-95">Lihat Detail</button></div></article>)}</div><div className="mt-1 flex justify-center gap-2"><span className="h-2.5 w-12 rounded-full bg-primary-700" /><span className="h-2.5 w-12 rounded-full bg-[#D5D9DB]" /><span className="h-2.5 w-12 rounded-full bg-[#D5D9DB]" /></div></> : <div className="rounded-[22px] bg-white p-8 text-center text-[15px] text-[#71809B] min-[700px]:h-[422px] min-[700px]:pt-48">Belum ada pilihan untuk kota ini.</div>}</section>

      <section className="mt-9 min-[700px]:mt-[35px]"><SectionHeading title="Kategori Populer" onMore={() => navigate("/search")} /><div className="grid grid-cols-4 gap-3 min-[700px]:gap-[13px]">{categoriesLoading ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[114px] rounded-[20px] shimmer" />) : displayCategories.map((category) => <button key={category.slug} type="button" onClick={() => navigate(`/search?category=${encodeURIComponent(category.slug)}`)} className="flex h-[114px] flex-col items-center justify-center gap-2 rounded-[20px] bg-white px-2 shadow-[0_7px_16px_rgba(11,49,45,0.06)] transition hover:-translate-y-0.5 active:scale-95 min-[700px]:h-[109px] min-[700px]:gap-2.5"><CategoryIcon slug={category.slug} className="h-8 w-8 text-[#08234B] min-[700px]:h-10 min-[700px]:w-10" /><span className="max-w-full truncate text-[14px] font-bold tracking-[-0.04em] text-[#08234B] min-[700px]:text-[17px]">{category.name}</span></button>)}</div></section>

      <section className="relative mt-8 overflow-hidden rounded-[22px] bg-[radial-gradient(circle_at_92%_12%,#15795c,transparent_32%),linear-gradient(120deg,#003f32,#007352)] px-5 py-5 text-white shadow-[0_12px_25px_rgba(0,91,69,0.20)] min-[700px]:mt-[20px] min-[700px]:h-[184px] min-[700px]:rounded-[20px] min-[700px]:px-[32px] min-[700px]:py-[21px]"><div className="relative z-10 max-w-[260px] min-[700px]:max-w-[455px]"><h2 className="text-[24px] font-extrabold leading-tight tracking-[-0.055em] min-[700px]:text-[31px]">Punya usaha di Sumbawa?</h2><p className="mt-1.5 text-[15px] leading-5 text-white/90 min-[700px]:max-w-[430px] min-[700px]:text-[18px] min-[700px]:leading-6">Jangan cuma bagikan nomor WhatsApp. Buat halaman usaha dengan katalog, lokasi, dan lainnya.</p><button type="button" onClick={() => navigate("/submit")} className="mt-4 rounded-[14px] bg-white px-5 py-3 text-[15px] font-extrabold text-primary-700 transition active:scale-95 min-[700px]:mt-3 min-[700px]:min-w-[207px] min-[700px]:py-2.5 min-[700px]:text-[17px]">Daftarkan Usaha</button></div><div className="absolute bottom-[-18px] right-[-5px] h-36 w-32 rounded-t-[38px] border-[7px] border-[#B5FFB8] bg-white/95 shadow-[inset_0_0_0_6px_#106f55] min-[650px]:hidden"><div className="absolute -top-4 left-4 right-4 rounded-xl bg-[#B5FFB8] px-2 py-1 text-center text-[10px] font-extrabold leading-3 text-primary-700">Lebih mudah ditemukan!</div><div className="mx-auto mt-10 h-12 w-20 rounded-t-xl bg-[#89E6A4]" /></div><StoreIllustration /></section>

      <section className="mb-3 mt-8 min-[700px]:mt-[24px]"><SectionHeading title="Terbaru di CariKontak" onMore={() => navigate("/search")} /><div className="space-y-3">{contacts.slice(0, 3).map((contact) => <article key={contact.id} onClick={() => navigate(`/kontak/${contact.id}`)} className="relative flex gap-3 rounded-[21px] bg-white p-3 shadow-[0_7px_17px_rgba(14,43,66,0.07)] transition active:scale-[0.99] min-[700px]:min-h-[133px] min-[700px]:gap-5 min-[700px]:p-3"><div className="h-[94px] w-[94px] shrink-0 overflow-hidden rounded-[14px] bg-[#E8F0E8] min-[700px]:h-[118px] min-[700px]:w-[185px]"><ContactImage contact={contact} className="h-full w-full" /></div><div className="min-w-0 flex-1 pr-7 min-[700px]:pt-1"><h3 className="truncate text-[18px] font-extrabold tracking-[-0.05em] text-[#08234B] min-[700px]:text-[23px]">{contact.name}</h3><p className="mt-1 flex items-center gap-1.5 truncate text-[14px] font-medium text-[#7988A2] min-[700px]:text-[17px]"><PinIcon className="h-4 w-4 shrink-0 text-primary-700 min-[700px]:h-5 min-[700px]:w-5" />{categoryName(contact.category)} · {contact.city?.name ?? selectedCityName}</p><p className="mt-1 line-clamp-2 text-[14px] leading-5 text-[#74829C] min-[700px]:text-[17px] min-[700px]:leading-6">{contact.description ?? "Lihat informasi lengkap dan cara menghubungi."}</p></div><BookmarkButton contactId={contact.id} compact /></article>)}</div></section>
    </div>
  </div>;
}
