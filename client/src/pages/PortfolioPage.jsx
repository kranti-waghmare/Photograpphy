import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, MapPin, Aperture, X, ArrowUpRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { SkeletonCard } from '../components/Skeletons';
import { api } from '../services/api';
import { useStudio } from '../context/StudioContext';

const CATEGORIES = ['All', 'Editorial', 'Weddings', 'Architecture', 'Portraits', 'Fine Art'];

export default function PortfolioPage() {
  const { photographers, setSelectedPhotographerSlug } = useStudio();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePhotographer, setActivePhotographer] = useState('all');
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getPortfolio({
        category: activeCategory,
        photographerSlug: activePhotographer,
      })
      .then((res) => {
        if (active) setItems(res.items || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [activeCategory, activePhotographer]);

  return (
    <PageTransition className="pt-32 pb-20 max-w-7xl mx-auto px-5 sm:px-8">
      {/* Header */}
      <div className="max-w-3xl space-y-4 mb-12">
        <span className="text-xs font-mono-tech uppercase tracking-[0.26em] text-[#d4af37]">
          Selected Plates 2025–2026
        </span>
        <h1 className="font-serif-display text-5xl sm:text-6xl font-medium text-[#f5f2eb]">
          Photography <span className="italic text-gradient-gold">Portfolio</span>
        </h1>
        <p className="text-base text-[#a19e95] leading-relaxed">
          Explore archival plates across couture editorials, architectural studies, destination celebrations, and monochrome studio portraiture—complete with optical metadata.
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-8 mb-10 border-b border-white/10">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium tracking-wider uppercase transition ${
                activeCategory === cat
                  ? 'btn-luminous font-semibold'
                  : 'border border-white/10 bg-white/[0.03] text-[#cfc9be] hover:border-[#d4af37]/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono-tech uppercase tracking-wider text-[#8f8b82]">
            Artist:
          </span>
          <select
            value={activePhotographer}
            onChange={(e) => setActivePhotographer(e.target.value)}
            className="rounded-full bg-[#15151a] border border-white/15 px-4 py-2 text-xs text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
          >
            <option value="all">All Principal Artists</option>
            {photographers.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <SkeletonCard key={n} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#121216] p-16 text-center space-y-3">
          <p className="font-serif-display text-3xl text-[#f5f2eb]">No Plates Match This Filter</p>
          <p className="text-sm text-[#a19e95]">Try selecting “All” categories or another artist.</p>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('All');
              setActivePhotographer('all');
            }}
            className="btn-luminous mt-3 px-6 py-2.5 rounded-full text-xs uppercase tracking-widest font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {items.map((item) => (
            <motion.article
              layout
              key={item._id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              onClick={() => setLightboxItem(item)}
              className="group cursor-pointer rounded-2xl border border-white/10 bg-[#121216] overflow-hidden hover:border-[#d4af37]/50 transition"
            >
              <div className="relative h-80 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-85" />
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#09090b]/75 border border-white/15 text-[10px] font-mono-tech uppercase tracking-widest text-[#e8cd8b]">
                  {item.category}
                </div>
                <div className="absolute bottom-4 left-5 right-5">
                  <h3 className="font-serif-display text-2xl text-[#f5f2eb] group-hover:text-[#e8cd8b] transition">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#cfc9be] mt-0.5">{item.photographerName}</p>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between text-[11px] font-mono-tech text-[#8f8b82]">
                <span className="truncate">{item.camera}</span>
                <span>{item.year}</span>
              </div>
            </motion.article>
          ))}
        </motion.div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxItem(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl w-full rounded-3xl overflow-hidden border border-white/15 bg-[#121216] grid grid-cols-1 lg:grid-cols-12 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setLightboxItem(null)}
                aria-label="Close lightbox"
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/65 border border-white/20 text-white flex items-center justify-center hover:border-[#d4af37]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="lg:col-span-7 bg-black flex items-center justify-center max-h-[75vh]">
                <img
                  src={lightboxItem.image}
                  alt={lightboxItem.title}
                  className="w-full h-full object-contain max-h-[75vh]"
                />
              </div>

              <div className="lg:col-span-5 p-7 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-[10px] font-mono-tech uppercase tracking-widest text-[#e8cd8b]">
                    {lightboxItem.category} • {lightboxItem.year}
                  </span>
                  <h2 className="font-serif-display text-4xl text-[#f5f2eb]">
                    {lightboxItem.title}
                  </h2>
                  <p className="text-sm text-[#a19e95] leading-relaxed">
                    {lightboxItem.description}
                  </p>

                  <div className="pt-4 space-y-2.5 border-t border-white/10 text-xs text-[#cfc9be]">
                    <div className="flex items-center gap-2.5">
                      <Camera className="w-4 h-4 text-[#d4af37]" />
                      <span className="font-mono-tech">{lightboxItem.camera}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Aperture className="w-4 h-4 text-[#d4af37]" />
                      <span className="font-mono-tech">
                        {lightboxItem.lens} • {lightboxItem.settings}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[#d4af37]" />
                      <span>{lightboxItem.location}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 space-y-3">
                  <p className="text-xs text-[#8f8b82]">
                    Photographed by <strong className="text-[#f5f2eb]">{lightboxItem.photographerName}</strong>
                  </p>
                  <Link
                    to={`/booking?photographer=${lightboxItem.photographerSlug}`}
                    onClick={() => setSelectedPhotographerSlug(lightboxItem.photographerSlug)}
                    className="btn-luminous w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.18em] flex items-center justify-center gap-2"
                  >
                    Commission {lightboxItem.photographerName.split(' ')[0]}
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
