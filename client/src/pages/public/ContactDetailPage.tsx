import { useParams } from "react-router-dom";
import { useContact } from "../../hooks/useContacts";
import { StarRating } from "../../components/shared/StarRating";
import { TrustBadge } from "../../components/shared/TrustBadge";

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useContact(id!);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-100 rounded w-1/3 mb-8" />
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded w-full" />
          <div className="h-4 bg-gray-100 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const contact = data?.data;
  if (!contact) return <div className="text-center py-16 text-gray-500">Kontak tidak ditemukan</div>;

  const reviews = contact.reviews ?? [];
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{contact.name}</h1>
            <p className="text-gray-500 mt-1">
              {contact.city?.name}, {contact.city?.province}
            </p>
          </div>
          <TrustBadge reviewCount={reviews.length} averageRating={avgRating} />
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex gap-2">
            <span className="text-sm font-medium text-gray-500 w-24">Telepon</span>
            <span className="text-sm text-gray-900">{contact.phone}</span>
          </div>
          {contact.address && (
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-500 w-24">Alamat</span>
              <span className="text-sm text-gray-900">{contact.address}</span>
            </div>
          )}
          {contact.website && (
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-500 w-24">Website</span>
              <a
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline"
              >
                {contact.website}
              </a>
            </div>
          )}
          {contact.category && (
            <div className="flex gap-2">
              <span className="text-sm font-medium text-gray-500 w-24">Kategori</span>
              <span className="text-sm text-gray-900">{contact.category.name}</span>
            </div>
          )}
        </div>

        {contact.description && (
          <p className="mt-6 text-sm text-gray-700 leading-relaxed">{contact.description}</p>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ulasan ({reviews.length})</h2>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <StarRating rating={review.rating} size="sm" />
                  <span className="text-sm text-gray-500">{review.author?.name}</span>
                </div>
                {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
