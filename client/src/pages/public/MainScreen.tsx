import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiBookmark, HiOutlineBookmark } from "react-icons/hi2";
import { apiClient } from "../../lib/axios";
import { useCity } from "../../context/CityContext";
import { useCategories } from "../../context/CategoriesContext";
import { useContactsData } from "../../context/ContactsContext";
import { filterContacts } from "../../lib/localContacts";
import { CityPickerOverlay } from "../../components/shared/CityPickerOverlay";
import { AllCategoriesSheet } from "../../components/shared/AllCategoriesSheet";
import { CategoryPhoto } from "../../components/shared/CategoryPhoto";
import { CategoryTile } from "../../components/shared/CategoryTile";
import { preloadAllCategoryIcons } from "../../components/shared/CategoryIcon";
import { ContactCard } from "../../components/shared/ContactCard";
import { LanguageToggle } from "../../components/shared/LanguageToggle";
import { isSaved, toggleSaved } from "../../lib/saved";
import { useI18n } from "../../i18n/LanguageContext";
import type { ApiResponse, City, Contact, HeroPromotion } from "../../types";

const CATEGORY_FALLBACK = [
  { slug: "jasa", name: "Jasa" },
  { slug: "kesehatan", name: "Kesehatan" },
  { slug: "kuliner", name: "Kuliner" },
  { slug: "penginapan", name: "Penginapan" },
  { slug: "pendidikan", name: "Pendidikan" },
  { slug: "wisata", name: "Wisata" },
  { slug: "transportasi", name: "Transportasi" },
  { slug: "darurat", name: "Darurat" },
];

const HOME_CATEGORY_ORDER = CATEGORY_FALLBACK.map((category) => category.slug);
const HOME_CATEGORY_IMAGES = [
  "/category-icons/service.webp",
  "/category-icons/health.webp",
  "/category-icons/kuliner.webp",
  "/category-icons/lodging.webp",
  "/category-icons/education.webp",
  "/category-icons/vacation.webp",
  "/category-icons/transport.webp",
];
const HOME_CRITICAL_IMAGES = [
  "/hero-sumbawa-v2.webp",
  ...HOME_CATEGORY_IMAGES,
  "/storefront/discovery-coffee.webp",
  "/storefront/discovery-souvenir.webp",
  "/storefront/discovery-delivery.webp",
];
const HOME_READY_STORAGE_KEY = "ck_home_ready_v1";
const CITY_HINT_STORAGE_KEY = "ck_city_picker_hint_seen_v1";

interface LocalizedHeroSlide {
  id: string;
  title: string;
  highlight: string;
  description: string;
  imageUrl: string;
  href: string;
}

function fillCityToken(value: string | null | undefined, city: string): string {
  return (value ?? "").replace(/\{city\}/g, city);
}

function preloadImage(source: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    const decodeAndFinish = () => {
      if (typeof image.decode === "function") {
        void image.decode().catch(() => undefined).finally(finish);
      } else {
        finish();
      }
    };

    image.decoding = "async";
    image.onload = decodeAndFinish;
    image.onerror = finish;
    image.src = source;
    if (image.complete) decodeAndFinish();
  });
}

function PinIcon({ className = "" }: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;
}

function HomeInitialLoader({ label }: { label: string }) {
  return <div className="fixed inset-0 z-[100] grid min-h-[100dvh] place-items-center bg-[radial-gradient(circle_at_50%_38%,rgba(218,240,226,.95),transparent_34%),#F8FAF7] px-6" role="status" aria-live="polite" aria-label={label}>
    <div className="flex flex-col items-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-[22px] bg-primary-700 text-white shadow-[0_10px_24px_rgba(0,105,75,.22)]">
        <PinIcon className="h-8 w-8" />
      </div>
      <p className="mt-4 text-[25px] font-extrabold tracking-[-0.055em] text-[#08234B]">CariKontak</p>
      <div className="mt-4 h-1.5 w-28 overflow-hidden rounded-full bg-[#DDEBE2]">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-primary-700" />
      </div>
      <p className="mt-3 text-[13px] font-semibold text-[#71809B]">{label}</p>
    </div>
  </div>;
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
    <img src={imageUrl} alt="" aria-hidden="true" loading="eager" decoding="async" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" style={{ objectPosition: imagePosition }} />
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
  const { categoryName, lang, t } = useI18n();
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showCityHint, setShowCityHint] = useState(() => {
    try {
      return localStorage.getItem(CITY_HINT_STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const [showEmergency, setShowEmergency] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [query, setQuery] = useState("");
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [carouselHovered, setCarouselHovered] = useState(false);
  const [carouselFocused, setCarouselFocused] = useState(false);
  const [carouselPointerActive, setCarouselPointerActive] = useState(false);
  const [heroTrackPosition, setHeroTrackPosition] = useState(0);
  const [heroDragOffset, setHeroDragOffset] = useState(0);
  const [heroTrackTransition, setHeroTrackTransition] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(() => document.visibilityState === "visible");
  const [reduceMotion, setReduceMotion] = useState(false);
  const swipeStartRef = useRef<{ x: number; y: number; startedAt: number; moved: boolean } | null>(null);
  const suppressHeroClickRef = useRef(false);
  const carouselPaused = carouselHovered || carouselFocused || carouselPointerActive;
  const [gateInitialRender] = useState(() => {
    try {
      return sessionStorage.getItem(HOME_READY_STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const [criticalImagesReady, setCriticalImagesReady] = useState(false);
  const [minimumLoaderElapsed, setMinimumLoaderElapsed] = useState(!gateInitialRender);
  const [loaderDeadlineReached, setLoaderDeadlineReached] = useState(false);
  const { data: citiesData, isLoading: citiesLoading } = useQuery<{ success: boolean; data: City[] }>({ queryKey: ["cities"], queryFn: async () => (await apiClient.get("/cities")).data });
  const { data: heroPromotionsData } = useQuery<ApiResponse<HeroPromotion[]>>({
    queryKey: ["hero-promotions"],
    queryFn: async () => (await apiClient.get("/hero-promotions")).data,
    staleTime: 60_000,
    retry: 1,
  });

  useEffect(() => {
    let active = true;
    void Promise.all(HOME_CRITICAL_IMAGES.map(preloadImage)).then(() => {
      if (active) setCriticalImagesReady(true);
    });
    return () => { active = false; };
  }, []);

  // Warm every category artwork while the user is still on the homepage.
  // Contact cards reuse these same local URLs when a category is opened.
  useEffect(() => {
    void preloadAllCategoryIcons();
  }, []);

  useEffect(() => {
    if (!gateInitialRender) return;
    const minimumTimer = window.setTimeout(() => setMinimumLoaderElapsed(true), 450);
    const deadlineTimer = window.setTimeout(() => setLoaderDeadlineReached(true), 8000);
    return () => {
      window.clearTimeout(minimumTimer);
      window.clearTimeout(deadlineTimer);
    };
  }, [gateInitialRender]);

  useEffect(() => { if (citiesData?.data) setCities(citiesData.data); }, [citiesData, setCities]);
  const { contacts: allContacts, isLoading: contactsLoading } = useContactsData();
  const contacts = useMemo(
    () => filterContacts(allContacts, { city: citySlug || undefined }),
    [allContacts, citySlug]
  );
  const contactsWithPhotos = contacts.filter((contact) => Boolean(contact.imageUrl?.trim()));
  const contactsWithoutPhotos = contacts.filter((contact) => !contact.imageUrl?.trim());
  // Use the whole city's collection before selecting six cards. Photos make the
  // recommendation carousel more useful, while verified contacts still lead
  // within each group.
  const recommendedContacts = [
    ...contactsWithPhotos.filter((contact) => contact.isVerified),
    ...contactsWithPhotos.filter((contact) => !contact.isVerified),
    ...contactsWithoutPhotos.filter((contact) => contact.isVerified),
    ...contactsWithoutPhotos.filter((contact) => !contact.isVerified),
  ].slice(0, 6);
  const displayCategories = HOME_CATEGORY_ORDER.map((slug) => {
    const category = categories.find((item) => item.slug === slug)
      ?? CATEGORY_FALLBACK.find((item) => item.slug === slug);
    return { slug, name: categoryName(category) };
  });
  const categoryTiles = [
    ...displayCategories.slice(0, 7),
    { slug: "all", name: t("home.seeAll") },
  ];
  const selectedCityName = city?.name ?? "Sumbawa Besar";
  const heroSlides = useMemo<LocalizedHeroSlide[]>(() => {
    if (!heroPromotionsData?.data.length) {
      return [{
        id: "fallback",
        title: t("home.heroTitleFirst"),
        highlight: t("home.heroTitleAccent", { city: selectedCityName }),
        description: t("home.heroSubtitle"),
        imageUrl: "/hero-sumbawa-v2.webp",
        href: "/search",
      }];
    }

    return heroPromotionsData.data.map((promotion) => ({
      id: promotion.id,
      title: fillCityToken(lang === "en" && promotion.titleEn?.trim() ? promotion.titleEn : promotion.title, selectedCityName),
      highlight: fillCityToken(lang === "en" && promotion.highlightEn?.trim() ? promotion.highlightEn : promotion.highlight, selectedCityName),
      description: fillCityToken(lang === "en" && promotion.descriptionEn?.trim() ? promotion.descriptionEn : promotion.description, selectedCityName),
      imageUrl: promotion.imageUrl,
      href: promotion.href,
    }));
  }, [heroPromotionsData, lang, selectedCityName, t]);
  const carouselSlides = useMemo(() => {
    if (heroSlides.length < 2) return heroSlides.map((slide, logicalIndex) => ({ slide, logicalIndex, clone: false, key: slide.id }));
    return [
      { slide: heroSlides[heroSlides.length - 1], logicalIndex: heroSlides.length - 1, clone: true, key: `clone-start-${heroSlides[heroSlides.length - 1].id}` },
      ...heroSlides.map((slide, logicalIndex) => ({ slide, logicalIndex, clone: false, key: slide.id })),
      { slide: heroSlides[0], logicalIndex: 0, clone: true, key: `clone-end-${heroSlides[0].id}` },
    ];
  }, [heroSlides]);
  const heroTrackTransform = `translate3d(calc(-${heroTrackPosition * 100}% + ${heroDragOffset}px), 0, 0)`;
  const initialDataReady = !contactsLoading && !categoriesLoading && !citiesLoading;
  const initialAssetsReady = criticalImagesReady || loaderDeadlineReached;
  const showInitialLoader = gateInitialRender && (!minimumLoaderElapsed || !initialAssetsReady || (!initialDataReady && !loaderDeadlineReached));
  const goToSearch = (keyword = query) => { const value = keyword.trim(); navigate(value ? `/search?q=${encodeURIComponent(value)}` : "/search"); };
  const chooseCity = (nextCity: City) => { setCity(nextCity); setShowCityPicker(false); };
  const openCityPicker = () => {
    setShowCityPicker(true);
    setShowCityHint(false);
    try {
      localStorage.setItem(CITY_HINT_STORAGE_KEY, "1");
    } catch {
      // The city picker remains available when storage is unavailable.
    }
  };
  const discoveryTopics = [
    { id: "coffee", title: t("home.discoveryCoffeeTitle"), description: t("home.discoveryCoffeeDescription"), imageUrl: "/storefront/discovery-coffee.webp", href: "/search?q=kopi" },
    { id: "souvenirs", title: t("home.discoverySouvenirTitle"), description: t("home.discoverySouvenirDescription"), imageUrl: "/storefront/discovery-souvenir.webp", href: "/search?q=oleh-oleh" },
    { id: "travel", title: t("home.discoveryTravelTitle"), description: t("home.discoveryTravelDescription"), imageUrl: "/hero-sumbawa-v2.webp", imagePosition: "62% center", href: "/search?q=travel" },
    { id: "delivery", title: t("home.discoveryDeliveryTitle"), description: t("home.discoveryDeliveryDescription"), imageUrl: "/storefront/discovery-delivery.webp", imagePosition: "68% center", href: "/search?category=jasa" },
  ];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setDocumentVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    setHeroTrackTransition(false);
    setHeroDragOffset(0);
    setActiveHeroSlide(0);
    setHeroTrackPosition(heroSlides.length > 1 ? 1 : 0);
    const frame = window.requestAnimationFrame(() => setHeroTrackTransition(true));
    return () => window.cancelAnimationFrame(frame);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length < 2 || carouselPaused || !documentVisible || reduceMotion) return;
    const timer = window.setInterval(() => {
      setHeroTrackTransition(true);
      setHeroDragOffset(0);
      setHeroTrackPosition((current) => current + 1);
      setActiveHeroSlide((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [carouselPaused, documentVisible, heroSlides.length, reduceMotion]);

  useEffect(() => {
    if (heroSlides.length < 2) return;
    const next = heroSlides[(activeHeroSlide + 1) % heroSlides.length];
    const image = new Image();
    image.decoding = "async";
    image.src = next.imageUrl;
  }, [activeHeroSlide, heroSlides]);

  const moveHeroSlide = (direction: -1 | 1) => {
    if (heroSlides.length < 2) return;
    const next = (activeHeroSlide + direction + heroSlides.length) % heroSlides.length;
    setHeroTrackTransition(!reduceMotion);
    setHeroDragOffset(0);
    setHeroTrackPosition(reduceMotion ? next + 1 : heroTrackPosition + direction);
    setActiveHeroSlide(next);
  };

  const goToHeroSlide = (index: number) => {
    setHeroTrackTransition(!reduceMotion);
    setHeroDragOffset(0);
    setHeroTrackPosition(heroSlides.length > 1 ? index + 1 : 0);
    setActiveHeroSlide(index);
  };

  const handleHeroTrackTransitionEnd = () => {
    if (heroSlides.length < 2) return;
    if (heroTrackPosition !== 0 && heroTrackPosition !== heroSlides.length + 1) return;
    setHeroTrackTransition(false);
    setHeroTrackPosition(heroTrackPosition === 0 ? heroSlides.length : 1);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => setHeroTrackTransition(true)));
  };

  const openHeroSlide = (slide: LocalizedHeroSlide) => {
    if (/^\/(?!\/)/.test(slide.href)) {
      navigate(slide.href);
    } else {
      window.open(slide.href, "_blank", "noopener,noreferrer");
    }
  };

  const handleHeroPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    swipeStartRef.current = { x: event.clientX, y: event.clientY, startedAt: performance.now(), moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setHeroTrackTransition(false);
    setCarouselPointerActive(true);
  };

  const handleHeroPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    if (!start) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (!start.moved && Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 8) return;
    if (Math.abs(deltaX) > 6) start.moved = true;
    if (start.moved) setHeroDragOffset(deltaX);
  };

  const finishHeroPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    setCarouselPointerActive(false);
    setHeroTrackTransition(!reduceMotion);
    setHeroDragOffset(0);
    if (!start) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    const elapsed = Math.max(1, performance.now() - start.startedAt);
    const velocity = Math.abs(deltaX) / elapsed;
    if (start.moved) {
      suppressHeroClickRef.current = true;
      window.setTimeout(() => { suppressHeroClickRef.current = false; }, 0);
    }
    if (heroSlides.length > 1 && Math.abs(deltaX) > Math.abs(deltaY) && (Math.abs(deltaX) > 45 || velocity > 0.45)) {
      moveHeroSlide(deltaX < 0 ? 1 : -1);
    }
  };

  const cancelHeroPointer = () => {
    swipeStartRef.current = null;
    setCarouselPointerActive(false);
    setHeroTrackTransition(!reduceMotion);
    setHeroDragOffset(0);
  };

  useEffect(() => {
    if (showInitialLoader) return;
    try {
      sessionStorage.setItem(HOME_READY_STORAGE_KEY, "1");
    } catch {
      // The loader still works when session storage is unavailable.
    }
  }, [showInitialLoader]);

  if (showInitialLoader) return <HomeInitialLoader label={t("common.loading")} />;

  return <div className="min-h-screen bg-[radial-gradient(circle_at_30%_8%,rgba(226,241,231,.62),transparent_26%),#F8FAF7] pb-[82px] text-[#08234B]">
    {showCityPicker && <CityPickerOverlay cities={citiesData?.data ?? cities} onSelect={chooseCity} onClose={() => setShowCityPicker(false)} />}
    <div className="mx-auto max-w-md overflow-x-hidden bg-[#F8FAF7] sm:shadow-[0_0_24px_rgba(15,47,45,0.06)]">
      <section
        className="relative h-[260px] overflow-visible bg-[#E6F2E9]"
        role="region"
        aria-roledescription="carousel"
        aria-label={t("home.heroCarouselLabel")}
        onMouseEnter={() => setCarouselHovered(true)}
        onMouseLeave={() => setCarouselHovered(false)}
        onFocusCapture={() => setCarouselFocused(true)}
        onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setCarouselFocused(false); }}
      >
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            className={`flex h-full will-change-transform ${heroTrackTransition && !reduceMotion ? "transition-transform duration-500 ease-[cubic-bezier(.22,.61,.36,1)]" : ""}`}
            style={{ transform: heroTrackTransform }}
          >
            {carouselSlides.map(({ slide, key }, index) => <div key={key} className="h-full w-full shrink-0">
              <img
                src={slide.imageUrl}
                alt=""
                loading={index <= 2 ? "eager" : "lazy"}
                fetchPriority={index === (heroSlides.length > 1 ? 1 : 0) ? "high" : "auto"}
                decoding="async"
                onError={(event) => {
                  if (!event.currentTarget.src.endsWith("/hero-sumbawa-v2.webp")) event.currentTarget.src = "/hero-sumbawa-v2.webp";
                }}
                className="h-full w-full object-cover object-[58%_center]"
              />
            </div>)}
          </div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,251,247,.97)_0%,rgba(240,249,242,.88)_49%,rgba(229,244,234,.30)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(238,248,241,.97)_0%,rgba(238,248,241,.12)_48%,rgba(246,251,247,.32)_100%)]" />

        <div className="relative z-10 flex h-full flex-col px-4 pb-0 pt-4">
          <div className="relative z-30 flex items-center justify-between gap-2">
            <div className="relative min-w-0 flex-1">
              <button type="button" onClick={openCityPicker} aria-describedby={showCityHint ? "city-picker-hint" : undefined} className="flex h-10 w-full min-w-0 items-center gap-2 rounded-[14px] border border-white/75 bg-white/72 px-3 text-left shadow-[0_2px_10px_rgba(9,60,45,.08)] backdrop-blur-sm transition active:scale-[0.98]">
                <PinIcon className="h-[18px] w-[18px] shrink-0 text-primary-700" />
                <span className="truncate text-[14px] font-bold leading-none tracking-[-0.035em] text-[#08234B]">{selectedCityName}</span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="ml-auto h-4 w-4 shrink-0 text-primary-700"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.09 1.03l-4.25 4.5a.75.75 0 01-1.09 0l-4.25-4.5a.75.75 0 01.02-1.05z" clipRule="evenodd" /></svg>
              </button>
              {showCityHint && (
                <div id="city-picker-hint" role="tooltip" className="absolute left-0 top-12 z-40 w-[230px] rounded-xl bg-[#08234B] px-3 py-2.5 text-[11px] font-semibold leading-4 text-white shadow-[0_8px_24px_rgba(8,35,75,.24)]">
                  <span className="absolute -top-1.5 left-5 h-3 w-3 rotate-45 bg-[#08234B]" aria-hidden="true" />
                  <span className="relative">{t("city.pickerHint", { city: selectedCityName })}</span>
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2"><LanguageToggle className="shadow-[0_3px_9px_rgba(4,44,37,0.06)]" /><a href={`https://wa.me/6282338588078?text=${encodeURIComponent(t("home.helpWhatsappText"))}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/95 px-3 text-[13px] font-extrabold text-[#08234B] shadow-[0_3px_9px_rgba(4,44,37,0.10)] transition active:scale-95"><ChatIcon className="h-[18px] w-[18px]" /><span className="hidden min-[390px]:inline">{t("home.help")}</span></a></div>
          </div>

          <div
            className="relative min-h-0 flex-1 touch-pan-y overflow-hidden"
            onPointerDown={handleHeroPointerDown}
            onPointerMove={handleHeroPointerMove}
            onPointerUp={finishHeroPointer}
            onPointerCancel={cancelHeroPointer}
          >
            <div
              onTransitionEnd={handleHeroTrackTransitionEnd}
              className={`flex h-full will-change-transform ${heroTrackTransition && !reduceMotion ? "transition-transform duration-500 ease-[cubic-bezier(.22,.61,.36,1)]" : ""}`}
              style={{ transform: heroTrackTransform }}
            >
              {carouselSlides.map(({ slide, logicalIndex, clone, key }) => <div
                key={key}
                role={clone ? undefined : "link"}
                tabIndex={!clone && logicalIndex === activeHeroSlide ? 0 : -1}
                aria-hidden={clone || logicalIndex !== activeHeroSlide}
                aria-label={clone ? undefined : t("home.heroSlideLabel", { current: logicalIndex + 1, total: heroSlides.length, title: `${slide.title} ${slide.highlight}`.trim() })}
                onClick={() => {
                  if (!clone && !suppressHeroClickRef.current && logicalIndex === activeHeroSlide) openHeroSlide(slide);
                }}
                onKeyDown={(event) => {
                  if (clone) return;
                  if (event.key === "ArrowLeft") { event.preventDefault(); moveHeroSlide(-1); }
                  if (event.key === "ArrowRight") { event.preventDefault(); moveHeroSlide(1); }
                  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openHeroSlide(slide); }
                }}
                className={`flex h-full w-full shrink-0 flex-col justify-center pb-2 pt-2 outline-none ${!clone && logicalIndex === activeHeroSlide ? "cursor-grab focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-600 active:cursor-grabbing" : "pointer-events-none"}`}
              >
                <div className="max-w-[320px] rounded-2xl">
                  <h1 className="text-[29px] font-extrabold leading-[35px] tracking-[-0.06em] text-[#071F43]"><span className="block truncate">{slide.title}</span>{slide.highlight && <span className="block truncate text-primary-700">{slide.highlight}</span>}</h1>
                  <p className="mt-2 line-clamp-2 max-w-[310px] text-[13.5px] font-medium leading-5 tracking-[-0.025em] text-[#53667F]">{slide.description}</p>
                </div>
              </div>)}
            </div>
          </div>

          {heroSlides.length > 1 && <div className="absolute bottom-[50px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-1" role="group" aria-label={t("home.heroCarouselLabel")}>
            {heroSlides.map((slide, index) => <button key={slide.id} type="button" onClick={() => goToHeroSlide(index)} aria-label={t("home.heroGoToSlide", { number: index + 1 })} aria-current={index === activeHeroSlide ? "true" : undefined} className={`h-1.5 rounded-full ${reduceMotion ? "" : "transition-all"} ${index === activeHeroSlide ? "w-4 bg-primary-700" : "w-1.5 bg-[#8CA99B]/65 hover:bg-[#668B79]"}`} />)}
          </div>}

          <form onSubmit={(event) => { event.preventDefault(); goToSearch(); }} className="relative z-30 mt-auto flex h-14 translate-y-1/2 items-center rounded-[18px] bg-white p-1 shadow-[0_5px_14px_rgba(21,66,53,0.13)]">
            <SearchIcon className="ml-3 h-6 w-6 shrink-0 text-[#8998B1]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("home.heroSearchPlaceholder")} className="min-w-0 flex-1 bg-transparent px-3 text-[16px] font-medium tracking-[-0.035em] text-[#08234B] outline-none placeholder:text-[#8D99AE]" />
            <button aria-label="Cari" type="submit" className="grid h-12 w-14 shrink-0 place-items-center rounded-[15px] bg-primary-700 text-white shadow-[0_3px_8px_rgba(0,111,74,0.24)] transition hover:bg-primary-600 active:scale-95"><ArrowIcon className="h-6 w-6" /></button>
          </form>
        </div>
      </section>

      <div className="px-4 pt-7">

      <section className="mt-6">
        <div className="grid grid-cols-4 gap-2.5">{categoriesLoading ? Array.from({ length: 8 }).map((_, index) => <div key={index} className="h-[86px] rounded-[16px] shimmer" />) : categoryTiles.map((category) => <CategoryTile key={category.slug} slug={category.slug} name={category.name} onClick={() => category.slug === "all" ? setShowAllCategories(true) : navigate(`/search?category=${encodeURIComponent(category.slug)}`)} />)}</div>
      </section>

      <section className="mt-5">
        <button type="button" onClick={() => setShowEmergency((value) => !value)} className="flex h-16 w-full items-center justify-between rounded-2xl bg-[linear-gradient(105deg,#fff7f7,#fff2f5)] px-3 text-left shadow-[0_3px_9px_rgba(126,52,67,0.07)] transition active:scale-[0.99]"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFE0E0]"><SirenIcon className="h-7 w-7" /></span><span><span className="block text-[15px] font-extrabold leading-5 tracking-[-0.035em] text-[#08234B]">{t("home.emergencyTitle")}</span><span className="block text-[12px] font-medium leading-4 text-[#8190AA]">{t("home.emergencySubtitle")}</span></span></span><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className={`h-5 w-5 text-[#95A0B8] transition-transform ${showEmergency ? "rotate-180" : ""}`} aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg></button>
        {showEmergency && <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl bg-white p-2 shadow-[0_3px_9px_rgba(15,47,45,0.07)]">{[{ label: t("emergency.emergency"), query: "darurat" }, { label: t("emergency.fire"), query: "damkar" }, { label: t("emergency.ambulance"), query: "ambulans" }, { label: t("emergency.police"), query: "polisi" }].map((item) => <button key={item.query} type="button" onClick={() => navigate(`/search?q=${encodeURIComponent(item.query)}`)} className="rounded-[10px] bg-[#F7F9F5] px-3 py-3 text-center text-[13px] font-bold text-[#08234B] transition hover:bg-[#EEF6F0] active:scale-[0.98]">{item.label}</button>)}</div>}
      </section>

      <section className="mt-7">
        <SectionHeading title={t("home.whatsInCity", { city: selectedCityName })} />
        <div className="-mr-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-3 pr-4 scrollbar-hide">{discoveryTopics.map((topic) => <DiscoveryPoster key={topic.id} title={topic.title} description={topic.description} imageUrl={topic.imageUrl} imagePosition={topic.imagePosition} onOpen={() => navigate(topic.href)} />)}</div>
      </section>

      {recommendedContacts.length > 0 && <section className="mt-7">
        <SectionHeading title={t("home.carikontakRecommendations")} onMore={() => navigate("/search?all=1")} />
        <div className="-mr-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 pr-4 scrollbar-hide">{recommendedContacts.map((contact) => <ChoiceCard key={contact.id} contact={contact} categoryLabel={categoryName(contact.category)} cityName={selectedCityName} viewLabel={t("home.view")} onOpen={() => navigate(`/kontak/${contact.id}`)} />)}</div>
      </section>}

      <section className="mt-5">
        <button type="button" onClick={() => navigate("/jastip-kontak")} className="relative flex min-h-[112px] w-full items-center overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_95%_0%,rgba(160,220,255,.7),transparent_36%),linear-gradient(120deg,#EAF4FF,#E8F8F0)] px-4 py-4 text-left shadow-[0_5px_13px_rgba(16,67,91,.08)] active:scale-[.99]">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/85 text-primary-700 shadow-[0_5px_12px_rgba(16,67,91,.10)]"><SearchIcon className="h-6 w-6" /></span>
          <span className="ml-3 min-w-0 flex-1"><span className="block text-[16px] font-extrabold leading-5 tracking-[-.04em] text-[#08234B]">{t("home.conciergeTitle")}</span><span className="mt-1 block text-[11.5px] font-medium leading-4 text-[#667990]">{t("home.conciergeDescription")}</span><span className="mt-2 inline-flex items-center gap-1 text-[12px] font-extrabold text-primary-700">{t("home.conciergeAction")} <ArrowIcon className="h-3.5 w-3.5" /></span></span>
        </button>
      </section>

      <section className="mt-8">
        <SectionHeading title={t("home.latestInCariKontak")} onMore={() => navigate("/search?all=1")} />
        {contactsLoading ? <div className="space-y-3"><div className="h-[160px] rounded-2xl shimmer" /><div className="h-[160px] rounded-2xl shimmer" /></div> : contacts.length ? <div className="space-y-3">{contacts.slice(0, 3).map((contact) => <ContactCard key={contact.id} contact={contact} />)}</div> : <div className="grid h-[144px] place-items-center rounded-2xl bg-white p-5 text-center text-[14px] text-[#71809B]">{t("home.noContactsInCity", { city: selectedCityName })}</div>}
      </section>

      <section className="mb-5 mt-8 relative min-h-[170px] overflow-hidden rounded-2xl bg-[radial-gradient(circle_at_92%_12%,#15795c,transparent_32%),linear-gradient(120deg,#003f32,#007352)] px-4 py-4 text-white shadow-[0_6px_13px_rgba(0,91,69,0.20)]"><div className="relative z-10 max-w-[235px]"><h2 className="text-[20px] font-extrabold leading-6 tracking-[-0.045em]">{t("home.businessPromoTitle", { city: selectedCityName })}</h2><p className="mt-1 text-[13px] leading-[18px] text-white/90">{t("home.businessPromoDescription")}</p><Link to="/buat-katalog" className="mt-3 inline-flex h-10 min-w-[150px] items-center justify-center rounded-xl bg-white px-4 text-[13px] font-extrabold text-primary-700 transition active:scale-95">{t("home.businessPromoAction")}</Link></div><StoreIllustration /></section>
      </div>
      <AllCategoriesSheet open={showAllCategories} onClose={() => setShowAllCategories(false)} onSelect={(slug) => { setShowAllCategories(false); navigate(`/search?category=${encodeURIComponent(slug)}`); }} />
    </div>
  </div>;
}
