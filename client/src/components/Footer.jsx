import React from 'react';
import { Link } from 'react-router-dom';
import { Aperture, Instagram, Globe, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-gradient-to-b from-[#0b0b0f] via-[#100f14] to-[#070709] overflow-hidden">
      {/* Ambient gradient glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[680px] h-[260px] bg-gradient-to-r from-[#d4af37]/15 via-[#c87d65]/15 to-transparent blur-3xl rounded-full" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-14 border-b border-white/10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e8cd8b] via-[#d4af37] to-[#c87d65] p-[1px]">
                <div className="w-full h-full rounded-full bg-[#09090b] flex items-center justify-center">
                  <Aperture className="w-5 h-5 text-[#e8cd8b]" />
                </div>
              </div>
              <div>
                <span className="font-serif-display text-2xl font-semibold text-[#f5f2eb] block leading-none">
                  Atelier Lumière
                </span>
                <span className="text-[10px] uppercase tracking-[0.26em] text-[#d4af37]">
                  Est. 2018 • Mumbai • Paris • Kyoto
                </span>
              </div>
            </Link>
            <p className="text-sm text-[#a19e95] leading-relaxed max-w-sm">
              A collective of three principal fine-art photographers crafting medium-format fashion editorials, architectural monographs, and intimate destination celebrations.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {[
                { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
                { icon: Globe, label: 'Behance', href: 'https://behance.net' },
                { icon: Mail, label: 'Email', href: 'mailto:concierge@atelierlumiere.studio' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? '_blank' : undefined}
                  rel="noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] flex items-center justify-center text-[#d6d2c9] hover:text-[#e8cd8b] hover:border-[#d4af37]/50 hover:bg-[#d4af37]/10 transition"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Studio Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8cd8b]">
              The Studio
            </h4>
            <ul className="space-y-2.5 text-sm text-[#a19e95]">
              {[
                { label: 'Home', to: '/' },
                { label: 'Portfolio', to: '/portfolio' },
                { label: 'Our Photographers', to: '/photographers' },
                { label: 'About Us', to: '/about' },
                { label: 'Careers', to: '/careers' },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-[#f5f2eb] transition inline-flex items-center gap-1">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Client Concierge */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8cd8b]">
              Reservations & Care
            </h4>
            <ul className="space-y-2.5 text-sm text-[#a19e95]">
              <li>
                <Link to="/booking" className="hover:text-[#f5f2eb] transition">
                  Check Availability Calendar
                </Link>
              </li>
              <li>
                <Link to="/booking?tab=manage" className="hover:text-[#f5f2eb] transition">
                  Manage or Cancel Booking
                </Link>
              </li>
              <li>
                <Link to="/payment" className="hover:text-[#f5f2eb] transition">
                  Payment & Verification Portal
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#f5f2eb] transition">
                  Bespoke Commission Inquiry
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e8cd8b]">
              Flagship Atelier
            </h4>
            <div className="space-y-3 text-sm text-[#a19e95]">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                <span>14 Ballard Estate Heritage Loft, Fort, Mumbai 400001</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>+91 22 4890 7721</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#d4af37] shrink-0" />
                <span>concierge@atelierlumiere.studio</span>
              </p>
              <Link
                to="/booking"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#e8cd8b] hover:underline pt-1"
              >
                Schedule Private Viewing <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7d7a72]">
          <p>© {new Date().getFullYear()} Atelier Lumière Fine Art Photography. All rights reserved.</p>
          <p className="font-mono-tech text-[11px] tracking-wider">
            HASSELBLAD • LEICA • PHASE ONE CERTIFIED STUDIO
          </p>
        </div>
      </div>
    </footer>
  );
}
