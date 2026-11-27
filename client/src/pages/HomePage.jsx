import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowDown,
  Camera,
  Sparkles,
  Film,
  Compass,
  Award,
  Calendar,
  Star,
  Quote,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import StarRating from '../components/StarRating';
import { SkeletonCard } from '../components/Skeletons';
import { api } from '../services/api';
import { useStudio } from '../context/StudioContext';
import { formatINR } from '../utils/formatters';

const SERVICES = [
  {
    icon: Sparkles,
    title: 'Editorial & Fashion Campaigns',
    subtitle: 'Lookbooks, Runway & Luxury Brand Stories',
    description:
      'Tethered medium-format studio & location productions complete with art direction, Profoto lighting design, and commercial print licensing.',
    price: 'From ₹45,000',
    slug: 'elena-vance',
  },
  {
    icon: Film,
    title: 'Destination Weddings & Analog',
    subtitle: 'Intimate Ceremonies & Heritage Weekends',
    description:
      'Unobtrusive documentary coverage blending Leica digital cinema with genuine Kodak Portra 35mm film rolls and heirloom albums.',
    price: 'From ₹52,000',
    slug: 'aria-takahashi',
  },
  {
    icon: Compass,
    title: 'Architecture & Hospitality',
    subtitle: 'Residences, Museums & Luxury Palaces',
    description:
      'Perspective-corrected Phase One 150MP architectural plates captured across full solar cycles from dawn through twilight.',
    price: 'From ₹38,000',
    slug: 'marcus-thorne',
  },
  {
    icon: Camera,
    title: 'Private Atelier Portraiture',
    subtitle: 'Executive, Artist & Collector Sittings',
    description:
      'Quiet, intentional studio sittings sculpted with tungsten and natural north light, finished on archival silver-gelatin and cotton rag.',
    price: 'From ₹38,000',
    slug: 'elena-vance',
  },
];

export default function HomePage() {
  const { photographers, loadingPhotographers, setSelectedPhotographerSlug } = useStudio();
  const [featuredPortfolio, setFeaturedPortfolio] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api
      .getPortfolio({ featured: 'true' })
      .then((res) => {
        if (active) setFeaturedPortfolio(res.items || []);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoadingPortfolio(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const allReviews = photographers.flatMap((p) =>
    (p.reviews || []).slice(0, 2).map((r) => ({
      ...r,
      photographerName: p.name,
      photographerSlug: p.slug,
      photographerAvatar: p.avatar,
    }))
  );

  const handleBookPhotographer = (slug) => {
    setSelectedPhotographerSlug(slug);
    navigate(`/booking?photographer=${slug}`);
  };

  return (
    <PageTransition>
      {/* 1. ANIMATED HERO SECTION WITH HD PHOTOGRAPHY VIDEO */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Background Video + Animated Nature Photography Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#09090b]">
          {/* Animated ambient nature photographer poster fallback (always vivid, zero blank frames) */}
          <motion.img
            src="/images/nature-hero-poster.jpg"
            alt="Photographer capturing scenic landscapes in nature"
            initial={{ scale: 1.08 }}
            animate={{ scale: [1.08, 1.02, 1.08] }}
            transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoReady ? 'opacity-25' : 'opacity-65'
            }`}
          />

          {/* High-Definition Nature Photographer Background Video (1080p HD) */}
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="/images/nature-hero-poster.jpg"
            onCanPlay={() => setVideoReady(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              videoReady ? 'opacity-75' : 'opacity-0'
            }`}
          >
            <source src="/videos/nature-photographer-hd.mp4" type="video/mp4" />
            <source
              src="https://assets.mixkit.co/videos/50549/50549-1080.mp4"
              type="video/mp4"
            />
            <source
              src="https://assets.mixkit.co/videos/2482/2482-1080.mp4"
              type="video/mp4"
            />
          </video>

          {/* Editorial Dark Vignette & Golden Lens Flare Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/75 to-[#09090b]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/70" />
          <div className="absolute -top-24 -right-24 w-[540px] h-[540px] rounded-full bg-gradient-to-br from-[#d4af37]/20 via-[#c87d65]/15 to-transparent blur-3xl pointer-events-none" />
          <div className="film-grain absolute inset-0 opacity-35 pointer-events-none" />
        </div>

        {/* Hero Foreground */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 w-full">
          <div className="max-w-3xl space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-[#d4af37]/35 bg-[#121216]/70 backdrop-blur-md"
            >
              <span className="w-2 h-2 rounded-full bg-[#e8cd8b] animate-pulse" />
              <span className="text-[11px] font-mono-tech uppercase tracking-[0.22em] text-[#e8cd8b]">
                2026–2027 Commissions Now Open
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1 }}
              className="font-serif-display text-5xl sm:text-7xl lg:text-[5.25rem] font-medium leading-[0.98] tracking-tight text-[#f5f2eb]"
            >
              Sculpting Light Into{' '}
              <span className="italic text-gradient-gold">Heirloom Cinema</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2 }}
              className="text-base sm:text-lg text-[#cfc9be] leading-relaxed max-w-2xl"
            >
              Atelier Lumière unites three internationally acclaimed visual artists working across Hasselblad medium-format, Leica optics, and analog film. Reserve live dates directly with your chosen photographer.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                to="/booking"
                className="btn-luminous inline-flex items-center gap-2.5 px-7 py-4 rounded-full text-xs font-semibold uppercase tracking-[0.18em]"
              >
                <Calendar className="w-4 h-4" />
                Reserve a Session
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-full text-xs font-semibold uppercase tracking-[0.18em] border border-white/20 bg-white/[0.04] backdrop-blur-md text-[#f5f2eb] hover:border-[#d4af37]/60 hover:bg-white/[0.08] transition"
              >
                Explore Portfolio
              </Link>
            </motion.div>

            {/* Trust Stats Ribbon */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.45 }}
              className="pt-8 grid grid-cols-3 gap-6 max-w-xl border-t border-white/10"
            >
              <div>
                <p className="font-serif-display text-3xl text-[#e8cd8b]">4.97★</p>
                <p className="text-xs text-[#a19e95] mt-0.5">151+ Verified Reviews</p>
              </div>
              <div>
                <p className="font-serif-display text-3xl text-[#f5f2eb]">3 Masters</p>
                <p className="text-xs text-[#a19e95] mt-0.5">Independent Calendars</p>
              </div>
              <div>
                <p className="font-serif-display text-3xl text-[#f5f2eb]">100%</p>
                <p className="text-xs text-[#a19e95] mt-0.5">Live Date Locking</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Smooth Scroll Cue */}
        <a
          href="#collections"
          aria-label="Scroll to collections"
          className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 text-[#a19e95] hover:text-[#e8cd8b] transition"
        >
          <span className="text-[10px] font-mono-tech uppercase tracking-[0.26em]">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </a>
      </section>

      {/* 2. FEATURED PHOTOGRAPHY COLLECTIONS */}
      <section id="collections" className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="text-xs font-mono-tech uppercase tracking-[0.26em] text-[#d4af37]">
              Curated Archive
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl font-medium text-[#f5f2eb]">
              Featured Collections
            </h2>
          </div>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#e8cd8b] hover:text-white transition"
          >
            View Complete Portfolio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingPortfolio ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredPortfolio.slice(0, 4).map((item, idx) => (
              <motion.div
                key={item._id || idx}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: idx * 0.08 }}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-[#121216] flex flex-col"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/20 to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-mono-tech uppercase tracking-widest bg-[#09090b]/75 border border-white/15 text-[#e8cd8b] backdrop-blur-md">
                    {item.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif-display text-2xl text-[#f5f2eb] group-hover:text-[#e8cd8b] transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#a19e95] mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono-tech text-[#8f8b82]">
                    <span>{item.photographerName}</span>
                    <span>{item.year}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 3. SIGNATURE SERVICES */}
      <section className="relative py-20 border-y border-white/10 bg-gradient-to-b from-[#0d0d11] via-[#121116] to-[#09090b]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="max-w-2xl space-y-3 mb-14">
            <span className="text-xs font-mono-tech uppercase tracking-[0.26em] text-[#c87d65]">
              Bespoke Disciplines
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl font-medium text-[#f5f2eb]">
              Studio Services & Commissions
            </h2>
            <p className="text-sm text-[#a19e95] leading-relaxed">
              Every commission includes pre-shoot creative direction, calibrated color mastering, and museum-grade private online galleries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.map((svc, idx) => (
              <motion.div
                key={svc.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="glass-atelier rounded-2xl p-7 hover:border-[#d4af37]/40 transition group flex flex-col justify-between gap-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#c87d65]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#e8cd8b]">
                      <svc.icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono-tech text-xs text-[#e8cd8b] bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/25">
                      {svc.price}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#a19e95]">
                      {svc.subtitle}
                    </p>
                    <h3 className="font-serif-display text-3xl text-[#f5f2eb] mt-1 group-hover:text-gradient-gold transition">
                      {svc.title}
                    </h3>
                  </div>
                  <p className="text-sm text-[#a19e95] leading-relaxed">{svc.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleBookPhotographer(svc.slug)}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#e8cd8b] hover:text-white transition font-medium"
                  >
                    Book This Discipline <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THREE PRINCIPAL PHOTOGRAPHERS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <span className="text-xs font-mono-tech uppercase tracking-[0.26em] text-[#d4af37]">
              The Collective
            </span>
            <h2 className="font-serif-display text-4xl sm:text-5xl font-medium text-[#f5f2eb]">
              Three Principal Photographers
            </h2>
            <p className="text-sm text-[#a19e95] max-w-xl">
              Each artist maintains an independent live availability calendar. Select your preferred master to explore packages and lock your date.
            </p>
          </div>
          <Link
            to="/photographers"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#e8cd8b] hover:text-white transition"
          >
            Compare All Profiles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingPhotographers ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {[1, 2, 3].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
            {photographers.map((artist, idx) => (
              <motion.article
                key={artist.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: idx * 0.1 }}
                className="group rounded-3xl border border-white/10 bg-gradient-to-b from-[#16161c] to-[#0f0f13] overflow-hidden flex flex-col justify-between hover:border-[#d4af37]/45 transition duration-500"
              >
                <div>
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={artist.avatar}
                      alt={artist.name}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#09090b]/80 backdrop-blur-md border border-white/15 text-[11px] font-mono-tech text-[#e8cd8b]">
                        {artist.experienceYears} Yrs Experience
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#09090b]/80 backdrop-blur-md border border-white/15 text-xs text-[#f5f2eb]">
                        <Star className="w-3.5 h-3.5 fill-[#e8cd8b] text-[#e8cd8b]" />
                        {artist.rating} ({artist.reviewCount})
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-[#c87d65]">
                      {artist.title}
                    </p>
                    <h3 className="font-serif-display text-3xl text-[#f5f2eb]">{artist.name}</h3>
                    <p className="text-sm text-[#a19e95] leading-relaxed">{artist.specialty}</p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-[#8f8b82] block">
                      Starting From
                    </span>
                    <span className="font-serif-display text-2xl text-[#e8cd8b]">
                      {formatINR(artist.startingPrice)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleBookPhotographer(artist.slug)}
                    className="btn-luminous px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em]"
                  >
                    Book {artist.name.split(' ')[0]}
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </section>

      {/* 5. CLIENT RATINGS, TESTIMONIALS & REVIEWS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#17161d] via-[#111116] to-[#171210] p-8 sm:p-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-10 border-b border-white/10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-[#e8cd8b] text-xs font-mono-tech uppercase tracking-[0.22em]">
                <Award className="w-4 h-4" /> Client Acclaim
              </div>
              <h2 className="font-serif-display text-4xl text-[#f5f2eb]">
                Words From Our Collectors & Clients
              </h2>
            </div>
            <div className="flex items-center gap-5 rounded-2xl bg-white/[0.04] border border-white/10 px-6 py-4">
              <div>
                <p className="font-serif-display text-4xl text-[#e8cd8b] leading-none">4.97</p>
                <p className="text-[11px] font-mono-tech text-[#a19e95] mt-1">STUDIO AVERAGE</p>
              </div>
              <div className="space-y-1">
                <StarRating rating={5} size="lg" />
                <p className="text-xs text-[#cfc9be]">Based on 151 verified commissions</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10">
            {allReviews.slice(0, 3).map((rev, idx) => (
              <div
                key={`${rev.clientName}-${idx}`}
                className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <StarRating rating={rev.rating} />
                    <Quote className="w-5 h-5 text-[#d4af37]/40" />
                  </div>
                  <p className="text-sm text-[#e4dfd5] leading-relaxed italic">“{rev.comment}”</p>
                </div>
                <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                  <img
                    src={rev.photographerAvatar}
                    alt={rev.photographerName}
                    className="w-9 h-9 rounded-full object-cover border border-[#d4af37]/40"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#f5f2eb]">{rev.clientName}</p>
                    <p className="text-[11px] text-[#a19e95]">
                      {rev.role} • with {rev.photographerName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
