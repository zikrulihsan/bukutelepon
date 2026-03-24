interface TrustBadgeProps {
  reviewCount: number;
  averageRating: number;
}

export function TrustBadge({ reviewCount, averageRating }: TrustBadgeProps) {
  if (reviewCount === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      {averageRating.toFixed(1)} ({reviewCount} ulasan)
    </div>
  );
}
