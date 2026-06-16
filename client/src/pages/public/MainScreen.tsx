import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { useCity } from "../../context/CityContext";
import { useCategories } from "../../context/CategoriesContext";
import { useContacts, useInfiniteContacts } from "../../hooks/useContacts";
import { useContactsData } from "../../context/ContactsContext";
import { ContactCard } from "../../components/shared/ContactCard";
import { ContributionWall } from "../../components/shared/ContributionWall";
import { CityPickerOverlay } from "../../components/shared/CityPickerOverlay";
import { CategoryIcon } from "../../components/shared/CategoryIcon";
import { OnboardingTutorial, hasCompletedOnboarding } from "../../components/shared/OnboardingTutorial";
import {
  RecentContactsShimmer,
  ContactListShimmer,
} from "../../components/shared/Shimmer";
import type { Category, City } from "../../types";

const EMERGENCY_CONTACTS = [
  {
    name: "Darurat", phone: "112", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
      </svg>
    )
  },
  {
    name: "Polisi", phone: "110", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 7v5c0 5.25 3.83 10.15 9 11 5.17-.85 9-5.75 9-11V7l-9-5z" />
      </svg>
    )
  },
  {
    name: "Ambulans", phone: "119", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 10H6m2-2v4m-2 6h12a2 2 0 002-2v-5.5a.5.5 0 00-.11-.33l-3-3.78A2 2 0 0015.33 6H4a2 2 0 00-2 2v8a2 2 0 002 2m2 0a2 2 0 104 0m-4 0h4m8 0a2 2 0 104 0" />
      </svg>
    )
  },
  {
    name: "Pemadam", phone: "113", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1012 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z" />
      </svg>
    )
  },
  {
    name: "SAR", phone: "115", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
      </svg>
    )
  },
  {
    name: "PLN", phone: "123", icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    )
  }
];

export default function MainScreen() {
  const { citySlug, city, setCity, cities, setCities } = useCity();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const headerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const chipScrollRef = useRef<HTMLDivElement>(null);

  const urlCategory = searchParams.get("category") || "";

  const urlVerified = searchParams.get("verified") || "";

  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [verifiedFilter, setVerifiedFilter] = useState(urlVerified);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const catScrollRef = useRef<HTMLDivElement>(null);
  const [catScrollProgress, setCatScrollProgress] = useState(0);

  // Close filter menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    if (showFilterMenu) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [showFilterMenu]);

  // ── Sticky search on scroll up ──
  const [showStickySearch, setShowStickySearch] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      const headerBottom = headerRef.current?.getBoundingClientRect().bottom ?? 0;
      const scrollingUp = y < lastScrollY.current;
      const pastHeader = headerBottom < 0;

      setShowStickySearch(scrollingUp && pastHeader);
      lastScrollY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Data fetching ──
  const { data: citiesData } = useQuery<{ success: boolean; data: City[] }>({
    queryKey: ["cities"],
    queryFn: async () => (await apiClient.get("/cities")).data,
  });

  useEffect(() => {
    if (citiesData?.data) setCities(citiesData.data);
  }, [citiesData, setCities]);

  const needsCityPicker = !citySlug && citiesData?.data && citiesData.data.length > 0;

  const { categories: categoriesData, isLoading: categoriesLoading } = useCategories();

  const { data: recentData, isLoading: recentLoading } = useContacts({
    city: citySlug || undefined,
    limit: 5,
  });

  // ── Infinite scroll for filtered results ──
  const isFiltered = !!activeCategory || !!verifiedFilter || showAll;

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteContacts({
    city: citySlug || undefined,
    category: activeCategory || undefined,
    verified: verifiedFilter || undefined,
    enabled: isFiltered,
  });

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { rootMargin: "200px" }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allContacts = infiniteData?.pages.flatMap((p) => p.data) ?? [];
  const total = infiniteData?.pages[0]?.meta.total ?? 0;
  const isGuestLimited = infiniteData?.pages.some((p) => p.meta.guestLimited);

  // ── URL sync ──
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (verifiedFilter) params.set("verified", verifiedFilter);
    setSearchParams(params, { replace: true });
  }, [activeCategory, verifiedFilter, setSearchParams]);

  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "");
  }, []);

  // ── Keyboard shortcut ──
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        navigate("/search");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  function handleCategoryClick(slug: string) {
    const next = activeCategory === slug ? "" : slug;
    setActiveCategory(next);

    if (next) {
      setTimeout(() => {
        if (chipScrollRef.current) {
          const container = chipScrollRef.current;
          const chip = container.querySelector(`[data-slug="${next}"]`) as HTMLElement | null;
          if (chip) {
            container.scrollTo({ left: chip.offsetLeft - 64, behavior: "smooth" });
          }
        }
        const searchNode = document.getElementById("hero-search");
        if (searchNode) {
          const y = searchNode.getBoundingClientRect().top + window.scrollY - 16;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleClearFilters() {
    setActiveCategory("");
    setVerifiedFilter("");
    setShowAll(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    const handleReset = () => handleClearFilters();
    window.addEventListener("reset-home", handleReset);
    return () => window.removeEventListener("reset-home", handleReset);
  }, []);

  function handleCitySelect(c: City) {
    setCity(c);
    setShowCityPicker(false);
    // Trigger onboarding tutorial for first-time users
    if (!hasCompletedOnboarding()) {
      setTimeout(() => setShowTutorial(true), 400);
    }
  }

  const categories = categoriesData ?? [];
  const cityPickerVisible = needsCityPicker || showCityPicker;

  // ── Derived stats (real data from the local cache, scoped to the city) ──
  const { contacts: allCachedContacts } = useContactsData();
  const { totalKontak, newThisWeek, categoryCounts } = useMemo(() => {
    const inCity = citySlug
      ? allCachedContacts.filter((c) => c.city?.slug === citySlug)
      : allCachedContacts;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const counts: Record<string, number> = {};
    let recent = 0;
    for (const c of inCity) {
      const slug = c.category?.slug;
      if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
      if (new Date(c.createdAt).getTime() >= weekAgo) recent += 1;
    }
    return { totalKontak: inCity.length, newThisWeek: recent, categoryCounts: counts };
  }, [allCachedContacts, citySlug]);

  // ── Category scroll progress ──
  useEffect(() => {
    const el = catScrollRef.current;
    if (!el) return;
    function onScroll() {
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      setCatScrollProgress(maxScroll > 0 ? el.scrollLeft / maxScroll : 0);
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [categories.length]);

  return (
    <div className="min-h-screen bg-[#F1F3EE] max-w-md mx-auto relative pb-24">
      {cityPickerVisible && (
        <CityPickerOverlay
          cities={citiesData?.data ?? cities}
          onSelect={handleCitySelect}
          onClose={citySlug ? () => setShowCityPicker(false) : undefined}
        />
      )}

      {/* Onboarding Tutorial */}
      <OnboardingTutorial
        show={showTutorial}
        onComplete={() => setShowTutorial(false)}
      />

      {/* ── Sticky search bar ── */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 max-w-md mx-auto transition-all duration-300 ${showStickySearch ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
          }`}
      >
        <div className="bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border-b border-gray-100">
          <div
            onClick={() => navigate("/search")}
            className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm cursor-pointer hover:shadow-md transition-all group"
          >
            <div className="pl-3.5 text-gray-400 group-hover:text-[#1A5B45] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="flex-1 h-9 pl-2.5 pr-2 text-[14px] text-gray-500 font-medium flex items-center truncate">Cari kontak di {city?.name ?? "sekitarmu"}...</span>

          </div>
        </div>
      </div>

      {/* ── Header ── */}
      <div ref={headerRef} className="px-5 pt-6 pb-1">
        {/* Top row: brand + help button */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-[26px] font-extrabold text-gray-900 font-display tracking-tight">
            CariKontak
          </span>
          <a
            href="https://wa.me/6282338588078?text=Permisi%20admin%20cari%20kontak%2C%20saya%20ingin%20bertanya"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-gray-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.05)] active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-bold text-gray-800">Bantuan</span>
          </a>
        </div>

        {/* Hero panel — soft green, holds location + search + stats */}
        <div className="bg-[#E4EDE3] rounded-3xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
          {/* Location selector */}
          <button onClick={() => setShowCityPicker(true)} className="flex items-center gap-2 mb-3.5 w-max active:scale-95 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span className="text-gray-900 font-bold text-lg tracking-tight">{city?.name ?? "Pilih Kota"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Search bar */}
          <div
            id="hero-search"
            onClick={() => navigate("/search")}
            className="flex items-center bg-white rounded-2xl p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] transition-shadow"
          >
            <div className="pl-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="flex-1 h-10 pl-3 pr-2 text-[15px] text-gray-400 flex items-center truncate">Cari kontak…</span>
            <button className="w-12 h-11 rounded-xl bg-primary-700 hover:bg-primary-600 flex items-center justify-center text-white active:scale-95 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-2.5 mt-3.5 px-1 text-[13px] text-gray-500">
            <span><span className="font-bold text-gray-900">{totalKontak}</span> kontak</span>
            <span className="w-1 h-1 rounded-full bg-gray-400/60" />
            <span><span className="font-bold text-gray-900">{categories.length}</span> kategori</span>
            {newThisWeek > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-gray-400/60" />
                <span><span className="font-bold text-primary-700">+{newThisWeek}</span> minggu ini</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="pt-5 px-4 relative z-20">

        {/* ── Browse mode ── */}
        {!isFiltered && (
          <>
            {/* Emergency Contacts Button */}
            <div className="mb-7 animate-fade-in-up">
              <button
                onClick={() => setShowEmergency(!showEmergency)}
                className="w-full flex items-center justify-between bg-white rounded-2xl px-3.5 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-[#FDECEC] flex items-center justify-center flex-shrink-0 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[15px] font-bold text-gray-900 tracking-tight leading-tight">Panggilan Darurat</p>
                    <p className="text-[12.5px] text-gray-400 leading-tight mt-0.5 truncate">Polisi &middot; Ambulans &middot; Damkar</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${showEmergency ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Collapsible Content */}
              <div
                className={`overflow-hidden ${showEmergency ? 'max-h-[200px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="flex gap-2.5 overflow-x-auto scrollbar-hide px-1 pb-1">
                  {EMERGENCY_CONTACTS.map((ec) => (
                    <a
                      key={ec.phone}
                      href={`tel:${ec.phone}`}
                      className="flex-shrink-0 w-[90px] flex flex-col items-center gap-2 bg-white rounded-2xl py-3.5 border border-red-50 shadow-sm shadow-red-100/50 active:scale-95 transition-transform"
                    >
                      <div className="w-[38px] h-[38px] rounded-full bg-[#FFF5F5] flex items-center justify-center flex-shrink-0 text-red-500">
                        {ec.icon}
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-gray-900 leading-tight mb-1">{ec.name}</p>
                        <p className="text-[10px] text-red-500 font-semibold leading-none">{ec.phone}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="mb-8">
              <button
                onClick={() => setShowCategories((v) => !v)}
                className="w-full flex items-center justify-between mb-3 px-1 active:opacity-70 transition-opacity"
              >
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.12em]">Kategori</h3>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${showCategories ? "" : "-rotate-90"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {showCategories && (
                categoriesLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                        <div className="w-11 h-11 rounded-xl shimmer flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-3 w-16 shimmer rounded mb-2" />
                          <div className="h-2.5 w-10 shimmer rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => handleCategoryClick(cat.slug)}
                        className="flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] group active:scale-[0.97] hover:shadow-[0_4px_12px_rgba(0,0,0,0.07)] transition-all text-left"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                          <CategoryIcon slug={cat.slug} className="w-[22px] h-[22px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[15px] font-bold text-gray-900 leading-tight truncate">{cat.name}</p>
                          <p className="text-[12.5px] text-gray-400 leading-tight mt-0.5">{categoryCounts[cat.slug] ?? 0} kontak</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Recent contacts */}
            {recentLoading ? (
              <RecentContactsShimmer />
            ) : recentData?.data && recentData.data.length > 0 ? (
              <div className="pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.12em]">
                    Terbaru
                  </h3>
                  <button
                    onClick={() => {
                      setShowAll(true);
                      setTimeout(() => {
                        const searchNode = document.getElementById("hero-search");
                        if (searchNode) {
                          const y = searchNode.getBoundingClientRect().top + window.scrollY - 16;
                          window.scrollTo({ top: y, behavior: "smooth" });
                        }
                      }, 50);
                    }}
                    className="text-[13px] font-bold text-primary-600 active:scale-95 transition-transform"
                  >
                    Lihat semua &rarr;
                  </button>
                </div>
                <div className="space-y-3">
                  {recentData.data.slice(0, 5).map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">Belum ada kontak di {city?.name ?? "kota ini"}</p>
              </div>
            )}
          </>
        )}

        {/* ── Filtered mode ── */}
        {isFiltered && (
          <div className="pt-3 pb-6">
            {/* Category chips + filter icon */}
            <div className="flex items-center gap-2 pb-3 -mx-4 px-4">
              {/* Filter icon */}
              <div ref={filterRef} className="relative flex-shrink-0">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${verifiedFilter
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500"
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                  </svg>
                </button>
                {showFilterMenu && (
                  <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 min-w-[160px]">
                    {([
                      { value: "", label: "Semua" },
                      { value: "true", label: "Terverifikasi" },
                      { value: "false", label: "Belum Verifikasi" },
                    ] as const).map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => { setVerifiedFilter(value); setShowFilterMenu(false); }}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${verifiedFilter === value ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {value === "true" && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                          </svg>
                        )}
                        {label}
                        {verifiedFilter === value && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-auto text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div ref={chipScrollRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={handleClearFilters}
                  className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${!activeCategory
                    ? "bg-primary-700 text-white shadow-sm"
                    : "bg-white text-gray-600 shadow-sm border border-gray-100"
                    }`}
                >
                  Semua
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    data-slug={cat.slug}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`flex-shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${activeCategory === cat.slug
                      ? "bg-primary-700 text-white shadow-sm"
                      : "bg-white shadow-sm border border-gray-100 text-primary-700"
                      }`}
                  >
                    <CategoryIcon slug={cat.slug} className="w-3.5 h-3.5" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Results header */}
            <p className="text-xs text-gray-500 mb-3">
              {`${total} kontak ${categories.find((c) => c.slug === activeCategory)?.name ?? ""}`}
              {city ? ` di ${city.name}` : ""}
            </p>

            {/* Contact list */}
            {isLoading ? (
              <ContactListShimmer count={4} />
            ) : (
              <>
                <div className="space-y-3">
                  {allContacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                  {allContacts.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-gray-500 text-sm">Tidak ada kontak ditemukan</p>
                      <button onClick={handleClearFilters} className="text-primary-600 text-sm font-medium mt-2">
                        Hapus filter
                      </button>
                    </div>
                  )}
                </div>

                {hasNextPage && (
                  <div ref={loadMoreRef} className="py-4">
                    {isFetchingNextPage ? (
                      <ContactListShimmer count={2} />
                    ) : (
                      <div className="h-4" />
                    )}
                  </div>
                )}

                {isGuestLimited && (
                  <div className="mt-5">
                    <ContributionWall />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
