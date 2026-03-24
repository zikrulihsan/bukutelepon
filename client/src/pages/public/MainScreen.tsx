import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { useCity } from "../../context/CityContext";
import { useAuth } from "../../hooks/useAuth";
import { useContacts } from "../../hooks/useContacts";
import { ContactCard } from "../../components/shared/ContactCard";
import { ContributionWall } from "../../components/shared/ContributionWall";
import { CityPickerOverlay } from "../../components/shared/CityPickerOverlay";
import { CategoryIcon } from "../../components/shared/CategoryIcon";
import {
  CategoryGridShimmer,
  EmergencyStripShimmer,
  RecentContactsShimmer,
  ContactListShimmer,
} from "../../components/shared/Shimmer";
import type { Category, City, Contact, PaginatedResponse } from "../../types";

export default function MainScreen() {
  const { citySlug, city, setCity, cities, setCities } = useCity();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const stickySearchRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const chipScrollRef = useRef<HTMLDivElement>(null);

  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("q") || "";

  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [search, setSearch] = useState(urlSearch);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showAll, setShowAll] = useState(false);

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

  const { data: emergencyData, isLoading: emergencyLoading } = useContacts({
    city: citySlug || undefined,
    category: "darurat",
    limit: 5,
  });

  const { data: recentData, isLoading: recentLoading } = useContacts({
    city: citySlug || undefined,
    limit: 5,
  });

  // ── Infinite scroll for filtered results ──
  const isFiltered = !!activeCategory || !!searchQuery || showAll;

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<PaginatedResponse<Contact>>({
    queryKey: ["contacts-infinite", { city: citySlug, category: activeCategory, search: searchQuery }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("page", String(pageParam));
      params.set("limit", "20");
      if (citySlug) params.set("city", citySlug);
      if (activeCategory) params.set("category", activeCategory);
      if (searchQuery) params.set("search", searchQuery);
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
    if (searchQuery) params.set("q", searchQuery);
    setSearchParams(params, { replace: true });
  }, [activeCategory, searchQuery, setSearchParams]);

  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "");
    const q = searchParams.get("q") || "";
    setSearch(q);
    setSearchQuery(q);
  }, []);

  // ── Keyboard shortcut ──
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        (showStickySearch ? stickySearchRef : searchRef).current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showStickySearch]);

  // ── Handlers ──
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(search.trim());
  }

  function handleCategoryClick(slug: string) {
    const next = activeCategory === slug ? "" : slug;
    setActiveCategory(next);
    setSearchQuery("");
    setSearch("");

    // Scroll selected chip to the left edge
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
    setSearchQuery("");
    setSearch("");
    setShowAll(false);
  }

  function handleCitySelect(c: City) {
    setCity(c);
    setShowCityPicker(false);
  }

  const categories = categoriesData?.data ?? [];
  const emergencyContacts = emergencyData?.data ?? [];
  const cityPickerVisible = needsCityPicker || showCityPicker;

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto relative">
      {cityPickerVisible && (
        <CityPickerOverlay
          cities={citiesData?.data ?? cities}
          onSelect={handleCitySelect}
          onClose={citySlug ? () => setShowCityPicker(false) : undefined}
        />
      )}

      {/* ── Sticky search bar (appears on scroll up) ── */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 max-w-md mx-auto transition-transform duration-200 ${
          showStickySearch ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-primary-700 px-4 py-2.5 shadow-lg">
          <form onSubmit={handleSearch} className="flex items-center bg-white rounded-xl overflow-hidden">
            <div className="pl-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={stickySearchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kontak..."
              className="flex-1 h-9 pl-2.5 pr-3 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
            />
          </form>
        </div>
      </div>

      {/* ── Green header ── */}
      <div ref={headerRef} className="bg-gradient-to-b from-primary-700 to-primary-600 px-4 pt-3 pb-5 rounded-b-3xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setShowCityPicker(true)} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-white/70 text-[10px] leading-tight">Lokasi kamu</div>
              <div className="text-white font-semibold text-sm leading-tight flex items-center gap-1">
                {city?.name ?? "Pilih Kota"}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white/70" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {authLoading ? null : user ? (
              <>
                <Link to="/submit" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" title="Tambah Kontak">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </Link>
                {profile?.role === "ADMIN" && (
                  <Link to="/admin" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" title="Admin">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                )}
                <button onClick={signOut} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" title="Keluar">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            ) : (
              <Link to="/login" className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center" title="Masuk">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="pl-3.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari kontak, rumah sakit, kantor..."
              className="flex-1 h-11 pl-3 pr-4 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
            />
          </div>
        </form>
      </div>

      {/* ── Content ── */}
      <div className="px-4 -mt-1">

        {/* Emergency strip */}
        {!isFiltered && emergencyLoading && <EmergencyStripShimmer />}
        {!isFiltered && !emergencyLoading && emergencyContacts.length > 0 && (
          <div className="mt-4 mb-2">
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
              {emergencyContacts.map((contact) => (
                <a
                  key={contact.id}
                  href={`tel:${contact.phone.replace(/\D/g, "")}`}
                  className="flex-shrink-0 flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-2xl px-3.5 py-2.5 active:scale-[0.98] transition-transform"
                >
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900 whitespace-nowrap">{contact.name}</div>
                    <div className="text-[11px] text-red-600 font-medium">{contact.phone}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Browse mode ── */}
        {!isFiltered && (
          <>
            {/* Category grid */}
            {categoriesLoading ? (
              <CategoryGridShimmer />
            ) : (
              <div className="mt-4 mb-6">
                <div className="grid grid-cols-4 gap-y-4 gap-x-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-primary-700">
                        <CategoryIcon slug={cat.slug} />
                      </div>
                      <span className="text-[11px] font-medium text-gray-700 text-center leading-tight line-clamp-2">
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-2 bg-gray-100 -mx-4 mb-4 rounded-sm" />

            {/* Recent contacts */}
            {recentLoading ? (
              <RecentContactsShimmer />
            ) : recentData?.data && recentData.data.length > 0 ? (
              <div className="pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Terbaru di {city?.name}
                  </h3>
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-xs font-semibold text-primary-600 hover:text-primary-800 active:scale-95 transition-transform"
                  >
                    Lihat semua →
                  </button>
                </div>
                <div className="space-y-2.5">
                  {recentData.data.slice(0, 5).map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}

        {/* ── Filtered mode ── */}
        {isFiltered && (
          <div className="pt-3 pb-6">
            {/* Category chips */}
            <div ref={chipScrollRef} className="flex items-center gap-2 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide">
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
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  data-slug={cat.slug}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`flex-shrink-0 inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors ${
                    activeCategory === cat.slug
                      ? "bg-primary-700 text-white shadow-sm"
                      : "bg-white text-gray-600 shadow-sm border border-gray-100 text-primary-700"
                  }`}
                >
                  <CategoryIcon slug={cat.slug} className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Results header */}
            <p className="text-xs text-gray-500 mb-3">
              {searchQuery
                ? `Hasil pencarian "${searchQuery}"`
                : `${total} kontak ${categories.find((c) => c.slug === activeCategory)?.name ?? ""}`}
              {city ? ` di ${city.name}` : ""}
            </p>

            {/* Contact list — lazy loaded */}
            {isLoading ? (
              <ContactListShimmer count={4} />
            ) : (
              <>
                <div className="space-y-2.5">
                  {allContacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                  ))}
                  {allContacts.length === 0 && (
                    <div className="text-center py-16">
                      <div className="text-3xl mb-3">🔍</div>
                      <p className="text-gray-500 text-sm">Tidak ada kontak ditemukan</p>
                      <button onClick={handleClearFilters} className="text-primary-600 text-sm font-medium mt-2">
                        Hapus filter
                      </button>
                    </div>
                  )}
                </div>

                {/* Infinite scroll trigger */}
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
