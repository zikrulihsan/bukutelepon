import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { useCity } from "../../context/CityContext";
import { ContactCard } from "../../components/shared/ContactCard";
import { ContributionWall } from "../../components/shared/ContributionWall";
import { CategoryIcon } from "../../components/shared/CategoryIcon";
import { ContactListShimmer } from "../../components/shared/Shimmer";
import type { Category, Contact, PaginatedResponse } from "../../types";

export default function SearchPage() {
  const { citySlug, city } = useCity();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const chipScrollRef = useRef<HTMLDivElement>(null);

  const urlQ = searchParams.get("q") || "";
  const urlCat = searchParams.get("category") || "";

  const urlVerified = searchParams.get("verified") || "";

  const [search, setSearch] = useState(urlQ);
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [activeCategory, setActiveCategory] = useState(urlCat);
  const [verifiedFilter, setVerifiedFilter] = useState(urlVerified);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

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

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce search input
  useEffect(() => {
    const trimmed = search.trim();
    if (trimmed === searchQuery) return;
    const timer = setTimeout(() => {
      setSearchQuery(trimmed);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: categoriesData } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await apiClient.get("/categories")).data,
  });
  const categories = categoriesData?.data ?? [];

  const hasFilter = !!searchQuery || !!activeCategory || !!verifiedFilter;

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<PaginatedResponse<Contact>>({
    queryKey: ["search-contacts", { city: citySlug, category: activeCategory, search: searchQuery, verified: verifiedFilter }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      params.set("page", String(pageParam));
      params.set("limit", "20");
      if (citySlug) params.set("city", citySlug);
      if (activeCategory) params.set("category", activeCategory);
      if (searchQuery) params.set("search", searchQuery);
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
    enabled: hasFilter,
  });

  // Intersection observer
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

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (activeCategory) params.set("category", activeCategory);
    if (verifiedFilter) params.set("verified", verifiedFilter);
    setSearchParams(params, { replace: true });
  }, [searchQuery, activeCategory, verifiedFilter, setSearchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(search.trim());
  }

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

  return (
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto pb-24">
      {/* Search header */}
      <div className="bg-white px-4 pt-4 pb-3 border-b border-gray-100 sticky top-0 z-20">
        <form onSubmit={handleSearch} className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm focus-within:ring-4 focus-within:ring-green-500/10 focus-within:border-green-500 transition-all">
          <div className="pl-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Cari kontak di ${city?.name ?? "sekitarmu"}...`}
            className="flex-1 h-12 pl-3 pr-2 text-[15px] font-medium text-gray-900 placeholder-gray-400 bg-transparent outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setSearchQuery(""); inputRef.current?.focus(); }}
              className="mr-2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-95 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

        </form>

        {/* Category chips + filter icon */}
        <div className="flex items-center gap-2 pt-3">
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

          <div ref={chipScrollRef} className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                data-slug={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat.slug
                    ? "bg-primary-700 text-white shadow-sm"
                    : "bg-white text-primary-700 shadow-sm border border-gray-100"
                }`}
              >
                <CategoryIcon slug={cat.slug} className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {!hasFilter ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">Cari kontak</p>
            <p className="text-xs text-gray-500">
              Ketik nama atau pilih kategori{city ? ` di ${city.name}` : ""}
            </p>
          </div>
        ) : isLoading ? (
          <ContactListShimmer count={4} />
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              {searchQuery ? `Hasil "${searchQuery}"` : `${total} kontak ${categories.find((c) => c.slug === activeCategory)?.name ?? ""}`}
              {city ? ` di ${city.name}` : ""}
            </p>

            {allContacts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-sm">Tidak ada kontak ditemukan</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {allContacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            )}

            {hasNextPage && (
              <div ref={loadMoreRef} className="py-4">
                {isFetchingNextPage ? <ContactListShimmer count={2} /> : <div className="h-4" />}
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
    </div>
  );
}
