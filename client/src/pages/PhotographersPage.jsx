import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  MapPin,
  Check,
  Calendar,
  Star,
  MessageSquarePlus,
  X,
  Quote,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import StarRating from '../components/StarRating';
import { SkeletonCard } from '../components/Skeletons';
import { useStudio } from '../context/StudioContext';
import { api } from '../services/api';
import { formatINR } from '../utils/formatters';

export default function PhotographersPage() {
  const {
    photographers,
    loadingPhotographers,
    refreshPhotographers,
    setSelectedPhotographerSlug,
    showToast,
  } = useStudio();
  const navigate = useNavigate();

  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    clientName: '',
    role: '',
    rating: 5,
    shootType: '',
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleSelectAndBook = (slug, packageId) => {
    setSelectedPhotographerSlug(slug);
    const query = packageId
      ? `/booking?photographer=${slug}&package=${packageId}`
      : `/booking?photographer=${slug}`;
    navigate(query);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewTarget) return;
    try {
      setSubmittingReview(true);
      await api.addReview(reviewTarget.slug, {
        ...reviewForm,
        shootType: reviewForm.shootType || reviewTarget.categories[0],
      });
      await refreshPhotographers();
      showToast(`Thank you! Your review for ${reviewTarget.name} is now live.`);
      setReviewTarget(null);
      setReviewForm({ clientName: '', role: '', rating: 5, shootType: '', comment: '' });
    } catch (err) {
      showToast(err.message || 'Could not submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <PageTransition className="pt-32 pb-20 max-w-7xl mx-auto px-5 sm:px-8 space-y-14">
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-mono-tech uppercase tracking-[0.26em] text-[#d4af37]">
          Principal Visual Artists
        </span>
        <h1 className="font-serif-display text-5xl sm:text-6xl font-medium text-[#f5f2eb]">
          Our <span className="italic text-gradient-gold">Photographers</span>
        </h1>
        <p className="text-base text-[#a19e95] leading-relaxed">
          Atelier Lumière is led by three distinct artistic voices. Explore their optical kits, commission packages, verified client reviews, and select your preferred photographer before reserving a date.
        </p>
      </div>

      {loadingPhotographers ? (
        <div className="space-y-10">
          {[1, 2, 3].map((n) => (
            <SkeletonCard key={n} className="h-96" />
          ))}
        </div>
      ) : (
        <div className="space-y-14">
          {photographers.map((artist, idx) => (
            <motion.section
              key={artist.slug}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: idx * 0.08 }}
              className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#16161d] via-[#111116] to-[#141110] overflow-hidden shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Portrait & Quick Stats */}
                <div className="lg:col-span-4 relative min-h-[420px] lg:min-h-full">
                  <img
                    src={artist.avatar}
                    alt={artist.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/25 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {artist.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono-tech uppercase tracking-widest text-[#e8cd8b]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-[#e4dfd5]">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                        {artist.location}
                      </span>
                      <span className="font-mono-tech">{artist.experienceYears} Yrs</span>
                    </div>
                  </div>
                </div>

                {/* Details, Pricing Packages, Reviews */}
                <div className="lg:col-span-8 p-7 sm:p-10 space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/10 pb-6">
                    <div className="space-y-2">
                      <p className="text-xs font-mono-tech uppercase tracking-[0.22em] text-[#c87d65]">
                        {artist.title}
                      </p>
                      <h2 className="font-serif-display text-4xl sm:text-5xl text-[#f5f2eb]">
                        {artist.name}
                      </h2>
                      <p className="text-sm text-[#e8cd8b] font-medium">{artist.specialty}</p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
                        <Star className="w-4 h-4 fill-[#e8cd8b] text-[#e8cd8b]" />
                        <span className="font-semibold text-sm text-[#f5f2eb]">{artist.rating}</span>
                        <span className="text-xs text-[#a19e95]">({artist.reviewCount} reviews)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectAndBook(artist.slug)}
                        className="btn-luminous mt-2 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-[0.16em] inline-flex items-center gap-2"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Book {artist.name.split(' ')[0]}
                      </button>
                    </div>
                  </div>

                  {/* Bio & Quote */}
                  <div className="space-y-4">
                    <p className="text-sm text-[#c7c2b8] leading-relaxed">{artist.bio}</p>
                    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-4 flex items-start gap-3">
                      <Quote className="w-5 h-5 text-[#d4af37]/60 shrink-0 mt-0.5" />
                      <p className="font-serif-display text-xl italic text-[#e4dfd5]">
                        “{artist.quote}”
                      </p>
                    </div>
                  </div>

                  {/* Kit */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono-tech uppercase tracking-wider text-[#8f8b82] mr-2">
                      <Camera className="w-3.5 h-3.5 text-[#d4af37]" /> Primary Kit:
                    </span>
                    {artist.equipment.map((gear) => (
                      <span
                        key={gear}
                        className="px-3 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-xs font-mono-tech text-[#cfc9be]"
                      >
                        {gear}
                      </span>
                    ))}
                  </div>

                  {/* Commission Packages */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono-tech uppercase tracking-[0.22em] text-[#e8cd8b]">
                      Commission Packages & Pricing
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {artist.packages.map((pkg) => (
                        <div
                          key={pkg.id}
                          className={`rounded-2xl p-5 border flex flex-col justify-between gap-4 ${
                            pkg.popular
                              ? 'bg-gradient-to-b from-[#d4af37]/12 to-[#121216] border-[#d4af37]/50'
                              : 'bg-white/[0.025] border-white/10'
                          }`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono-tech uppercase tracking-wider text-[#a19e95]">
                                {pkg.duration}
                              </span>
                              {pkg.popular && (
                                <span className="px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#e8cd8b] text-[9px] font-mono-tech uppercase">
                                  Signature
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif-display text-xl text-[#f5f2eb] leading-snug">
                              {pkg.name}
                            </h4>
                            <p className="font-serif-display text-2xl text-[#e8cd8b]">
                              {formatINR(pkg.price)}
                            </p>
                            <ul className="space-y-1.5 pt-1">
                              {pkg.deliverables.slice(0, 3).map((d) => (
                                <li
                                  key={d}
                                  className="text-[11px] text-[#b9b4aa] flex items-start gap-1.5"
                                >
                                  <Check className="w-3.5 h-3.5 text-[#d4af37] shrink-0 mt-0.5" />
                                  <span>{d}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectAndBook(artist.slug, pkg.id)}
                            className="w-full py-2.5 rounded-full border border-[#d4af37]/40 text-[11px] font-semibold uppercase tracking-widest text-[#e8cd8b] hover:bg-[#d4af37] hover:text-[#09090b] transition"
                          >
                            Select Package
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verified Client Reviews */}
                  <div className="space-y-4 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-mono-tech uppercase tracking-[0.22em] text-[#a19e95]">
                        Recent Client Reviews
                      </h3>
                      <button
                        type="button"
                        onClick={() => setReviewTarget(artist)}
                        className="inline-flex items-center gap-1.5 text-xs text-[#e8cd8b] hover:underline"
                      >
                        <MessageSquarePlus className="w-3.5 h-3.5" />
                        Write a Review
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {artist.reviews.slice(0, 2).map((rev, rIdx) => (
                        <div
                          key={`${rev.clientName}-${rIdx}`}
                          className="rounded-xl bg-white/[0.02] border border-white/[0.07] p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <StarRating rating={rev.rating} />
                            <span className="text-[10px] font-mono-tech text-[#8f8b82]">
                              {rev.date}
                            </span>
                          </div>
                          <p className="text-xs text-[#d6d2c9] leading-relaxed">“{rev.comment}”</p>
                          <p className="text-[11px] text-[#a19e95]">
                            <strong className="text-[#f5f2eb]">{rev.clientName}</strong> — {rev.role}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          ))}
        </div>
      )}

      {/* Leave a Review Modal */}
      <AnimatePresence>
        {reviewTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReviewTarget(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full rounded-3xl border border-white/15 bg-[#121216] p-7 space-y-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d4af37]">
                    Client Review
                  </span>
                  <h3 className="font-serif-display text-3xl text-[#f5f2eb]">
                    Review {reviewTarget.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewTarget(null)}
                  className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-[#a19e95] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    required
                    value={reviewForm.clientName}
                    onChange={(e) => setReviewForm({ ...reviewForm, clientName: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-2.5 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                      Role / Event
                    </label>
                    <input
                      placeholder="e.g. Vogue Lookbook"
                      value={reviewForm.role}
                      onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                      className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-2.5 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                      Rating *
                    </label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                      className="w-full rounded-xl bg-[#15151a] border border-white/15 px-4 py-2.5 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                    >
                      {[5, 4.5, 4, 3].map((r) => (
                        <option key={r} value={r}>
                          {r} Stars
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                    Your Experience *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-2.5 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-luminous w-full py-3 rounded-full text-xs font-semibold uppercase tracking-widest disabled:opacity-50"
                >
                  {submittingReview ? 'Publishing...' : 'Publish Review'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
