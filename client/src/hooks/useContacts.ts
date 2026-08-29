import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/axios";
import { useContactsData } from "../context/ContactsContext";
import { filterContacts, type ContactFilter } from "../lib/localContacts";
import type { Contact, PaginatedResponse } from "../types";

const PAGE_SIZE = 20;

interface UseContactsOptions extends ContactFilter {
  page?: number;
  limit?: number;
}

/**
 * Filters/paginates the locally cached contacts collection. Returns the same
 * shape the network-backed hook used to, so consuming pages need no changes.
 * Results are identical for guests and signed-in users.
 */
export function useContacts(options: UseContactsOptions = {}) {
  const { page = 1, limit = PAGE_SIZE, city, category, search, verified } = options;
  const { contacts, isLoading } = useContactsData();

  const filtered = useMemo(
    () => filterContacts(contacts, { city, category, search, verified }),
    [contacts, city, category, search, verified]
  );

  const data = useMemo<PaginatedResponse<Contact>>(() => {
    const total = filtered.length;
    const start = (page - 1) * limit;
    const pageItems = filtered.slice(start, start + limit);

    return {
      success: true,
      data: pageItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }, [filtered, page, limit]);

  return { data, isLoading };
}

interface UseInfiniteContactsOptions extends ContactFilter {
  enabled?: boolean;
}

/**
 * Mimics the useInfiniteQuery surface over the local cache, with client-side
 * page slicing. Drop-in replacement for the inline infinite queries.
 */
export function useInfiniteContacts(options: UseInfiniteContactsOptions = {}) {
  const { city, category, search, verified, enabled = true } = options;
  const { contacts, isLoading } = useContactsData();

  const [pageCount, setPageCount] = useState(1);

  // Reset the paging window during render rather than in an effect: an effect
  // would let one frame paint the new filter with the old page count, which
  // shows a too-tall list and makes the scroll position jump.
  const filterKey = `${city ?? ""}|${category ?? ""}|${search ?? ""}|${verified ?? ""}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPageCount(1);
  }

  const filtered = useMemo(
    () => filterContacts(contacts, { city, category, search, verified }),
    [contacts, city, category, search, verified]
  );

  const result = useMemo(() => {
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const pages: PaginatedResponse<Contact>[] = [];
    for (let i = 0; i < pageCount; i++) {
      pages.push({
        success: true,
        data: filtered.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
        meta: {
          page: i + 1,
          limit: PAGE_SIZE,
          total,
          totalPages,
        },
      });
    }

    const visibleCount = Math.min(pageCount * PAGE_SIZE, total);
    const hasNextPage = visibleCount < total;

    return { pages, hasNextPage };
  }, [filtered, pageCount]);

  // Stable identity: consumers put this in effect deps to drive an
  // IntersectionObserver, and a new function each render would tear the
  // observer down and rebuild it, re-firing the intersection every time.
  const fetchNextPage = useCallback(() => setPageCount((c) => c + 1), []);

  return {
    data: { pages: result.pages },
    fetchNextPage,
    hasNextPage: result.hasNextPage,
    isFetchingNextPage: false,
    isLoading: enabled ? isLoading : false,
  };
}

/**
 * Returns the cached contact instantly, then refetches from the server to pull
 * fresh, dynamic data (reviews) that the cache does not hold.
 */
export function useContact(id: string) {
  const { getById } = useContactsData();
  const cached = id ? getById(id) : undefined;

  return useQuery<{ success: boolean; data: Contact }>({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contacts/${id}`);
      return data;
    },
    enabled: !!id,
    initialData: cached ? { success: true, data: cached } : undefined,
    // Treat the seeded cache as stale so reviews are fetched on mount.
    initialDataUpdatedAt: 0,
  });
}
