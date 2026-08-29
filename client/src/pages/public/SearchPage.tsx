import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { buildSearchShareUrl } from "../../lib/searchShare";
import { useCity } from "../../context/CityContext";
import { useCategories } from "../../context/CategoriesContext";
import { useContactsData } from "../../context/ContactsContext";
import { useInfiniteContacts } from "../../hooks/useContacts";
import { ContactCard } from "../../components/shared/ContactCard";
import { CategoryIcon } from "../../components/shared/CategoryIcon";
import { ContactListShimmer, CategoryChipsShimmer } from "../../components/shared/Shimmer";
import { HiChevronLeft, HiMagnifyingGlass, HiXMark, HiCheckBadge, HiCheck } from "react-icons/hi2";
import { HiFilter, HiOutlineShare } from "react-icons/hi";
import { useI18n } from "../../i18n/LanguageContext";
import type { City } from "../../types";

export default function SearchPage() {
  const { t, categoryName } = useI18n();
  const { citySlug, city, setCity, cities, setCities } = useCity();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loadMoreNode, setLoadMoreNode] = useState<HTMLDivElement | null>(null);
  const chipScrollRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const urlQ = searchParams.get("q") || "";
  const urlCat = searchParams.get("category") || "";

  const urlVerified = searchParams.get("verified") || "";

  const [search, setSearch] = useState(urlQ);
  const [searchQuery, setSearchQuery] = useState(urlQ);
  const [activeCategory, setActiveCategory] = useState(urlCat);
  const [verifiedFilter, setVerifiedFilter] = useState(urlVerified);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // A shared link carries its own region — adopt it once so the receiver sees
  // the same results as the sender, then let the usual city context take over.
  const [cityFromLink, setCityFromLink] = useState(() => {
    const shared = searchParams.get("city") || "";
    return shared && shared !== citySlug ? shared : "";
  });

  const { data: citiesData, isError: citiesError, isFetched: citiesFetched } = useQuery<{ success: boolean; data: City[] }>({
    queryKey: ["cities"],
    queryFn: async () => (await apiClient.get("/cities")).data,
    enabled: !!cityFromLink && cities.length === 0,
  });

  useEffect(() => {
    if (!cityFromLink) return;
    const known = cities.length > 0 ? cities : citiesData?.data;
    if (!known || known.length === 0) {
      // Nothing to match against and nothing more on the way — stop waiting,
      // or the loading placeholders would never give way to results.
      if (citiesFetched || citiesError) setCityFromLink("");
      return;
    }

    const match = known.find((c) => c.slug === cityFromLink);
    if (match) {
      if (cities.length === 0) setCities(known);
      setCity(match);
    }
    setCityFromLink("");
  }, [cityFromLink, cities, citiesData, citiesFetched, citiesError, setCities, setCity]);

  // The page owns the full viewport and scrolls its results internally, so the
  // document itself must not scroll: a second scroller behind this one is what
  // makes the browser chrome collapse and expand mid-gesture, dragging the
  // header and the bottom bar with it.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

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

  const { categories, isLoading: categoriesLoading } = useCategories();
  const { isLoading: contactsLoading } = useContactsData();

  const hasFilter = !!searchQuery || !!activeCategory || !!verifiedFilter;

  // First paint of the page: the contact cache is still downloading, the chips
  // have nothing to render, or a shared link's city has yet to resolve. Show
  // placeholders rather than an empty screen that fills in a beat later.
  const resolvingSharedCity = !!cityFromLink && !citiesError;
  const initialLoading =
    contactsLoading || (categoriesLoading && categories.length === 0) || resolvingSharedCity;

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isLoading,
  } = useInfiniteContacts({
    city: citySlug || undefined,
    category: activeCategory || undefined,
    search: searchQuery || undefined,
    verified: verifiedFilter || undefined,
    enabled: hasFilter,
  });

  // Intersection observer, watched inside the results scroller rather than the
  // document. The sentinel is held in state, not a ref, so the observer is
  // attached the moment the node mounts — `hasNextPage` alone is already true
  // while the results are hidden behind the empty state, and keying the effect
  // on it would leave the observer watching nothing.
  useEffect(() => {
    if (!loadMoreNode || !hasNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { root: resultsRef.current, rootMargin: "200px" }
    );
    observer.observe(loadMoreNode);
    return () => observer.disconnect();
  }, [loadMoreNode, hasNextPage, fetchNextPage]);

  const allContacts = infiniteData?.pages.flatMap((p) => p.data) ?? [];
  const total = infiniteData?.pages[0]?.meta.total ?? 0;

  // A new filter means a new, shorter list. Start it from the top so the old
  // scroll offset does not land the reader in the middle of nowhere.
  useEffect(() => {
    resultsRef.current?.scrollTo({ top: 0 });
  }, [searchQuery, activeCategory, verifiedFilter]);

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (activeCategory) params.set("category", activeCategory);
    if (verifiedFilter) params.set("verified", verifiedFilter);
    if (citySlug) params.set("city", citySlug);
    // Skip no-op history writes; each one re-renders the whole route.
    if (params.toString() === searchParams.toString()) return;
    setSearchParams(params, { replace: true });
  }, [searchQuery, activeCategory, verifiedFilter, citySlug, searchParams, setSearchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(search.trim());
    inputRef.current?.blur();
  }

  /** What the shared card is about — "Rumah Sakit di Bandung". */
  function shareSubject() {
    const keyword =
      searchQuery || categoryName(categories.find((c) => c.slug === activeCategory));
    if (keyword && city?.name) {
      return t("search.shareSubject", { keyword, city: city.name });
    }
    return keyword || city?.name || "";
  }

  function handleShare() {
    const subject = shareSubject();
    const text = t("search.shareText", { subject });
    const url = buildSearchShareUrl({
      q: searchQuery,
      category: activeCategory,
      city: citySlug,
    });

    if (navigator.share) {
      navigator.share({ title: subject, text, url }).catch(() => {/* dismissed */});
      return;
    }

    navigator.clipboard
      .writeText(`${text} ${url}`)
      .then(() => {
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      })
      .catch(() => {/* clipboard not available */});
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
    <div className="h-viewport flex flex-col overflow-hidden bg-white max-w-md mx-auto">
      {/* Search header — outside the scroller, so it never repaints on scroll */}
      <div className="flex-shrink-0 bg-white px-4 pt-4 pb-3 border-b border-black/5 z-20">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-1.5 -ml-1 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label={t("common.back")}
          >
            <HiChevronLeft className="h-6 w-6" />
          </button>

          <form onSubmit={handleSearch} className="flex-1 flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm focus-within:ring-4 focus-within:ring-green-500/10 focus-within:border-green-500 transition-all">
            <div className="pl-4 text-gray-400">
              <HiMagnifyingGlass className="h-5 w-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("home.searchInCity", { city: city?.name ?? t("home.nearYou") })}
              className="flex-1 w-full h-12 pl-3 pr-2 text-[16px] font-medium text-gray-900 placeholder-gray-400 bg-transparent outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setSearchQuery(""); inputRef.current?.focus(); }}
                className="mr-2 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 hover:bg-gray-200 active:scale-95 transition-colors"
              >
                <HiXMark className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>

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
              <HiFilter className="h-4 w-4" />
            </button>
            {showFilterMenu && (
              <div className="absolute top-full left-0 mt-1.5 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-30 min-w-[160px]">
                {([
                  { value: "", label: t("filter.all") },
                  { value: "true", label: t("filter.verified") },
                  { value: "false", label: t("filter.unverified") },
                ] as const).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => { setVerifiedFilter(value); setShowFilterMenu(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2 transition-colors ${
                      verifiedFilter === value ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {value === "true" && (
                      <HiCheckBadge className="h-3.5 w-3.5 text-blue-500" />
                    )}
                    {label}
                    {verifiedFilter === value && (
                      <HiCheck className="h-3.5 w-3.5 ml-auto text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {categories.length === 0 && categoriesLoading ? (
            <CategoryChipsShimmer />
          ) : (
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
                  {categoryName(cat)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results — the only scrolling region on the page */}
      <div
        ref={resultsRef}
        className="flex-1 min-h-0 overflow-y-auto scroll-region px-4 pt-4 pb-28"
      >
        {initialLoading ? (
          <ContactListShimmer count={4} />
        ) : !hasFilter ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <HiMagnifyingGlass className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{t("search.emptyTitle")}</p>
            <p className="text-xs text-gray-500">
              {t("search.emptyHint")}{city ? ` ${t("common.inCity", { city: city.name })}` : ""}
            </p>
          </div>
        ) : isLoading ? (
          <ContactListShimmer count={4} />
        ) : (
          <>
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-xs text-gray-500">
                {searchQuery
                  ? t("search.resultsFor", { query: searchQuery })
                  : `${t("common.contactsCount", { count: total })} ${categoryName(categories.find((c) => c.slug === activeCategory))}`.trim()}
                {city ? ` ${t("common.inCity", { city: city.name })}` : ""}
              </p>

              {allContacts.length > 0 && (
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label={t("search.shareAria")}
                  className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-200 active:scale-95 transition-colors"
                >
                  <HiOutlineShare className="h-3.5 w-3.5" />
                  {shareCopied ? t("search.shareCopied") : t("search.share")}
                </button>
              )}
            </div>

            {allContacts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-sm">{t("search.noResults")}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {allContacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </div>
            )}

            {/* Fixed-height sentinel: a placeholder that grows and shrinks here
                would shift the list under the reader's thumb mid-scroll. */}
            {hasNextPage && <div ref={setLoadMoreNode} className="h-12" aria-hidden="true" />}
          </>
        )}
      </div>
    </div>
  );
}
