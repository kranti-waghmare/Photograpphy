import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Aperture, CalendarCheck, Menu, X, ArrowUpRight } from 'lucide-react';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/photographers', label: 'Photographers' },
  { to: '/booking', label: 'Booking' },
  { to: '/about', label: 'About Us' },
  { to: '/careers', label: 'Careers' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#09090b]/85 backdrop-blur-xl border-b border-white/10 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.55)]'
          : 'bg-gradient-to-b from-[#09090b]/90 via-[#09090b]/45 to-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="group flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-[#e8cd8b] via-[#d4af37] to-[#c87d65] p-[1px] shadow-[0_0_24px_rgba(212,175,55,0.28)]">
            <div className="w-full h-full rounded-full bg-[#0c0c10] flex items-center justify-center">
              <Aperture className="w-5 h-5 text-[#e8cd8b] transition-transform duration-500 group-hover:rotate-90" />
            </div>
          </div>
          <div>
            <span className="font-serif-display text-xl sm:text-2xl font-semibold tracking-wide text-[#f5f2eb] block leading-none">
              Atelier Lumière
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#d4af37]/80 font-medium">
              Fine Art Studio
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden lg:flex items-center gap-1 rounded-full bg-white/[0.04] border border-white/[0.08] px-2 py-1.5 backdrop-blur-md">
          {NAV_LINKS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors rounded-full ${
                  isActive ? 'text-[#09090b]' : 'text-[#d6d2c9] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#e8cd8b] via-[#d4af37] to-[#c87d65]"
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right Action */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/booking"
            className="btn-luminous inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-[0.14em]"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            Book Session
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          className="lg:hidden w-10 h-10 rounded-full border border-white/15 bg-white/5 flex items-center justify-center text-[#f5f2eb] hover:border-[#d4af37]/60 transition"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden mx-4 mt-3 rounded-2xl glass-atelier p-5 shadow-2xl"
          >
            <div className="flex flex-col gap-1.5">
              {NAV_LINKS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-gradient-to-r from-[#e8cd8b]/20 to-[#c87d65]/20 text-[#e8cd8b] border border-[#d4af37]/30'
                        : 'text-[#d6d2c9] hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/booking"
                className="btn-luminous mt-3 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest"
              >
                <CalendarCheck className="w-4 h-4" />
                Reserve Your Date
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
