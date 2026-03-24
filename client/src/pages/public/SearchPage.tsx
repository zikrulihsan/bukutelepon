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

  const [search, setSearch] = useState(urlQ);
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [activeCategory, setActiveCategory] = useState(urlCat);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data: categoriesData } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await apiClient.get("/categories")).data,
  });
  const categories = categoriesData?.data ?? [];

  const hasFilter = !!searchQuery || !!activeCategory;

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery<PaginatedResponse<Contact>>({
    queryKey: ["search-contacts", { city: citySlug, category: activeCategory, search: searchQuery }],
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
    setSearchParams(params, { replace: true });
  }, [searchQuery, activeCategory, setSearchParams]);

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
        <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-xl overflow-hidden">
          <div className="pl-3.5 text-gray-400">
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
            className="flex-1 h-11 pl-3 pr-4 text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setSearchQuery(""); inputRef.current?.focus(); }}
              className="pr-3 text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </form>

        {/* Category chips */}
        <div ref={chipScrollRef} className="flex items-center gap-2 overflow-x-auto pt-3 scrollbar-hide">
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
