import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Aperture, Globe, Sparkles, ArrowRight } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const MILESTONES = [
  {
    year: '2018',
    title: 'Founding in Ballard Estate, Mumbai',
    detail:
      'Elena Vance and Marcus Thorne converted a 1920s maritime warehouse into a north-lit cyclorama studio and hand-processing silver-gelatin darkroom.',
  },
  {
    year: '2021',
    title: 'Paris & Kyoto Salon Openings',
    detail:
      'Aria Takahashi joined as Senior Documentary Director, expanding our footprint to intimate European elopements and Kyoto heritage commissions.',
  },
  {
    year: '2024',
    title: 'Phase One & Hasselblad Certified Partner',
    detail:
      'Equipped all three ateliers with 100MP–150MP medium-format backs, synchronized Profoto Pro-11 strobes, and archival ICC color pipelines.',
  },
  {
    year: '2026',
    title: 'Live Concierge & Date-Locking Platform',
    detail:
      'Launched transparent real-time calendars so collectors, brands, and couples can inspect availability and reserve directly with their artist.',
  },
];

export default function AboutPage() {
  return (
    <PageTransition className="pt-32 pb-20 max-w-7xl mx-auto px-5 sm:px-8 space-y-20">
      {/* Intro Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-mono-tech uppercase tracking-[0.26em] text-[#d4af37]">
            Our Heritage & Craft
          </span>
          <h1 className="font-serif-display text-5xl sm:text-6xl font-medium text-[#f5f2eb] leading-[1.03]">
            Analog Patience Meets{' '}
            <span className="italic text-gradient-gold">Medium-Format Precision</span>
          </h1>
          <p className="text-base text-[#b9b4aa] leading-relaxed">
            Atelier Lumière was created as an antidote to hurried, assembly-line photography. We accept a deliberately limited number of commissions per month so every sitting receives unhurried lighting architecture, analog film craft, and archival color grading.
          </p>
          <div className="grid grid-cols-3 gap-5 pt-4 border-t border-white/10">
            <div>
              <p className="font-serif-display text-3xl text-[#e8cd8b]">8+ Yrs</p>
              <p className="text-xs text-[#a19e95]">Fine Art Practice</p>
            </div>
            <div>
              <p className="font-serif-display text-3xl text-[#f5f2eb]">3 Cities</p>
              <p className="text-xs text-[#a19e95]">Mumbai • Paris • Kyoto</p>
            </div>
            <div>
              <p className="font-serif-display text-3xl text-[#f5f2eb]">18 Awards</p>
              <p className="text-xs text-[#a19e95]">Editorial & Design</p>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65 }}
          className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl"
        >
          <img
            src="/images/studio-hero.jpg"
            alt="Atelier Lumière Cyclorama Studio"
            className="w-full h-[460px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 glass-atelier rounded-2xl p-5">
            <p className="font-serif-display text-2xl text-[#f5f2eb]">
              “Every shadow is a deliberate decision.”
            </p>
            <p className="text-xs font-mono-tech text-[#d4af37] mt-1">
              BALLARD ESTATE CYCLORAMA • STUDIO I
            </p>
          </div>
        </motion.div>
      </section>

      {/* Studio Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: Aperture,
            title: 'Museum Optics & Film',
            body: 'From Hasselblad 500C/M film bodies to Phase One 150MP backs, we choose optical character over sterile digital sharpness.',
          },
          {
            icon: Sparkles,
            title: 'Bespoke Color Mastering',
            body: 'Every delivered gallery is hand-graded in-house on calibrated EIZO ColorEdge reference displays—never batch-filtered.',
          },
          {
            icon: Globe,
            title: 'Worldwide Commissions',
            body: 'While anchored in Mumbai, Paris, and Kyoto, our artists travel globally for architectural monographs and destination weddings.',
          },
        ].map((pillar) => (
          <div key={pillar.title} className="glass-atelier rounded-2xl p-7 space-y-4">
            <div className="w-11 h-11 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#e8cd8b]">
              <pillar.icon className="w-5 h-5" />
            </div>
            <h3 className="font-serif-display text-2xl text-[#f5f2eb]">{pillar.title}</h3>
            <p className="text-sm text-[#a19e95] leading-relaxed">{pillar.body}</p>
          </div>
        ))}
      </section>

      {/* Timeline */}
      <section className="rounded-3xl border border-white/10 bg-[#121216] p-8 sm:p-12 space-y-8">
        <div className="flex items-center gap-3 text-[#e8cd8b]">
          <Award className="w-5 h-5" />
          <span className="text-xs font-mono-tech uppercase tracking-[0.24em]">Studio Chronicle</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MILESTONES.map((m) => (
            <div key={m.year} className="border-t border-[#d4af37]/35 pt-5 space-y-2">
              <span className="font-mono-tech text-xs text-[#e8cd8b]">{m.year}</span>
              <h4 className="font-serif-display text-2xl text-[#f5f2eb]">{m.title}</h4>
              <p className="text-xs text-[#a19e95] leading-relaxed">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center space-y-5 py-6">
        <h2 className="font-serif-display text-4xl text-[#f5f2eb]">
          Ready to Create Together?
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/photographers"
            className="btn-luminous px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.18em] inline-flex items-center gap-2"
          >
            Meet Our Photographers <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="px-7 py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.18em] border border-white/15 hover:border-[#d4af37]/50 transition"
          >
            Contact Concierge
          </Link>
        </div>
      </section>
    </PageTransition>
  );
}
