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

  const { data: emergencyData } = useContacts({
    city: citySlug || undefined,
    category: "darurat",
    limit: 10,
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
        className={`fixed top-0 left-0 right-0 z-30 max-w-md mx-auto transition-transform duration-200 ${
          showStickySearch ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-primary-700 px-4 py-2.5 shadow-lg">
          <div
            onClick={() => navigate("/search")}
            className="flex items-center bg-white rounded-xl overflow-hidden cursor-pointer"
          >
            <div className="pl-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <span className="flex-1 h-9 pl-2.5 pr-3 text-sm text-gray-400 flex items-center">Cari tukang, rumah sakit, kuliner...</span>
          </div>
        </div>
      </div>

      {/* ── Green header ── */}
      <div ref={headerRef} className="bg-gradient-to-b from-primary-800 via-primary-700 to-primary-600 px-5 pt-5 pb-7 rounded-b-[2rem]">
        {/* Top row: brand + WA button */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-extrabold text-white font-display tracking-tight">BukuTelepon</span>
          <a
            href="https://wa.me/6282338588078?text=Permisi%20admin%20cari%20kontak%2C%20saya%20ingin%20bertanya"
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
        </div>

        {/* Location */}
        <button onClick={() => setShowCityPicker(true)} className="flex items-center gap-1.5 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/80" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-white font-medium text-sm">{city?.name ?? "Pilih Kota"}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white/60" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Headline */}
        <p className="text-white font-bold text-lg mb-3.5 font-display">Mau cari apa hari ini?</p>

        {/* Search bar */}
        <div
          onClick={() => navigate("/search")}
          className="flex items-center bg-white/95 rounded-2xl shadow-sm overflow-hidden cursor-pointer backdrop-blur-sm"
        >
          <div className="pl-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="flex-1 h-12 pl-3 pr-4 text-sm text-gray-400 flex items-center">Cari tukang, rumah sakit, kuliner...</span>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4">

        {/* ── Browse mode ── */}
        {!isFiltered && (
          <>
            {/* Category horizontal scroll */}
            {categoriesLoading ? (
              <div className="flex gap-3 overflow-x-auto pt-5 pb-2 -mx-4 px-4 scrollbar-hide">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-20">
                    <div className="w-16 h-16 rounded-2xl shimmer mx-auto mb-2" />
                    <div className="h-3 w-14 shimmer mx-auto rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="pt-5 pb-1">
                <div ref={catScrollRef} className="flex gap-2 overflow-x-auto -mx-4 px-4 scrollbar-hide pb-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="flex-shrink-0 flex flex-col items-center gap-1.5 w-[72px] active:scale-95 transition-transform"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-primary-700">
                        <CategoryIcon slug={cat.slug} className="w-8 h-8" />
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 text-center leading-tight line-clamp-1">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
                {/* Scroll indicator bar */}
                <div className="flex justify-center mt-2">
                  <div className="w-7 h-[6px] rounded-full bg-gray-200 relative overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full w-1/2 rounded-full bg-primary-800 transition-transform duration-150"
                      style={{ transform: `translateX(${catScrollProgress * 100}%)` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Emergency contacts */}
            {emergencyData?.data && emergencyData.data.length > 0 && (
              <div className="pt-3 pb-2">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-bold text-gray-900">Nomor Darurat</h3>
                  <button
                    onClick={() => handleCategoryClick("darurat")}
                    className="text-xs font-semibold text-primary-600 active:scale-95 transition-transform"
                  >
                    Lihat semua &rarr;
                  </button>
                </div>
                <div className="flex gap-2.5 overflow-x-auto -mx-4 px-4 scrollbar-hide pb-1">
                  {emergencyData.data.map((contact) => (
                    <a
                      key={contact.id}
                      href={`tel:${contact.phone.replace(/\D/g, "").startsWith("0") ? "+62" + contact.phone.replace(/\D/g, "").slice(1) : "+" + contact.phone.replace(/\D/g, "")}`}
                      className="flex-shrink-0 flex items-center gap-2.5 bg-red-50 rounded-2xl px-3.5 py-2.5 active:scale-[0.97] transition-transform border border-red-100"
                    >
                      <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-tight">{contact.name}</p>
                        <p className="text-[11px] text-red-600 font-semibold">{contact.phone}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

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
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    verifiedFilter
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
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${
                          verifiedFilter === value ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50"
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
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                  !activeCategory
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
                    className={`flex-shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                      activeCategory === cat.slug
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
