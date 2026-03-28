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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

export default function MainScreen() {
  const { citySlug, city, setCity, cities, setCities } = useCity();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const headerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const chipScrollRef = useRef<HTMLDivElement>(null);

  const urlCategory = searchParams.get("category") || "";

  const [activeCategory, setActiveCategory] = useState(urlCategory);
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

  const { data: recentData, isLoading: recentLoading } = useContacts({
    city: citySlug || undefined,
    limit: 5,
  });

  // ── Infinite scroll for filtered results ──
  const isFiltered = !!activeCategory || showAll;

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<PaginatedResponse<Contact>>({
    queryKey: ["contacts-infinite", { city: citySlug, category: activeCategory }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("page", String(pageParam));
      params.set("limit", "20");
      if (citySlug) params.set("city", citySlug);
      if (activeCategory) params.set("category", activeCategory);
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
    setSearchParams(params, { replace: true });
  }, [activeCategory, setSearchParams]);

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
    setShowAll(false);
  }

  function handleCitySelect(c: City) {
    setCity(c);
    setShowCityPicker(false);
  }

  const categories = categoriesData?.data ?? [];
  const cityPickerVisible = needsCityPicker || showCityPicker;

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
        {/* Top row: greeting + logo */}
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-[22px] font-bold text-white">{getGreeting()}</h1>
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
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

        {/* Question */}
        <p className="text-white font-bold text-lg mb-3.5">Mau cari apa hari ini?</p>

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
                <div className="flex gap-2 overflow-x-auto -mx-4 px-4 scrollbar-hide pb-2">
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

                {/* Lihat semua */}
                <div className="flex justify-end mt-1 mb-1">
                  <button
                    onClick={() => setShowAll(true)}
                    className="text-xs font-semibold text-primary-600 active:scale-95 transition-transform"
                  >
                    Lihat semua &rarr;
                  </button>
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
                      : "bg-white shadow-sm border border-gray-100 text-primary-700"
                  }`}
                >
                  <CategoryIcon slug={cat.slug} className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              ))}
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
