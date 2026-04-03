import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { useContacts } from "../../hooks/useContacts";
import { ContactCard } from "../../components/shared/ContactCard";
import { ContributionWall } from "../../components/shared/ContributionWall";
import type { City } from "../../types";
import { HiChevronLeft } from "react-icons/hi2";

export default function CityPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data: cityData } = useQuery<{ success: boolean; data: City }>({
    queryKey: ["city", slug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/cities/${slug}`);
      return data;
    },
    enabled: !!slug,
  });

  const { data: contactsData, isLoading } = useContacts({
    city: slug,
    page,
  });

  const city = cityData?.data;
  const isGuestLimited = contactsData?.meta.guestLimited;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          to="/"
          className="text-sm text-primary-700 hover:text-primary-800 font-medium mb-4 inline-flex items-center gap-1"
        >
          <HiChevronLeft className="h-4 w-4" />
          Kembali
        </Link>

        {city && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{city.name}</h1>
            <p className="text-sm text-gray-500">{city.province}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3 mt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-32 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-64" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4 mt-4">
              Menampilkan {contactsData?.data.length ?? 0} dari{" "}
              {contactsData?.meta?.total ?? 0} kontak
            </p>

            <div className="space-y-3">
              {contactsData?.data.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
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
