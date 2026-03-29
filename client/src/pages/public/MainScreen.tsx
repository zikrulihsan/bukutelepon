import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { useCity } from "../../context/CityContext";
import { useContacts } from "../../hooks/useContacts";
import { ContactCard } from "../../components/shared/ContactCard";
import { ContributionWall } from "../../components/shared/ContributionWall";
import { CityPickerOverlay } from "../../components/shared/CityPickerOverlay";
import { CategoryIcon } from "../../components/shared/CategoryIcon";
import {
  RecentContactsShimmer,
  ContactListShimmer,
} from "../../components/shared/Shimmer";
import type { Category, City, Contact, PaginatedResponse } from "../../types";

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

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await apiClient.get("/categories")).data,
  });

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
  } = useInfiniteQuery<PaginatedResponse<Contact>>({
    queryKey: ["contacts-infinite", { city: citySlug, category: activeCategory, verified: verifiedFilter }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("page", String(pageParam));
      params.set("limit", "20");
      if (citySlug) params.set("city", citySlug);
      if (activeCategory) params.set("category", activeCategory);
      if (verifiedFilter) params.set("verified", verifiedFilter);
      const { data } = await apiClient.get(`/contacts?${params}`);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.meta.guestLimited) return undefined;
      if (lastPage.meta.page < lastPage.meta.totalPages) return lastPage.meta.page + 1;
      return undefined;
    },
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

    if (next && chipScrollRef.current) {
      requestAnimationFrame(() => {
        const container = chipScrollRef.current;
        if (!container) return;
        const chip = container.querySelector(`[data-slug="${next}"]`) as HTMLElement | null;
        if (chip) {
          container.scrollTo({ left: chip.offsetLeft - 20, behavior: "smooth" });
        }
      });
    }
  }

  function handleClearFilters() {
    setActiveCategory("");
    setVerifiedFilter("");
    setShowAll(false);
  }

  function handleCitySelect(c: City) {
    setCity(c);
    setShowCityPicker(false);
  }

  const categories = categoriesData?.data ?? [];
  const cityPickerVisible = needsCityPicker || showCityPicker;

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
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative pb-24">
      {cityPickerVisible && (
        <CityPickerOverlay
          cities={citiesData?.data ?? cities}
          onSelect={handleCitySelect}
          onClose={citySlug ? () => setShowCityPicker(false) : undefined}
        />
      )}

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

      {/* ── Green header ── */}
      <div ref={headerRef} className="bg-primary-900 px-5 pt-5 pb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400 opacity-10 rounded-full blur-[80px] pointer-events-none transform translate-x-1/2 -translate-y-1/3"></div>
        {/* Top row: brand + WA button */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-white font-display tracking-tight">carikontak<span className="text-[#6EE7B7]">.id</span></span>
          </div>
          <a
            href="https://wa.me/6282338588078?text=Permisi%20admin%20cari%20kontak%2C%20saya%20ingin%20bertanya"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 bg-white/5 active:scale-95 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm font-medium text-white/90">Bantuan</span>
          </a>
        </div>

        {/* Location Pill */}
        <button onClick={() => setShowCityPicker(true)} className="flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/5 w-max active:scale-95 transition-transform relative z-10">
          <div className="w-5 h-5 rounded-full bg-[#6EE7B7] flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-[#0C3B2E]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-white font-medium text-sm pr-1">{city?.name ?? "Pilih Kota"}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/60" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Headline */}
        <div className="mb-6 relative z-10">
          <h1 className="text-white font-extrabold text-3xl mb-3 font-display leading-[1.1] tracking-tight">
            Temukan kontak penting <br />di <span className="text-[#6EE7B7]">kotamu.</span>
          </h1>
        </div>

        {/* Search bar */}
        <div
          onClick={() => navigate("/search")}
          className="flex items-center bg-white rounded-full p-1 shadow-lg cursor-pointer transform hover:scale-[1.02] transition-transform relative z-10 mb-6"
        >
          <div className="pl-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="flex-1 h-12 pl-3 pr-2 text-[15px] text-gray-400 flex items-center truncate">Cari kontak di {city?.name ?? "sekitarmu"}...</span>
          <button className="w-12 h-12 rounded-full bg-primary-700 hover:bg-primary-600 flex items-center justify-center shadow-md text-white mr-0.5 active:scale-95 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="bg-gray-50 rounded-t-[2rem] -mt-6 pt-6 px-4 relative z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] min-h-screen">

        {/* ── Browse mode ── */}
        {!isFiltered && (
          <>
            {/* Emergency Contacts Button */}
            <div className="mb-6 animate-fade-in-up">
              <button
                onClick={() => setShowEmergency(!showEmergency)}
                className="w-full flex items-center justify-between bg-[#FFF5F5] border border-red-100 rounded-[14px] px-3 py-2.5 shadow-sm active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px] text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="text-[13.5px] font-bold text-red-700 tracking-tight">Panggilan Darurat Cepat</span>
                </div>
                <div className={`flex items-center justify-center ${showEmergency ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
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

            {/* Categories Grid */}
            <div className="mb-8 mt-2">
              <h3 className="text-[15px] font-bold text-gray-900 mb-4 px-1 animate-fade-in-up" style={{ animationDelay: '50ms' }}>Kategori Utama</h3>
              {categoriesLoading ? (
                <div className="grid grid-cols-4 gap-y-5 gap-x-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                      <div className="w-14 h-14 rounded-[18px] shimmer" />
                      <div className="h-2.5 w-12 shimmer rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-y-5 gap-x-2">
                  {categories.slice(0, 8).map((cat, i) => {
                    const bgColors = [
                      "bg-blue-50 text-blue-500", "bg-orange-50 text-orange-500",
                      "bg-purple-50 text-purple-500", "bg-green-50 text-green-500",
                      "bg-pink-50 text-pink-500", "bg-yellow-50 text-amber-500",
                      "bg-indigo-50 text-indigo-500", "bg-teal-50 text-teal-500"
                    ];
                    const colorClass = bgColors[i % bgColors.length];
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => handleCategoryClick(cat.slug)}
                        className="flex flex-col items-center gap-2 group active:scale-95 transition-transform animate-fade-in-up"
                        style={{ animationDelay: `${(i * 50) + 100}ms`, animationFillMode: 'both' }}
                      >
                        <div className={`w-[58px] h-[58px] rounded-[18px] ${colorClass} flex items-center justify-center transition-transform group-hover:-translate-y-1 group-hover:shadow-[0_8px_16px_rgba(0,0,0,0.06)]`}>
                          <CategoryIcon slug={cat.slug} className="w-7 h-7" />
                        </div>
                        <span className="text-[11.5px] font-medium text-gray-700 text-center leading-tight">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-2 bg-gray-100 -mx-4 mb-4" />

            {/* Recent contacts */}
            {recentLoading ? (
              <RecentContactsShimmer />
            ) : recentData?.data && recentData.data.length > 0 ? (
              <div className="pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-gray-900">
                    Terbaru di {city?.name}
                  </h3>
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-xs font-semibold text-primary-600 active:scale-95 transition-transform"
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

              <button
                onClick={handleClearFilters}
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${!activeCategory
                  ? "bg-primary-700 text-white shadow-sm"
                  : "bg-white text-gray-600 shadow-sm border border-gray-100"
                  }`}
              >
                Semua
              </button>

              <div ref={chipScrollRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
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
