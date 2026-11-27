import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { api } from '../services/api';
import { useStudio } from '../context/StudioContext';

export default function ContactPage() {
  const { photographers, showToast } = useStudio();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Bespoke Commission Inquiry',
    preferredPhotographer: 'Any Available Master',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.submitContact(form);
      setSubmitted(true);
      showToast('Inquiry delivered to our studio producer.');
    } catch (err) {
      showToast(err.message || 'Unable to submit message.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="pt-32 pb-20 max-w-7xl mx-auto px-5 sm:px-8">
      <div className="max-w-3xl space-y-4 mb-14">
        <span className="text-xs font-mono-tech uppercase tracking-[0.26em] text-[#d4af37]">
          Private Concierge
        </span>
        <h1 className="font-serif-display text-5xl sm:text-6xl font-medium text-[#f5f2eb]">
          Contact <span className="italic text-gradient-gold">Atelier Lumière</span>
        </h1>
        <p className="text-base text-[#a19e95] leading-relaxed">
          Planning a multi-day destination wedding, commercial lookbook, or private studio viewing? Speak directly with our production desk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Studio Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-atelier rounded-3xl p-7 space-y-6">
            <h2 className="font-serif-display text-3xl text-[#f5f2eb]">Atelier Studios</h2>
            <div className="space-y-5 text-sm text-[#cfc9be]">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#f5f2eb]">Mumbai Flagship & Darkroom</p>
                  <p className="text-[#a19e95]">14 Ballard Estate Heritage Loft, Fort, Mumbai 400001</p>
                </div>
              </div>
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#c87d65] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#f5f2eb]">Paris & Kyoto Salons</p>
                  <p className="text-[#a19e95]">Rue de Turenne, Le Marais • Higashiyama Ward</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <Phone className="w-5 h-5 text-[#d4af37] shrink-0" />
                <span>+91 22 4890 7721</span>
              </div>
              <div className="flex items-center gap-3.5">
                <Mail className="w-5 h-5 text-[#d4af37] shrink-0" />
                <span>concierge@atelierlumiere.studio</span>
              </div>
              <div className="flex items-center gap-3.5">
                <Clock className="w-5 h-5 text-[#d4af37] shrink-0" />
                <span>Tue – Sun • 10:00 AM – 7:30 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          {submitted ? (
            <div className="glass-atelier rounded-3xl p-10 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-[#e8cd8b] mx-auto" />
              <h3 className="font-serif-display text-3xl text-[#f5f2eb]">
                Message Received With Thanks
              </h3>
              <p className="text-sm text-[#a19e95] max-w-md mx-auto">
                Our studio producer will review your brief and respond to{' '}
                <span className="text-[#f5f2eb]">{form.email}</span> within 4 business hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setForm({
                    name: '',
                    email: '',
                    phone: '',
                    subject: 'Bespoke Commission Inquiry',
                    preferredPhotographer: 'Any Available Master',
                    message: '',
                  });
                }}
                className="btn-luminous px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-atelier rounded-3xl p-7 sm:p-9 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                    Your Name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Aarav Sharma"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="aarav@domain.com"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                    Phone / WhatsApp
                  </label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 98200 00000"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                    Preferred Photographer
                  </label>
                  <select
                    value={form.preferredPhotographer}
                    onChange={(e) => setForm({ ...form, preferredPhotographer: e.target.value })}
                    className="w-full rounded-xl bg-[#15151a] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  >
                    <option value="Any Available Master">Any Available Master</option>
                    {photographers.map((p) => (
                      <option key={p.slug} value={p.name}>
                        {p.name} ({p.categories[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                  Subject *
                </label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                  Project Brief *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Share your vision, tentative dates, location, and deliverables..."
                  className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-luminous w-full py-4 rounded-full text-xs font-semibold uppercase tracking-[0.18em] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending to Studio...' : 'Send Concierge Inquiry'}
              </button>
            </form>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
