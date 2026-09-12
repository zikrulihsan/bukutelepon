import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiBookmark, HiOutlineBookmark } from "react-icons/hi2";
import { apiClient } from "../../lib/axios";
import { useCity } from "../../context/CityContext";
import { useCategories } from "../../context/CategoriesContext";
import { useContacts } from "../../hooks/useContacts";
import { CityPickerOverlay } from "../../components/shared/CityPickerOverlay";
import { CategoryIcon } from "../../components/shared/CategoryIcon";
import { CategoryPhoto } from "../../components/shared/CategoryPhoto";
import { ContactCard } from "../../components/shared/ContactCard";
import { LanguageToggle } from "../../components/shared/LanguageToggle";
import { isSaved, toggleSaved } from "../../lib/saved";
import { useI18n } from "../../i18n/LanguageContext";
import type { City, Contact } from "../../types";

const CATEGORY_FALLBACK = [
  { slug: "jasa", name: "Jasa" },
  { slug: "kesehatan", name: "Kesehatan" },
  { slug: "kuliner", name: "Kuliner" },
  { slug: "pemerintah", name: "Pemerintah" },
  { slug: "pendidikan", name: "Pendidikan" },
  { slug: "wisata", name: "Wisata" },
  { slug: "transportasi", name: "Transportasi" },
  { slug: "darurat", name: "Darurat" },
];

const HOME_CATEGORY_ORDER = CATEGORY_FALLBACK.map((category) => category.slug);

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
  return <button type="button" onClick={(event) => { event.stopPropagation(); setSaved(toggleSaved(contactId)); }} aria-label={saved ? "Hapus dari tersimpan" : "Simpan kontak"} className={`${compact ? "h-9 w-9" : "h-10 w-10"} absolute right-2 top-2 grid place-items-center rounded-full bg-white/95 text-[#71809B] shadow-[0_2px_7px_rgba(9,36,71,0.14)] transition active:scale-90`}>
    {saved ? <HiBookmark className="h-5 w-5 text-primary-700" /> : <HiOutlineBookmark className="h-5 w-5" />}
  </button>;
}

function ContactImage({ contact, className = "" }: { contact: Contact; className?: string }) {
  return contact.imageUrl
    ? <img src={contact.imageUrl} alt={contact.name} className={`${className} object-cover`} />
    : <CategoryPhoto slug={contact.category?.slug} className={`${className} bg-gradient-to-br`} iconClassName="h-6 w-6" />;
}

function ChoiceCard({ contact, categoryLabel, cityName, viewLabel, onOpen }: { contact: Contact; categoryLabel: string; cityName: string; viewLabel: string; onOpen: () => void }) {
  return <article onClick={onOpen} className="relative flex h-[238px] w-[174px] shrink-0 snap-start cursor-pointer flex-col overflow-hidden rounded-2xl bg-white p-2 shadow-[0_4px_12px_rgba(16,46,70,0.09)] transition active:scale-[0.98]">
    <div className="relative h-[116px] shrink-0 overflow-hidden rounded-xl bg-[#E8F0E8]"><ContactImage contact={contact} className="h-full w-full" /><BookmarkButton contactId={contact.id} compact /></div>
    <h3 className="mt-2 line-clamp-2 min-h-10 text-[15px] font-extrabold leading-5 tracking-[-0.035em] text-[#08234B]">{contact.name}</h3>
    <p className="mt-1 flex items-center gap-1 truncate text-[11px] font-semibold leading-4 text-[#7988A2]"><PinIcon className="h-3.5 w-3.5 shrink-0 text-primary-700" />{categoryLabel} <span>·</span> {contact.city?.name ?? cityName}</p>
    <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-extrabold text-primary-700">{viewLabel}<ArrowIcon className="h-4 w-4" /></span>
  </article>;
}

function DiscoveryPoster({ title, description, imageUrl, imagePosition = "center", onOpen }: { title: string; description: string; imageUrl: string; imagePosition?: string; onOpen: () => void }) {
  return <button type="button" onClick={onOpen} className="group relative h-[236px] w-[184px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-[#173B32] text-left shadow-[0_6px_16px_rgba(16,46,70,0.15)] transition active:scale-[0.98]">
    <img src={imageUrl} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" style={{ objectPosition: imagePosition }} />
    <span className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,28,38,.06)_22%,rgba(5,28,38,.20)_48%,rgba(5,28,38,.92)_100%)]" />
    <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/50 bg-white/90 text-primary-700 shadow-sm"><ArrowIcon className="h-4 w-4" /></span>
    <span className="absolute inset-x-0 bottom-0 z-10 block px-3.5 pb-3.5 pt-12 text-white">
      <span className="line-clamp-2 block text-[17px] font-extrabold leading-5 tracking-[-0.04em]">{title}</span>
      <span className="mt-1 line-clamp-2 block text-[11.5px] font-medium leading-[15px] text-white/85">{description}</span>
    </span>
  </button>;
}

function SectionHeading({ title, onMore }: { title: string; onMore?: () => void }) {
  const { t } = useI18n();
  return <div className="mb-3 flex min-h-7 items-center justify-between gap-3">
    <h2 className="text-[21px] font-extrabold leading-7 tracking-[-0.045em] text-[#08234B]">{title}</h2>
    {onMore && <button type="button" onClick={onMore} className="inline-flex shrink-0 items-center gap-1 text-[14px] font-bold text-primary-700 transition active:scale-95">{t("home.seeAll")} <ArrowIcon className="h-4 w-4" /></button>}
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
  const recommendedContacts = contacts.filter((contact) => contact.isVerified).slice(0, 6);
  const displayCategories = categories.length
    ? [...categories]
      .sort((a, b) => {
        const aIndex = HOME_CATEGORY_ORDER.indexOf(a.slug);
        const bIndex = HOME_CATEGORY_ORDER.indexOf(b.slug);
        return (aIndex < 0 ? 99 : aIndex) - (bIndex < 0 ? 99 : bIndex);
      })
      .slice(0, 8)
      .map((category) => ({ slug: category.slug, name: categoryName(category) }))
    : CATEGORY_FALLBACK;
  const selectedCityName = city?.name ?? "Sumbawa Besar";
  const cityPickerVisible = showCityPicker || (!citySlug && (citiesData?.data?.length ?? cities.length) > 0);
  const goToSearch = (keyword = query) => { const value = keyword.trim(); navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/search"); };
  const chooseCity = (nextCity: City) => { setCity(nextCity); setShowCityPicker(false); };
  const discoveryTopics = [
    { id: "coffee", title: t("home.discoveryCoffeeTitle"), description: t("home.discoveryCoffeeDescription"), imageUrl: "/storefront/kopi-tambora.jpg", href: "/search?q=kopi" },
    { id: "souvenirs", title: t("home.discoverySouvenirTitle"), description: t("home.discoverySouvenirDescription"), imageUrl: "/storefront/madu-sumbawa.jpg", href: "/search?q=oleh-oleh" },
    { id: "travel", title: t("home.discoveryTravelTitle"), description: t("home.discoveryTravelDescription"), imageUrl: "/hero-sumbawa-v2.jpg", imagePosition: "62% center", href: "/search?q=travel" },
    { id: "delivery", title: t("home.discoveryDeliveryTitle"), description: t("home.discoveryDeliveryDescription"), imageUrl: "/storefront/store-cover.jpg", imagePosition: "68% center", href: "/search?category=jasa" },
  ];

  return <div className="min-h-screen bg-[radial-gradient(circle_at_30%_8%,rgba(226,241,231,.62),transparent_26%),#F8FAF7] pb-[82px] text-[#08234B]">
    {cityPickerVisible && <CityPickerOverlay cities={citiesData?.data ?? cities} onSelect={chooseCity} onClose={citySlug ? () => setShowCityPicker(false) : undefined} />}
    <div className="mx-auto max-w-md overflow-x-hidden bg-[#F8FAF7] sm:shadow-[0_0_24px_rgba(15,47,45,0.06)]">
      <section className="relative h-[316px] overflow-hidden bg-[#E6F2E9]">
        <img
          src="/hero-sumbawa-v2.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-[58%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,251,247,.97)_0%,rgba(240,249,242,.88)_49%,rgba(229,244,234,.30)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(238,248,241,.97)_0%,rgba(238,248,241,.12)_48%,rgba(246,251,247,.32)_100%)]" />

        <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-4">
          <div className="flex items-center justify-between gap-2">
            <button type="button" onClick={() => setShowCityPicker(true)} className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[14px] border border-white/75 bg-white/72 px-3 text-left shadow-[0_2px_10px_rgba(9,60,45,.08)] backdrop-blur-sm transition active:scale-[0.98]">
              <PinIcon className="h-[18px] w-[18px] shrink-0 text-primary-700" />
              <span className="truncate text-[14px] font-bold leading-none tracking-[-0.035em] text-[#08234B]">{selectedCityName}</span>
              <svg viewBox="0 0 20 20" fill="currentColor" className="ml-auto h-4 w-4 shrink-0 text-primary-700"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.09 1.03l-4.25 4.5a.75.75 0 01-1.09 0l-4.25-4.5a.75.75 0 01.02-1.05z" clipRule="evenodd" /></svg>
            </button>
            <div className="flex shrink-0 items-center gap-2"><LanguageToggle className="shadow-[0_3px_9px_rgba(4,44,37,0.06)]" /><a href={`https://wa.me/6282338588078?text=${encodeURIComponent(t("home.helpWhatsappText"))}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/95 px-3 text-[13px] font-extrabold text-[#08234B] shadow-[0_3px_9px_rgba(4,44,37,0.10)] transition active:scale-95"><ChatIcon className="h-[18px] w-[18px]" /><span className="hidden min-[390px]:inline">{t("home.help")}</span></a></div>
          </div>

          <div className="mt-9 max-w-[310px]">
            <h1 className="text-[32px] font-extrabold leading-[34px] tracking-[-0.06em] text-[#071F43]">{t("home.heroTitleFirst")}<br /><span className="text-primary-700">{t("home.heroTitleAccent")}</span></h1>
            <p className="mt-2 max-w-[300px] text-[14px] font-medium leading-5 tracking-[-0.025em] text-[#53667F]">{t("home.heroSubtitle")}</p>
          </div>

          <form onSubmit={(event) => { event.preventDefault(); goToSearch(); }} className="mt-auto flex h-14 items-center rounded-[18px] bg-white p-1 shadow-[0_5px_14px_rgba(21,66,53,0.13)]">
            <SearchIcon className="ml-3 h-6 w-6 shrink-0 text-[#8998B1]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("home.heroSearchPlaceholder")} className="min-w-0 flex-1 bg-transparent px-3 text-[16px] font-medium tracking-[-0.035em] text-[#08234B] outline-none placeholder:text-[#8D99AE]" />
            <button aria-label="Cari" type="submit" className="grid h-12 w-14 shrink-0 place-items-center rounded-[15px] bg-primary-700 text-white shadow-[0_3px_8px_rgba(0,111,74,0.24)] transition hover:bg-primary-600 active:scale-95"><ArrowIcon className="h-6 w-6" /></button>
          </form>

        </div>
      </section>

      <div className="px-4">

      <section className="mt-6">
        <SectionHeading title={t("home.popularCategories")} onMore={() => navigate("/search")} />
        <div className="grid grid-cols-4 gap-2.5">{categoriesLoading ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[84px] rounded-2xl shimmer" />) : displayCategories.map((category) => <button key={category.slug} type="button" onClick={() => navigate(`/search?category=${encodeURIComponent(category.slug)}`)} className="flex h-[84px] min-w-0 flex-col items-center justify-center gap-2 rounded-2xl bg-white px-1.5 shadow-[0_4px_10px_rgba(11,49,45,0.07)] transition hover:-translate-y-0.5 active:scale-95"><CategoryIcon slug={category.slug} className="h-8 w-8 text-[#08234B]" /><span className="w-full truncate text-[12px] font-bold tracking-[-0.035em] text-[#08234B]">{category.name}</span></button>)}</div>
      </section>

      <section className="mt-5">
        <button type="button" onClick={() => setShowEmergency((value) => !value)} className="flex h-16 w-full items-center justify-between rounded-2xl bg-[linear-gradient(105deg,#fff7f7,#fff2f5)] px-3 text-left shadow-[0_3px_9px_rgba(126,52,67,0.07)] transition active:scale-[0.99]"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFE0E0]"><SirenIcon className="h-7 w-7" /></span><span><span className="block text-[15px] font-extrabold leading-5 tracking-[-0.035em] text-[#08234B]">{t("home.emergencyTitle")}</span><span className="block text-[12px] font-medium leading-4 text-[#8190AA]">{t("home.emergencySubtitle")}</span></span></span><svg viewBox="0 0 20 20" fill="currentColor" className={`h-5 w-5 text-[#95A0B8] transition-transform ${showEmergency ? "rotate-90" : ""}`}><path fillRule="evenodd" d="M7.23 4.21a.75.75 0 011.06.02L12.5 8.7a1.75 1.75 0 010 2.6l-4.21 4.47a.75.75 0 11-1.09-1.03l4.21-4.47a.25.25 0 000-.34L7.2 5.26a.75.75 0 01.03-1.05z" clipRule="evenodd" /></svg></button>
        {showEmergency && <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl bg-white p-2 shadow-[0_3px_9px_rgba(15,47,45,0.07)]">{[{ label: "Polisi", phone: "110" }, { label: "Ambulans", phone: "119" }, { label: "Damkar", phone: "113" }].map((item) => <a key={item.label} href={`tel:${item.phone}`} className="rounded-[10px] bg-[#F7F9F5] px-2 py-2.5 text-center text-[12px] font-bold text-[#08234B]"><span className="mb-0.5 block text-[14px] text-primary-700">{item.phone}</span>{item.label}</a>)}</div>}
      </section>

      <section className="mt-7">
        <SectionHeading title={t("home.whatsInSumbawa")} />
        <div className="-mr-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-3 pr-4 scrollbar-hide">{discoveryTopics.map((topic) => <DiscoveryPoster key={topic.id} title={topic.title} description={topic.description} imageUrl={topic.imageUrl} imagePosition={topic.imagePosition} onOpen={() => navigate(topic.href)} />)}</div>
      </section>

      <section className="mt-7">
        <SectionHeading title={t("home.carikontakRecommendations")} onMore={() => navigate("/search")} />
        {contactsLoading ? <div className="-mr-4 flex gap-2.5 overflow-hidden pr-4"><div className="h-[238px] w-[174px] shrink-0 rounded-2xl shimmer" /><div className="h-[238px] w-[174px] shrink-0 rounded-2xl shimmer" /><div className="h-[238px] w-[174px] shrink-0 rounded-2xl shimmer" /></div> : recommendedContacts.length ? <div className="-mr-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 pr-4 scrollbar-hide">{recommendedContacts.map((contact) => <ChoiceCard key={contact.id} contact={contact} categoryLabel={categoryName(contact.category)} cityName={selectedCityName} viewLabel={t("home.view")} onOpen={() => navigate(`/kontak/${contact.id}`)} />)}</div> : <div className="grid h-[144px] place-items-center rounded-2xl bg-white p-5 text-center text-[14px] text-[#71809B]">{t("home.noRecommendations")}</div>}
      </section>

      <section className="relative mt-8 min-h-[170px] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_92%_12%,#15795c,transparent_32%),linear-gradient(120deg,#003f32,#007352)] px-4 py-4 text-white shadow-[0_6px_13px_rgba(0,91,69,0.20)]"><div className="relative z-10 max-w-[235px]"><h2 className="text-[20px] font-extrabold leading-6 tracking-[-0.045em]">Punya usaha di Sumbawa?</h2><p className="mt-1 text-[13px] leading-[18px] text-white/90">Jangan cuma bagikan nomor WhatsApp. Buat halaman usaha dengan katalog, lokasi, dan lainnya.</p><button type="button" onClick={() => navigate("/submit")} className="mt-3 h-10 min-w-[150px] rounded-xl bg-white px-4 text-[13px] font-extrabold text-primary-700 transition active:scale-95">Daftarkan Usaha</button></div><StoreIllustration /></section>

      <section className="mb-5 mt-8">
        <SectionHeading title={t("home.latestInCariKontak")} onMore={() => navigate("/search")} />
        {contactsLoading ? <div className="space-y-3"><div className="h-[160px] rounded-2xl shimmer" /><div className="h-[160px] rounded-2xl shimmer" /></div> : contacts.length ? <div className="space-y-3">{contacts.slice(0, 3).map((contact) => <ContactCard key={contact.id} contact={contact} />)}</div> : <div className="grid h-[144px] place-items-center rounded-2xl bg-white p-5 text-center text-[14px] text-[#71809B]">{t("home.noContactsInCity", { city: selectedCityName })}</div>}
      </section>
      </div>
    </div>
  </div>;
}
