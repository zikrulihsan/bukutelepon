import { HiCheckCircle } from "react-icons/hi2";

interface TrustBadgeProps {
  reviewCount: number;
  averageRating: number;
}

export function TrustBadge({ reviewCount, averageRating }: TrustBadgeProps) {
  if (reviewCount === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
      <HiCheckCircle className="w-3.5 h-3.5" />
      {averageRating.toFixed(1)} ({reviewCount} ulasan)
    </div>
  );
}
