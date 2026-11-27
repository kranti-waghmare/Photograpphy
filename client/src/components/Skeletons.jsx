import React from 'react';
import { motion } from 'framer-motion';

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-[#121216] overflow-hidden ${className}`}>
      <div className="h-64 skeleton-shimmer" />
      <div className="p-6 space-y-3">
        <div className="h-3 w-24 rounded-full skeleton-shimmer" />
        <div className="h-6 w-2/3 rounded-lg skeleton-shimmer" />
        <div className="h-4 w-full rounded-lg skeleton-shimmer" />
        <div className="h-4 w-4/5 rounded-lg skeleton-shimmer" />
        <div className="pt-3 flex justify-between items-center">
          <div className="h-5 w-24 rounded-lg skeleton-shimmer" />
          <div className="h-9 w-28 rounded-full skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCalendar() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#121216] p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div className="h-6 w-40 rounded-lg skeleton-shimmer" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full skeleton-shimmer" />
          <div className="h-8 w-8 rounded-full skeleton-shimmer" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 pt-2">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-11 rounded-xl skeleton-shimmer" />
        ))}
      </div>
    </div>
  );
}

export function PageLoader({ label = 'Preparing Atelier...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-2 border-[#d4af37]/20 border-t-[#d4af37]"
      />
      <p className="text-xs uppercase tracking-[0.28em] text-[#a19e95] font-mono-tech">{label}</p>
    </div>
  );
}
