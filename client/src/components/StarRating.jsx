import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 5, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
  const rounded = Math.round(rating * 2) / 2;
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${dim} ${
            star <= Math.ceil(rounded)
              ? 'fill-[#e8cd8b] text-[#e8cd8b]'
              : 'text-white/20'
          }`}
        />
      ))}
    </div>
  );
}
