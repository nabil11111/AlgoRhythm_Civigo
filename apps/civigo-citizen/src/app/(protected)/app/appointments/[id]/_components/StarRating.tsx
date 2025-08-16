"use client";

import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const starSize = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }[size];

  const handleStarClick = (newRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const handleStarHover = (newRating: number) => {
    if (!readonly) {
      setHoverRating(newRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => handleStarClick(star)}
          onMouseEnter={() => handleStarHover(star)}
          disabled={readonly}
          className={`${starSize} ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } transition-transform duration-150`}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          <StarIcon filled={star <= displayRating} />
        </button>
      ))}
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${
        filled ? "text-[#FF8F00] fill-current" : "text-gray-300 fill-current"
      } transition-colors duration-150`}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
