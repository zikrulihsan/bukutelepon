import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/axios";
import type { Contact, PaginatedResponse } from "../types";

interface UseContactsOptions {
  page?: number;
  limit?: number;
  city?: string;
  category?: string;
  search?: string;
}

export function useContacts(options: UseContactsOptions = {}) {
  const { page = 1, limit = 20, city, category, search } = options;

  return useQuery<PaginatedResponse<Contact>>({
    queryKey: ["contacts", { page, limit, city, category, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (city) params.set("city", city);
      if (category) params.set("category", category);
      if (search) params.set("search", search);

      const { data } = await apiClient.get(`/contacts?${params}`);
      return data;
    },
  });
}

export function useContact(id: string) {
  return useQuery<{ success: boolean; data: Contact }>({
    queryKey: ["contact", id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/contacts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
