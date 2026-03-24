import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { useContacts } from "../../hooks/useContacts";
import { ContactCard } from "../../components/shared/ContactCard";
import { ContributionWall } from "../../components/shared/ContributionWall";
import type { Category, City } from "../../types";

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const querySearch = searchParams.get("q") || "";
  const queryCategory = searchParams.get("category") || "";
  const queryCity = searchParams.get("city") || "";

  const [search, setSearch] = useState(querySearch);
  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [selectedCity, setSelectedCity] = useState(queryCity);
  const [page, setPage] = useState(1);

  // Filter panel state
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftCity, setDraftCity] = useState(queryCity);
  const [draftCategories, setDraftCategories] = useState<string[]>(
    queryCategory ? [queryCategory] : []
  );

  // Sync local state from URL on navigation
  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    const cat = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";
    setSelectedCategory(cat);
    setSelectedCity(city);
    setDraftCity(city);
    setDraftCategories(cat ? [cat] : []);
    setPage(1);
  }, [searchParams]);

  // Close filter panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [filterOpen]);

  const { data: categoriesData } = useQuery<{
    success: boolean;
    data: Category[];
  }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/categories");
      return data;
    },
  });

  const { data: citiesData } = useQuery<{ success: boolean; data: City[] }>({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data } = await apiClient.get("/cities");
      return data;
    },
  });

  const {
    data: contactsData,
    isLoading,
  } = useContacts({
    page,
    search: querySearch || undefined,
    category: selectedCategory || undefined,
    city: selectedCity || undefined,
  });

  const isGuestLimited = contactsData?.meta?.guestLimited;
  const total = contactsData?.meta?.total ?? 0;
  const showing = contactsData?.data?.length ?? 0;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedCity) params.set("city", selectedCity);
    setSearchParams(params);
    setPage(1);
  }

  function handleCategoryFilter(catSlug: string) {
    const newCat = selectedCategory === catSlug ? "" : catSlug;
    setSelectedCategory(newCat);
    setDraftCategories(newCat ? [newCat] : []);

    const params = new URLSearchParams();
    if (querySearch) params.set("q", querySearch);
    if (newCat) params.set("category", newCat);
    if (selectedCity) params.set("city", selectedCity);
    setSearchParams(params);
    setPage(1);
  }

  function toggleDraftCategory(catSlug: string) {
    setDraftCategories((prev) =>
      prev.includes(catSlug) ? prev.filter((s) => s !== catSlug) : [...prev, catSlug]
    );
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (querySearch) params.set("q", querySearch);
    if (draftCategories.length > 0) params.set("category", draftCategories[0]);
    if (draftCity) params.set("city", draftCity);
    setSearchParams(params);
    setPage(1);
    setFilterOpen(false);
  }

  function resetFilters() {
    setDraftCity("");
    setDraftCategories([]);
  }

  const hasActiveFilters = selectedCategory || selectedCity;

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <Link
          to="/"
          className="text-2xl font-bold text-primary-700 hover:text-primary-800 inline-block mb-5"
        >
          Buku Telepon
        </Link>

        {/* Search bar with filter button */}
        <form onSubmit={handleSearch} className="relative mb-5">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kontak publik... (contoh: PLN)"
            className="w-full border border-gray-300 rounded-full pl-5 pr-24 py-3 text-base text-gray-900 placeholder-gray-400 bg-white search-input"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {/* Filter toggle button */}
            <div className="relative" ref={filterRef}>
              <button
                type="button"
                onClick={() => setFilterOpen(!filterOpen)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${
                  filterOpen || hasActiveFilters
                    ? "bg-primary-50 border-primary-300 text-primary-700"
                    : "border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4.5 w-4.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-700 rounded-full" />
                )}
              </button>

              {/* Filter dropdown panel */}
              {filterOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-xl border border-gray-200 shadow-lg z-50 p-5">
                  {/* Wilayah */}
                  <div className="mb-5">
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">
                      Wilayah
                    </label>
                    <select
                      value={draftCity}
                      onChange={(e) => setDraftCity(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Semua wilayah</option>
                      {citiesData?.data.map((city) => (
                        <option key={city.slug} value={city.slug}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Kategori checkboxes */}
                  <div className="mb-5">
                    <label className="text-sm font-semibold text-gray-800 mb-2 block">
                      Kategori
                    </label>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {categoriesData?.data.map((cat) => (
                        <label
                          key={cat.slug}
                          className="flex items-center gap-3 py-2 px-1 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={draftCategories.includes(cat.slug)}
                            onChange={() => toggleDraftCategory(cat.slug)}
                            className="w-5 h-5 rounded border-gray-300 text-primary-700 focus:ring-primary-500 cursor-pointer"
                          />
                          <span className="text-sm text-gray-700">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={applyFilters}
                      className="bg-primary-700 hover:bg-primary-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Search button */}
            <button
              type="submit"
              className="w-9 h-9 bg-primary-700 hover:bg-primary-800 rounded-full flex items-center justify-center transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>
        </form>

        {/* Category filter chips */}
        {categoriesData?.data && categoriesData.data.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-5">
            {categoriesData.data.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleCategoryFilter(cat.slug)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat.slug
                    ? "bg-primary-700 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-700"
                }`}
              >
                {cat.icon && <span className="text-sm">{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Active filter indicators */}
        {(selectedCity || selectedCategory) && (
          <div className="flex items-center gap-2 flex-wrap mb-4">
            <span className="text-xs text-gray-500">Filter aktif:</span>
            {selectedCity && citiesData?.data && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                📍 {citiesData.data.find((c) => c.slug === selectedCity)?.name}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("city");
                    setSearchParams(params);
                  }}
                  className="ml-0.5 hover:text-blue-900"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedCategory && categoriesData?.data && (
              <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {categoriesData.data.find((c) => c.slug === selectedCategory)?.icon}{" "}
                {categoriesData.data.find((c) => c.slug === selectedCategory)?.name}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("category");
                    setSearchParams(params);
                  }}
                  className="ml-0.5 hover:text-primary-900"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          Menampilkan {showing} dari {total} kontak
        </p>

        {/* Contact list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                    <div className="h-4 bg-gray-100 rounded w-32 mb-3" />
                    <div className="h-3 bg-gray-100 rounded w-64" />
                  </div>
                  <div className="h-9 w-24 bg-gray-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {contactsData?.data.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}

              {contactsData?.data.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-base">
                    Tidak ada kontak ditemukan.
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Coba ubah kata kunci atau filter kategori.
                  </p>
                </div>
              )}
            </div>

            {isGuestLimited && (
              <div className="mt-6">
                <ContributionWall />
              </div>
            )}

            {!isGuestLimited &&
              contactsData?.meta &&
              contactsData.meta.totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm text-gray-500">
                    Halaman {page} dari {contactsData.meta.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= contactsData.meta.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}
