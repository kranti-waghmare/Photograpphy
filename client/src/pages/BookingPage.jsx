import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Sparkles,
  Search,
  XCircle,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  MapPin,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { SkeletonCalendar } from '../components/Skeletons';
import { useStudio } from '../context/StudioContext';
import { api } from '../services/api';
import {
  formatINR,
  formatReadableDate,
  getMonthDaysGrid,
  toYYYYMMDD,
} from '../utils/formatters';

const TIME_SLOTS = [
  'Full Day Studio & Location (09:00 – 18:00)',
  'Morning Editorial Light (07:30 – 13:00)',
  'Golden Hour & Twilight (15:00 – 20:30)',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    photographers,
    loadingPhotographers,
    selectedPhotographerSlug,
    setSelectedPhotographerSlug,
    setActiveBooking,
    showToast,
  } = useStudio();

  const initialTab = searchParams.get('tab') === 'manage' ? 'manage' : 'reserve';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync URL query ?photographer=... or ?package=...
  useEffect(() => {
    const paramSlug = searchParams.get('photographer');
    if (paramSlug && photographers.some((p) => p.slug === paramSlug)) {
      setSelectedPhotographerSlug(paramSlug);
    }
    if (searchParams.get('tab') === 'manage') {
      setActiveTab('manage');
    }
  }, [searchParams, photographers, setSelectedPhotographerSlug]);

  const currentArtist =
    photographers.find((p) => p.slug === selectedPhotographerSlug) || photographers[0] || null;

  // Calendar state
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [bookedDates, setBookedDates] = useState([]);
  const [loadingCalendar, setLoadingCalendar] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');

  // Form state
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [shootLocation, setShootLocation] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Manage & Cancel Bookings state
  const [bookingsList, setBookingsList] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [lookupQuery, setLookupQuery] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  // Set default package & location when photographer changes
  useEffect(() => {
    if (!currentArtist) return;
    const paramPkg = searchParams.get('package');
    const matchingPkg = currentArtist.packages.find((p) => p.id === paramPkg);
    const popularPkg = currentArtist.packages.find((p) => p.popular) || currentArtist.packages[0];
    setSelectedPackageId((matchingPkg || popularPkg)?.id || '');
    setShootLocation(currentArtist.location);
    setSelectedDate('');
    setBookingError('');
  }, [currentArtist?.slug]);

  const fetchAvailability = useCallback(async () => {
    if (!currentArtist) return;
    try {
      setLoadingCalendar(true);
      const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;
      const data = await api.getAvailability(currentArtist.slug, monthStr);
      setBookedDates(data.bookedDates || []);
    } catch (err) {
      console.error('Failed to fetch availability', err);
    } finally {
      setLoadingCalendar(false);
    }
  }, [currentArtist, viewYear, viewMonth]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const fetchBookingsList = useCallback(async (query = '') => {
    try {
      setLoadingBookings(true);
      const trimmed = query.trim();
      const params = {};
      if (trimmed) {
        if (trimmed.includes('@')) params.email = trimmed;
        else params.code = trimmed;
      }
      const data = await api.getBookings(params);
      setBookingsList(data.bookings || []);
    } catch (err) {
      showToast(err.message || 'Unable to load bookings', 'error');
    } finally {
      setLoadingBookings(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchBookingsList(lookupQuery);
    }
  }, [activeTab]);

  const bookedMap = new Map(bookedDates.map((b) => [b.date, b]));
  const todayStr = toYYYYMMDD(new Date());
  const daysGrid = getMonthDaysGrid(viewYear, viewMonth);
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const selectedPackage =
    currentArtist?.packages.find((p) => p.id === selectedPackageId) ||
    currentArtist?.packages[0] ||
    null;

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingError('');

    if (!currentArtist || !selectedDate || !selectedPackage) {
      setBookingError('Please select a photographer, an available date on the calendar, and a package.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createBooking({
        photographerSlug: currentArtist.slug,
        date: selectedDate,
        timeSlot,
        packageId: selectedPackage.id,
        shootType: currentArtist.categories[0],
        location: shootLocation || currentArtist.location,
        clientName,
        clientEmail,
        clientPhone,
        notes,
      });

      setActiveBooking(res.booking);
      showToast(`Date ${selectedDate} reserved! Proceeding to secure payment...`);
      await fetchAvailability();
      navigate(`/payment/${res.booking.bookingCode}`);
    } catch (err) {
      setBookingError(err.message || 'Failed to reserve session.');
      showToast(err.message || 'Date unavailable.', 'error');
      fetchAvailability();
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    try {
      setCancellingId(booking._id);
      const res = await api.cancelBooking(
        booking.bookingCode,
        'Client cancelled via Studio Booking Manager'
      );
      showToast(res.message);
      await fetchBookingsList(lookupQuery);
      await fetchAvailability();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <PageTransition className="pt-32 pb-20 max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
      {/* Header + Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3">
          <span className="text-xs font-mono-tech uppercase tracking-[0.26em] text-[#d4af37]">
            Real-Time Studio Calendar
          </span>
          <h1 className="font-serif-display text-5xl sm:text-6xl font-medium text-[#f5f2eb]">
            Reserve Your <span className="italic text-gradient-gold">Session</span>
          </h1>
          <p className="text-sm sm:text-base text-[#a19e95] max-w-2xl">
            Each photographer operates an independent live availability calendar. Once a date is booked, it locks immediately to prevent double-bookings—and unlocks automatically if cancelled.
          </p>
        </div>

        <div className="inline-flex rounded-full bg-white/[0.04] border border-white/10 p-1.5 self-start">
          <button
            type="button"
            onClick={() => {
              setActiveTab('reserve');
              setSearchParams({ photographer: selectedPhotographerSlug });
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'reserve'
                ? 'btn-luminous'
                : 'text-[#cfc9be] hover:text-white'
            }`}
          >
            New Booking
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('manage');
              setSearchParams({ tab: 'manage' });
            }}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'manage'
                ? 'btn-luminous'
                : 'text-[#cfc9be] hover:text-white'
            }`}
          >
            Manage & Cancel
          </button>
        </div>
      </div>

      {activeTab === 'reserve' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Steps 1-3 */}
          <div className="lg:col-span-8 space-y-8">
            {/* STEP 1: SELECT PHOTOGRAPHER */}
            <section className="glass-atelier rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="font-serif-display text-3xl text-[#f5f2eb]">
                  1. Select Your Photographer
                </h2>
                <span className="text-[11px] font-mono-tech uppercase tracking-widest text-[#d4af37]">
                  Independent Calendars
                </span>
              </div>

              {loadingPhotographers ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-36 rounded-2xl skeleton-shimmer" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {photographers.map((artist) => {
                    const isSelected = currentArtist?.slug === artist.slug;
                    return (
                      <button
                        key={artist.slug}
                        type="button"
                        onClick={() => setSelectedPhotographerSlug(artist.slug)}
                        className={`text-left rounded-2xl p-4 border transition relative overflow-hidden ${
                          isSelected
                            ? 'border-[#d4af37] bg-gradient-to-br from-[#d4af37]/15 to-[#15151b] shadow-[0_0_25px_rgba(212,175,55,0.2)]'
                            : 'border-white/10 bg-white/[0.025] hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={artist.avatar}
                            alt={artist.name}
                            className="w-12 h-12 rounded-full object-cover border border-white/20"
                          />
                          <div className="min-w-0">
                            <p className="font-serif-display text-xl text-[#f5f2eb] truncate">
                              {artist.name}
                            </p>
                            <p className="text-[11px] text-[#a19e95] truncate">
                              {artist.categories.join(' • ')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-[#e8cd8b] font-mono-tech">
                            From {formatINR(artist.startingPrice)}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech uppercase text-[#e8cd8b]">
                              <Check className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* STEP 2: INDEPENDENT AVAILABILITY CALENDAR */}
            <section className="glass-atelier rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif-display text-3xl text-[#f5f2eb]">
                    2. {currentArtist ? `${currentArtist.name}’s` : 'Artist'} Availability Calendar
                  </h2>
                  <p className="text-xs text-[#a19e95] mt-1">
                    Booked dates are automatically locked and disabled below.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    aria-label="Previous month"
                    className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center hover:border-[#d4af37] transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-serif-display text-2xl text-[#f5f2eb] min-w-[160px] text-center">
                    {monthLabel}
                  </span>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    aria-label="Next month"
                    className="w-9 h-9 rounded-full border border-white/15 bg-white/5 flex items-center justify-center hover:border-[#d4af37] transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-5 text-xs text-[#b9b4aa]">
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-400/60" />
                  Available
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-rose-500/25 border border-rose-500/50" />
                  Booked / Unavailable
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-[#d4af37] border border-[#e8cd8b]" />
                  Selected Date
                </span>
                <span className="ml-auto font-mono-tech text-[11px] text-[#e8cd8b]">
                  {bookedDates.length} date{bookedDates.length === 1 ? '' : 's'} booked this month
                </span>
              </div>

              {loadingCalendar ? (
                <SkeletonCalendar />
              ) : (
                <div>
                  <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                    {WEEKDAYS.map((day) => (
                      <div
                        key={day}
                        className="text-[11px] font-mono-tech uppercase tracking-wider text-[#8f8b82] py-1"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {daysGrid.map((dateObj, idx) => {
                      if (!dateObj) {
                        return <div key={`empty-${idx}`} className="h-12 sm:h-14" />;
                      }

                      const dateStr = toYYYYMMDD(dateObj);
                      const isPast = dateStr < todayStr;
                      const bookedInfo = bookedMap.get(dateStr);
                      const isBooked = Boolean(bookedInfo);
                      const isSelected = selectedDate === dateStr;
                      const disabled = isPast || isBooked;

                      return (
                        <button
                          key={dateStr}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setBookingError('');
                          }}
                          title={
                            isBooked
                              ? `Booked (${bookedInfo.status === 'confirmed' ? 'Confirmed' : 'Pending Payment'})`
                              : isPast
                              ? 'Past date'
                              : `Available on ${dateStr}`
                          }
                          className={`relative h-12 sm:h-14 rounded-xl border text-sm font-medium transition flex flex-col items-center justify-center ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#e8cd8b] via-[#d4af37] to-[#c87d65] text-[#09090b] border-[#f5e1a4] font-bold shadow-[0_0_24px_rgba(212,175,55,0.4)]'
                              : isBooked
                              ? 'bg-rose-950/35 border-rose-500/35 text-rose-300/60 cursor-not-allowed'
                              : isPast
                              ? 'bg-white/[0.015] border-white/5 text-white/20 cursor-not-allowed'
                              : 'bg-emerald-950/20 border-emerald-500/25 text-[#f5f2eb] hover:border-[#d4af37] hover:bg-[#d4af37]/15'
                          }`}
                        >
                          <span>{dateObj.getDate()}</span>
                          {isBooked && (
                            <span className="text-[9px] font-mono-tech uppercase tracking-tighter text-rose-300/80 flex items-center gap-0.5">
                              <Lock className="w-2.5 h-2.5" /> Booked
                            </span>
                          )}
                          {!isBooked && !isPast && !isSelected && (
                            <span className="text-[9px] font-mono-tech text-emerald-400/75 hidden sm:block">
                              Open
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* STEP 3: PACKAGE & CLIENT DETAILS */}
            <form
              id="booking-form"
              onSubmit={handleCreateBooking}
              className="glass-atelier rounded-3xl p-6 sm:p-8 space-y-6"
            >
              <h2 className="font-serif-display text-3xl text-[#f5f2eb]">
                3. Package & Session Details
              </h2>

              {currentArtist && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentArtist.packages.map((pkg) => {
                    const active = pkg.id === selectedPackageId;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackageId(pkg.id)}
                        className={`text-left rounded-2xl p-4 border transition flex flex-col justify-between gap-3 ${
                          active
                            ? 'border-[#d4af37] bg-[#d4af37]/12'
                            : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                        }`}
                      >
                        <div>
                          <span className="text-[10px] font-mono-tech uppercase text-[#a19e95]">
                            {pkg.duration}
                          </span>
                          <p className="font-serif-display text-xl text-[#f5f2eb] mt-0.5">
                            {pkg.name}
                          </p>
                          <p className="text-xs text-[#a19e95] mt-1">{pkg.description}</p>
                        </div>
                        <p className="font-serif-display text-2xl text-[#e8cd8b]">
                          {formatINR(pkg.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                    Preferred Time Window
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full rounded-xl bg-[#15151a] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                    Shoot Location *
                  </label>
                  <input
                    required
                    value={shootLocation}
                    onChange={(e) => setShootLocation(e.target.value)}
                    placeholder="Atelier Studio I or Destination Venue"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                    Full Name *
                  </label>
                  <input
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ishaan Verma"
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
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="ishaan@example.com"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                    Phone Number *
                  </label>
                  <input
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+91 98201 11223"
                    className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-2">
                  Creative Direction / Moodboard Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Wardrobe palette, film stock preferences, lighting mood, or special requests..."
                  className="w-full rounded-xl bg-white/[0.04] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {bookingError && (
                <div className="rounded-xl bg-rose-950/50 border border-rose-500/40 p-4 flex items-start gap-3 text-sm text-rose-200">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedDate}
                className="btn-luminous w-full py-4 rounded-full text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-45 disabled:cursor-not-allowed"
              >
                <CreditCard className="w-4 h-4" />
                {submitting
                  ? 'Locking Date & Creating Reservation...'
                  : selectedDate
                  ? `Reserve ${selectedDate} & Proceed to Payment`
                  : 'Select an Available Date Above to Continue'}
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: LIVE BOOKING SUMMARY */}
          <aside className="lg:col-span-4 lg:sticky lg:top-28 space-y-5">
            <div className="rounded-3xl border border-[#d4af37]/30 bg-gradient-to-b from-[#18171e] to-[#101014] p-7 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-xs font-mono-tech uppercase tracking-[0.22em] text-[#e8cd8b]">
                  Commission Summary
                </span>
                <Sparkles className="w-4 h-4 text-[#d4af37]" />
              </div>

              {currentArtist && (
                <div className="flex items-center gap-3.5">
                  <img
                    src={currentArtist.avatar}
                    alt={currentArtist.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#d4af37]/40"
                  />
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-[#a19e95]">
                      Principal Artist
                    </p>
                    <p className="font-serif-display text-2xl text-[#f5f2eb]">
                      {currentArtist.name}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm border-y border-white/10 py-5">
                <div className="flex justify-between gap-2">
                  <span className="text-[#a19e95]">Selected Date</span>
                  <span className="font-medium text-[#f5f2eb] text-right">
                    {selectedDate ? formatReadableDate(selectedDate) : 'Not selected yet'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#a19e95]">Package</span>
                  <span className="font-medium text-[#f5f2eb] text-right">
                    {selectedPackage?.name || '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#a19e95]">Duration</span>
                  <span className="font-mono-tech text-xs text-[#cfc9be]">
                    {selectedPackage?.duration || '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#a19e95]">Location</span>
                  <span className="text-[#cfc9be] text-right truncate max-w-[180px]">
                    {shootLocation || '—'}
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-widest text-[#a19e95]">
                  Total Investment
                </span>
                <span className="font-serif-display text-4xl text-[#e8cd8b]">
                  {formatINR(selectedPackage?.price || 0)}
                </span>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3.5 text-xs text-[#a19e95] leading-relaxed">
                Reserving locks this date exclusively for you in MongoDB while you complete payment via Razorpay (UPI, Cards, NetBanking) or Stripe.
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* MANAGE & CANCEL BOOKINGS TAB */
        <section className="space-y-6">
          <div className="glass-atelier rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-serif-display text-3xl text-[#f5f2eb]">
                Booking Confirmations & Cancellations
              </h2>
              <p className="text-xs text-[#a19e95]">
                Search by Booking Code (e.g. LUM-26-4109) or email. Cancelling any booking immediately unlocks that date on the photographer’s calendar.
              </p>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchBookingsList(lookupQuery);
              }}
              className="flex gap-2 w-full sm:w-auto"
            >
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#8f8b82] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={lookupQuery}
                  onChange={(e) => setLookupQuery(e.target.value)}
                  placeholder="Code or client email..."
                  className="w-full rounded-full bg-white/[0.05] border border-white/15 pl-10 pr-4 py-2.5 text-xs text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                />
              </div>
              <button
                type="submit"
                className="btn-luminous px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider"
              >
                Lookup
              </button>
            </form>
          </div>

          {loadingBookings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((n) => (
                <div key={n} className="h-52 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          ) : bookingsList.length === 0 ? (
            <div className="glass-atelier rounded-3xl p-12 text-center space-y-3">
              <CalendarIcon className="w-10 h-10 text-[#d4af37]/60 mx-auto" />
              <h3 className="font-serif-display text-3xl text-[#f5f2eb]">No Matching Bookings</h3>
              <p className="text-sm text-[#a19e95]">
                Clear the search filter to view all recent studio reservations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookingsList.map((b) => {
                const isCancelled = b.status === 'cancelled';
                const isConfirmed = b.status === 'confirmed';
                return (
                  <motion.div
                    key={b._id}
                    layout
                    className={`rounded-3xl border p-6 space-y-5 ${
                      isCancelled
                        ? 'border-white/10 bg-[#101014]/70 opacity-75'
                        : 'border-white/15 bg-gradient-to-br from-[#17161d] to-[#101015]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                      <div>
                        <span className="font-mono-tech text-xs text-[#e8cd8b]">
                          {b.bookingCode}
                        </span>
                        <h3 className="font-serif-display text-2xl text-[#f5f2eb] mt-0.5">
                          {b.photographerName}
                        </h3>
                        <p className="text-xs text-[#a19e95]">{b.packageName}</p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono-tech uppercase tracking-wider border ${
                          isConfirmed
                            ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                            : isCancelled
                            ? 'bg-rose-500/15 border-rose-400/40 text-rose-300'
                            : 'bg-amber-500/15 border-amber-400/40 text-amber-300'
                        }`}
                      >
                        {isConfirmed ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : isCancelled ? (
                          <XCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[#8f8b82] block">Session Date</span>
                        <span className="text-[#f5f2eb] font-medium">
                          {formatReadableDate(b.date)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8f8b82] block">Client</span>
                        <span className="text-[#f5f2eb] font-medium">{b.clientName}</span>
                      </div>
                      <div>
                        <span className="text-[#8f8b82] block">Location</span>
                        <span className="text-[#cfc9be] inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#d4af37]" />
                          {b.location}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#8f8b82] block">Amount & Payment</span>
                        <span className="text-[#e8cd8b] font-semibold">
                          {formatINR(b.amount)} ({b.paymentStatus})
                        </span>
                      </div>
                    </div>

                    {!isCancelled && (
                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                        {b.paymentStatus !== 'paid' && (
                          <button
                            type="button"
                            onClick={() => navigate(`/payment/${b.bookingCode}`)}
                            className="btn-luminous px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Now
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={cancellingId === b._id}
                          onClick={() => handleCancelBooking(b)}
                          className="ml-auto px-4 py-2 rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 text-xs font-medium transition disabled:opacity-50"
                        >
                          {cancellingId === b._id
                            ? 'Releasing Date...'
                            : 'Cancel Booking & Release Date'}
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </PageTransition>
  );
}
