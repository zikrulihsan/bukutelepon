import { HiStar } from "react-icons/hi2";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export function StarRating({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
}: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <HiStar
          key={i}
          className={`${sizeClasses[size]} ${
            i < rating ? "text-yellow-400" : "text-gray-300"
          } ${interactive ? "cursor-pointer" : ""}`}
          onClick={() => interactive && onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}
