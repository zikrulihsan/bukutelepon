import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/axios";
import { useContactsData } from "../context/ContactsContext";
import { useAuth } from "../context/AuthContext";
import {
  filterContacts,
  GUEST_VIEW_THRESHOLD,
  type ContactFilter,
} from "../lib/localContacts";
import type { Contact, PaginatedResponse } from "../types";

const PAGE_SIZE = 20;

interface UseContactsOptions extends ContactFilter {
  page?: number;
  limit?: number;
}

/**
 * Filters/paginates the locally cached contacts collection. Returns the same
 * shape the network-backed hook used to, so consuming pages need no changes.
 * Guests are capped at GUEST_VIEW_THRESHOLD (cosmetic gate).
 */
export function useContacts(options: UseContactsOptions = {}) {
  const { page = 1, limit = PAGE_SIZE, city, category, search, verified } = options;
  const { contacts, isLoading } = useContactsData();
  const { user, loading: authLoading } = useAuth();
  // Don't gate while auth is still resolving — avoids the wall flashing for
  // logged-in users on first paint.
  const isGuest = !authLoading && !user;

  const filtered = useMemo(
    () => filterContacts(contacts, { city, category, search, verified }),
    [contacts, city, category, search, verified]
  );

  const data = useMemo<PaginatedResponse<Contact>>(() => {
    const total = filtered.length;
    const effective = isGuest ? filtered.slice(0, GUEST_VIEW_THRESHOLD) : filtered;
    const guestLimited = isGuest && total > GUEST_VIEW_THRESHOLD;

    const start = (page - 1) * limit;
    const pageItems = effective.slice(start, start + limit);

    return {
      success: true,
      data: pageItems,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(effective.length / limit)),
        guestLimited,
        guestThreshold: GUEST_VIEW_THRESHOLD,
      },
    };
  }, [filtered, isGuest, page, limit]);

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
  const { user, loading: authLoading } = useAuth();
  const isGuest = !authLoading && !user;

  const [pageCount, setPageCount] = useState(1);

  const filterKey = `${city ?? ""}|${category ?? ""}|${search ?? ""}|${verified ?? ""}`;
  useEffect(() => {
    setPageCount(1);
  }, [filterKey]);

  const filtered = useMemo(
    () => filterContacts(contacts, { city, category, search, verified }),
    [contacts, city, category, search, verified]
  );

  const result = useMemo(() => {
    const total = filtered.length;
    const effective = isGuest ? filtered.slice(0, GUEST_VIEW_THRESHOLD) : filtered;
    const guestLimited = isGuest && total > GUEST_VIEW_THRESHOLD;
    const totalPages = Math.max(1, Math.ceil(effective.length / PAGE_SIZE));

    const pages: PaginatedResponse<Contact>[] = [];
    for (let i = 0; i < pageCount; i++) {
      pages.push({
        success: true,
        data: effective.slice(i * PAGE_SIZE, (i + 1) * PAGE_SIZE),
        meta: {
          page: i + 1,
          limit: PAGE_SIZE,
          total,
          totalPages,
          guestLimited,
          guestThreshold: GUEST_VIEW_THRESHOLD,
        },
      });
    }

    const visibleCount = Math.min(pageCount * PAGE_SIZE, effective.length);
    const hasNextPage = !guestLimited && visibleCount < effective.length;

    return { pages, hasNextPage };
  }, [filtered, isGuest, pageCount]);

  return {
    data: { pages: result.pages },
    fetchNextPage: () => setPageCount((c) => c + 1),
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
