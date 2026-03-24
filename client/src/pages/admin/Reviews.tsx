import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../../lib/axios";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { StarRating } from "../../components/shared/StarRating";
import type { Review, PaginatedResponse } from "../../types";

export default function AdminReviews() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("PENDING");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<PaginatedResponse<Review>>({
    queryKey: ["admin", "reviews", status, page],
    queryFn: async () => (await apiClient.get(`/admin/reviews?status=${status}&page=${page}`)).data,
    enabled: profile?.role === "ADMIN",
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/reviews/${id}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => apiClient.patch(`/admin/reviews/${id}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });

  if (profile?.role !== "ADMIN") {
    return <div className="text-center py-16 text-gray-500">Akses ditolak</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Kelola Ulasan</h1>

      <div className="flex gap-2 mb-6">
        {["PENDING", "APPROVED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              status === s ? "bg-primary-600 text-white" : "bg-white border border-gray-300 text-gray-700"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data?.data.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating rating={review.rating} size="sm" />
                    <Badge variant={review.status === "APPROVED" ? "success" : review.status === "REJECTED" ? "danger" : "warning"}>
                      {review.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{review.comment || "(Tanpa komentar)"}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Untuk: {review.contact?.name} | Oleh: {review.author?.name}
                  </p>
                </div>
                {review.status === "PENDING" && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approveMutation.mutate(review.id)} loading={approveMutation.isPending}>
                      Setuju
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => rejectMutation.mutate(review.id)} loading={rejectMutation.isPending}>
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
