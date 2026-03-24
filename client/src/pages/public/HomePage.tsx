import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import type { City, Category } from "../../types";

const CATEGORY_ICONS: Record<string, string> = {
  darurat: "🚨",
  keamanan: "🛡️",
  kesehatan: "🏥",
  "layanan-publik": "🏛️",
  transportasi: "🚌",
  utilitas: "⚡",
};

function getCategoryIcon(category: Category): string {
  if (category.icon) return category.icon;
  return CATEGORY_ICONS[category.slug] || "📋";
}

export default function HomePage() {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [citySlug, setCitySlug] = useState("");

  const { data: citiesData } = useQuery<{ success: boolean; data: City[] }>({
    queryKey: ["cities"],
    queryFn: async () => {
      const { data } = await apiClient.get("/cities");
      return data;
    },
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<{
    success: boolean;
    data: Category[];
  }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/categories");
      return data;
    },
  });

  // Keyboard shortcut: press '/' to focus search
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (citySlug) params.set("city", citySlug);
    navigate(`/list?${params.toString()}`);
  }

  function handleCategoryClick(category: Category) {
    const params = new URLSearchParams();
    params.set("category", category.slug);
    if (citySlug) params.set("city", citySlug);
    navigate(`/list?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 pt-16 pb-12">
      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-bold text-primary-700 mb-10">
        Buku Telepon
      </h1>

      {/* Search section */}
      <div className="w-full max-w-xl">
        {/* City filter */}
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm font-medium text-gray-600">Wilayah:</label>
          <select
            value={citySlug}
            onChange={(e) => setCitySlug(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Semua wilayah</option>
            {citiesData?.data.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative">
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kontak publik... (contoh: Polisi, Rumah Sakit)"
            className="w-full border border-gray-300 rounded-full pl-5 pr-14 py-3.5 text-base text-gray-900 placeholder-gray-400 search-input"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-700 hover:bg-primary-800 rounded-full flex items-center justify-center transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
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
        </form>
      </div>

      {/* Categories */}
      <div className="w-full max-w-xl mt-10">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 text-center">
          Kategori tersedia
        </h2>

        {categoriesLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 p-6 animate-pulse"
              >
                <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-2" />
                <div className="h-3 bg-gray-200 rounded w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {categoriesData?.data.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className="category-card"
              >
                <span className="text-2xl">
                  {getCategoryIcon(category)}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tip */}
      <p className="mt-10 text-xs text-gray-400 text-center">
        Kiat: Tekan{" "}
        <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-gray-500 font-mono text-xs">
          /
        </kbd>{" "}
        untuk fokus ke pencarian &bull; Enter untuk cari
      </p>
    </div>
  );
}
