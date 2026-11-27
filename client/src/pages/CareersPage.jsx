import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, ArrowUpRight, X, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { api } from '../services/api';
import { useStudio } from '../context/StudioContext';

const OPEN_ROLES = [
  {
    id: 'retoucher-colorist',
    title: 'Senior Archival Colorist & Retoucher',
    department: 'Post-Production & Print',
    location: 'Mumbai Flagship (Hybrid)',
    type: 'Full-Time',
    summary:
      'Lead medium-format 16-bit TIFF color grading, skin texture preservation, and Epson SureColor fine-art pigment print proofing.',
  },
  {
    id: 'lighting-first-assistant',
    title: 'First Lighting & Digital Tech Assistant',
    department: 'Studio Production',
    location: 'Mumbai & Travel',
    type: 'Full-Time',
    summary:
      'Manage Capture One tethering on commercial sets, Profoto Pro-11 strobe setups, and Hasselblad medium-format kit preparation.',
  },
  {
    id: 'studio-producer',
    title: 'Client Concierge & Shoot Producer',
    department: 'Client Experience',
    location: 'Mumbai / Remote',
    type: 'Full-Time',
    summary:
      'Coordinate location permits, wardrobe stylists, destination travel logistics, and VIP client gallery handoffs.',
  },
  {
    id: 'analog-darkroom-intern',
    title: '35mm & 120mm Film Darkroom Fellow',
    department: 'Analog Lab',
    location: 'Mumbai Flagship',
    type: '6-Month Fellowship',
    summary:
      'Hand-process C-41 and black-and-white rolls, catalog contact sheets, and assist principal photographers on editorial sets.',
  },
];

export default function CareersPage() {
  const { showToast } = useStudio();
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    portfolioUrl: '',
    experienceYears: '2',
    coverNote: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submittedRole, setSubmittedRole] = useState(null);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!selectedRole) return;
    try {
      setSubmitting(true);
      await api.submitCareerApplication({
        roleId: selectedRole.id,
        roleTitle: selectedRole.title,
        ...form,
      });
      setSubmittedRole(selectedRole.title);
      setSelectedRole(null);
      setForm({
        fullName: '',
        email: '',
        portfolioUrl: '',
        experienceYears: '2',
        coverNote: '',
      });
      showToast('Application submitted to our creative directors.');
    } catch (err) {
      showToast(err.message || 'Could not submit application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="pt-32 pb-20 max-w-7xl mx-auto px-5 sm:px-8 space-y-14">
      <div className="max-w-3xl space-y-4">
        <span className="text-xs font-mono-tech uppercase tracking-[0.26em] text-[#d4af37]">
          Join The Collective
        </span>
        <h1 className="font-serif-display text-5xl sm:text-6xl font-medium text-[#f5f2eb]">
          Studio <span className="italic text-gradient-gold">Careers</span>
        </h1>
        <p className="text-base text-[#a19e95] leading-relaxed">
          We are a close-knit atelier of visual obsessives—retouchers, lighting directors, producers, and darkroom artisans shaping timeless imagery.
        </p>
      </div>

      {submittedRole && (
        <div className="rounded-2xl border border-[#d4af37]/40 bg-[#d4af37]/10 p-5 flex items-center gap-3 text-sm text-[#f5f2eb]">
          <CheckCircle2 className="w-5 h-5 text-[#e8cd8b] shrink-0" />
          <span>
            Your portfolio for <strong>{submittedRole}</strong> has been logged. Our studio directors review applications every Friday.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {OPEN_ROLES.map((role) => (
          <div
            key={role.id}
            className="glass-atelier rounded-3xl p-7 flex flex-col justify-between gap-6 hover:border-[#d4af37]/45 transition"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono-tech uppercase tracking-widest text-[#e8cd8b]">
                  {role.department}
                </span>
                <span className="text-xs font-mono-tech text-[#a19e95]">{role.type}</span>
              </div>
              <h2 className="font-serif-display text-3xl text-[#f5f2eb]">{role.title}</h2>
              <p className="text-sm text-[#a19e95] leading-relaxed">{role.summary}</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#cfc9be]">
                <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
                {role.location}
              </span>
              <button
                type="button"
                onClick={() => setSelectedRole(role)}
                className="btn-luminous px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5"
              >
                Apply Now <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Application Modal */}
      <AnimatePresence>
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRole(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-lg w-full rounded-3xl border border-white/15 bg-[#121216] p-7 space-y-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d4af37]">
                    Role Application
                  </span>
                  <h3 className="font-serif-display text-3xl text-[#f5f2eb] mt-1">
                    {selectedRole.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRole(null)}
                  className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-[#a19e95] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    required
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-2.5 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                      Email *
                    </label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-2.5 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                      Years Experience *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={form.experienceYears}
                      onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                      className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-2.5 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                    Portfolio / Reel URL *
                  </label>
                  <input
                    required
                    type="url"
                    placeholder="https://behance.net/yourname"
                    value={form.portfolioUrl}
                    onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-2.5 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                    Why Atelier Lumière? *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={form.coverNote}
                    onChange={(e) => setForm({ ...form, coverNote: e.target.value })}
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-2.5 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-luminous w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-[0.18em] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Briefcase className="w-4 h-4" />
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
