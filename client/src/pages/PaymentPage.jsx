import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
  Printer,
  Calendar,
  ArrowRight,
  QrCode,
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { PageLoader } from '../components/Skeletons';
import { api } from '../services/api';
import { useStudio } from '../context/StudioContext';
import { formatINR, formatReadableDate } from '../utils/formatters';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / QR', sub: 'GPay, PhonePe, Paytm', icon: Smartphone },
  { id: 'card', label: 'Credit Card', sub: 'Visa, Mastercard, Amex', icon: CreditCard },
  { id: 'debit_card', label: 'Debit Card', sub: 'RuPay, Visa, Maestro', icon: CreditCard },
  { id: 'netbanking', label: 'NetBanking', sub: 'HDFC, ICICI, SBI, Axis', icon: Landmark },
];

const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra'];

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { activeBooking, setActiveBooking, showToast } = useStudio();

  const [booking, setBooking] = useState(activeBooking || null);
  const [loading, setLoading] = useState(Boolean(bookingId));
  const [lookupCode, setLookupCode] = useState('');
  const [pendingList, setPendingList] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState(null);

  const [gateway, setGateway] = useState('razorpay'); // 'razorpay' | 'stripe'
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('client@okicici');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');
  const [cardHolder, setCardHolder] = useState('');
  const [bankName, setBankName] = useState(BANKS[0]);

  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    api
      .getPaymentConfig()
      .then((cfg) => setPaymentConfig(cfg))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    const targetId = bookingId || activeBooking?.bookingCode;
    if (targetId) {
      setLoading(true);
      api
        .getBooking(targetId)
        .then((res) => {
          if (active) {
            setBooking(res.booking);
            setCardHolder(res.booking.clientName || '');
          }
        })
        .catch((err) => {
          if (active) setPaymentError(err.message || 'Booking not found.');
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else {
      api
        .getBookings()
        .then((res) => {
          if (active) {
            setPendingList((res.bookings || []).filter((b) => b.status !== 'cancelled'));
          }
        })
        .catch(() => {});
      setLoading(false);
    }
    return () => {
      active = false;
    };
  }, [bookingId, activeBooking?.bookingCode]);

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!lookupCode.trim()) return;
    navigate(`/payment/${lookupCode.trim().toUpperCase()}`);
  };

  const formatCardInput = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handlePay = async (simulateFailure = false) => {
    if (!booking) return;
    setPaymentError('');

    if (!simulateFailure) {
      if (method === 'upi' && gateway === 'razorpay' && !upiId.includes('@')) {
        setPaymentError('Please enter a valid UPI ID (e.g. name@okicici).');
        return;
      }
      if ((method === 'card' || method === 'debit_card') && cardCvv.length < 3) {
        setPaymentError('Please enter a valid 3 or 4 digit CVV.');
        return;
      }
    }

    try {
      setProcessing(true);

      if (gateway === 'stripe') {
        const intent = await api.createStripeIntent(booking._id);
        if (simulateFailure) {
          throw new Error('Stripe 3D Secure authorization declined.');
        }
        const digits = cardNumber.replace(/\D/g, '');
        const last4 = digits.slice(-4) || '4242';
        const verified = await api.confirmStripePayment({
          bookingId: booking._id,
          paymentIntentId: intent.paymentIntentId,
          clientSecret: intent.clientSecret,
          last4,
          paymentMethod: method === 'debit_card' ? 'debit_card' : 'card',
        });
        setBooking(verified.booking);
        setActiveBooking(verified.booking);
        showToast('Stripe payment verified! Your session is confirmed.');
      } else {
        // Razorpay Order + HMAC-SHA256 Verification
        const order = await api.createRazorpayOrder(booking._id);

        if (simulateFailure) {
          await api.verifyRazorpayPayment({
            bookingId: booking._id,
            simulateFailure: true,
          });
          return;
        }

        const digits = cardNumber.replace(/\D/g, '');
        const paymentDetails =
          method === 'upi'
            ? { upiId }
            : method === 'netbanking'
            ? { bankName }
            : { last4: digits.slice(-4) || '4242' };

        const verified = await api.verifyRazorpayPayment({
          bookingId: booking._id,
          razorpayOrderId: order.orderId,
          razorpayPaymentId: order.sandboxAuthorization?.paymentId || `pay_${Date.now()}`,
          razorpaySignature: order.sandboxAuthorization?.signature || '',
          paymentMethod: method,
          paymentDetails,
        });

        setBooking(verified.booking);
        setActiveBooking(verified.booking);
        showToast('Razorpay HMAC signature verified! Booking confirmed.');
      }
    } catch (err) {
      setPaymentError(err.message || 'Payment verification failed.');
      showToast(err.message || 'Payment failed.', 'error');
      // Refresh booking status in case server marked failed
      api
        .getBooking(booking.bookingCode)
        .then((res) => setBooking(res.booking))
        .catch(() => {});
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-28">
        <PageLoader label="Loading Secure Checkout..." />
      </div>
    );
  }

  // If no booking selected yet, show lookup & active bookings picker
  if (!booking) {
    return (
      <PageTransition className="pt-32 pb-20 max-w-4xl mx-auto px-5 sm:px-8 space-y-10">
        <div className="space-y-3 text-center">
          <span className="text-xs font-mono-tech uppercase tracking-[0.26em] text-[#d4af37]">
            Encrypted Checkout Portal
          </span>
          <h1 className="font-serif-display text-5xl text-[#f5f2eb]">
            Studio <span className="italic text-gradient-gold">Payment Portal</span>
          </h1>
          <p className="text-sm text-[#a19e95] max-w-xl mx-auto">
            Enter your reservation code to complete payment or view your verified payment receipt.
          </p>
        </div>

        <form
          onSubmit={handleLookup}
          className="glass-atelier rounded-3xl p-7 flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8f8b82] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              value={lookupCode}
              onChange={(e) => setLookupCode(e.target.value)}
              placeholder="Enter Booking Code (e.g. LUM-26-4109)"
              className="w-full rounded-full bg-white/[0.04] border border-white/15 pl-11 pr-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
            />
          </div>
          <button
            type="submit"
            className="btn-luminous px-7 py-3 rounded-full text-xs font-semibold uppercase tracking-widest"
          >
            Load Checkout
          </button>
        </form>

        {pendingList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-mono-tech uppercase tracking-[0.2em] text-[#a19e95]">
              Recent Active Reservations
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pendingList.slice(0, 4).map((item) => (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => navigate(`/payment/${item.bookingCode}`)}
                  className="text-left glass-atelier rounded-2xl p-5 hover:border-[#d4af37]/50 transition space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono-tech text-xs text-[#e8cd8b]">
                      {item.bookingCode}
                    </span>
                    <span className="text-[10px] font-mono-tech uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-[#cfc9be]">
                      {item.paymentStatus}
                    </span>
                  </div>
                  <p className="font-serif-display text-2xl text-[#f5f2eb]">
                    {item.photographerName}
                  </p>
                  <p className="text-xs text-[#a19e95]">
                    {formatReadableDate(item.date)} • {formatINR(item.amount)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </PageTransition>
    );
  }

  const isPaid = booking.paymentStatus === 'paid' && booking.status === 'confirmed';

  return (
    <PageTransition className="pt-32 pb-20 max-w-7xl mx-auto px-5 sm:px-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono-tech uppercase tracking-[0.22em] text-[#d4af37]">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Verified Payment Verification
          </div>
          <h1 className="font-serif-display text-5xl text-[#f5f2eb]">
            {isPaid ? 'Payment Confirmed' : 'Complete Your Reservation'}
          </h1>
        </div>

        <span
          className={`self-start px-4 py-1.5 rounded-full text-xs font-mono-tech uppercase tracking-wider border ${
            isPaid
              ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
              : booking.paymentStatus === 'failed'
              ? 'bg-rose-500/15 border-rose-400/40 text-rose-300'
              : 'bg-amber-500/15 border-amber-400/40 text-amber-300'
          }`}
        >
          Payment Status: {booking.paymentStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: PAYMENT CHECKOUT OR RECEIPT */}
        <div className="lg:col-span-7">
          {isPaid ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-emerald-500/35 bg-gradient-to-br from-[#131d19] via-[#111216] to-[#15141a] p-8 sm:p-10 space-y-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-mono-tech uppercase tracking-widest text-emerald-300">
                    Booking & Payment Verified
                  </span>
                  <h2 className="font-serif-display text-3xl text-[#f5f2eb]">
                    Session Officially Locked
                  </h2>
                </div>
              </div>

              <p className="text-sm text-[#cfc9be] leading-relaxed">
                Your payment of <strong className="text-[#e8cd8b]">{formatINR(booking.amount)}</strong> has been cryptographically verified.{' '}
                <strong>{booking.photographerName}</strong> is exclusively reserved for you on{' '}
                <strong>{formatReadableDate(booking.date)}</strong>.
              </p>

              <div className="rounded-2xl bg-black/35 border border-white/10 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[#8f8b82] block">Confirmation Code</span>
                  <span className="font-mono-tech text-sm text-[#e8cd8b]">{booking.bookingCode}</span>
                </div>
                <div>
                  <span className="text-[#8f8b82] block">Gateway & Method</span>
                  <span className="uppercase font-mono-tech text-[#f5f2eb]">
                    {booking.paymentGateway} • {booking.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-[#8f8b82] block">Transaction Reference</span>
                  <span className="font-mono-tech text-[#cfc9be] break-all">
                    {booking.razorpayPaymentId || booking.stripePaymentIntentId || 'VERIFIED'}
                  </span>
                </div>
                <div>
                  <span className="text-[#8f8b82] block">Paid At</span>
                  <span className="text-[#cfc9be]">
                    {booking.paidAt ? new Date(booking.paidAt).toLocaleString() : 'Just now'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-6 py-3 rounded-full border border-white/20 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 hover:border-[#d4af37] transition"
                >
                  <Printer className="w-4 h-4" /> Print Receipt
                </button>
                <Link
                  to="/booking?tab=manage"
                  className="btn-luminous px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" /> Manage / Cancel Booking
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="glass-atelier rounded-3xl p-6 sm:p-9 space-y-7">
              {/* Gateway Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono-tech uppercase tracking-wider text-[#a19e95]">
                    Select Payment Gateway
                  </span>
                  <span className="text-[10px] font-mono-tech uppercase px-2.5 py-0.5 rounded-full bg-[#d4af37]/15 text-[#e8cd8b] border border-[#d4af37]/30">
                    {paymentConfig?.[gateway]?.mode === 'live'
                      ? 'Live Gateway'
                      : 'Studio Verified Sandbox'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGateway('razorpay')}
                    className={`rounded-2xl p-4 border text-left transition ${
                      gateway === 'razorpay'
                        ? 'border-[#d4af37] bg-[#d4af37]/12'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                    }`}
                  >
                    <p className="font-semibold text-sm text-[#f5f2eb]">Razorpay Checkout</p>
                    <p className="text-[11px] text-[#a19e95] mt-0.5">
                      UPI, Cards, NetBanking (HMAC-SHA256)
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGateway('stripe');
                      if (method === 'upi' || method === 'netbanking') setMethod('card');
                    }}
                    className={`rounded-2xl p-4 border text-left transition ${
                      gateway === 'stripe'
                        ? 'border-[#d4af37] bg-[#d4af37]/12'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                    }`}
                  >
                    <p className="font-semibold text-sm text-[#f5f2eb]">Stripe Elements</p>
                    <p className="text-[11px] text-[#a19e95] mt-0.5">
                      Global Credit & Debit Cards (3DS)
                    </p>
                  </button>
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div className="space-y-3">
                <span className="text-xs font-mono-tech uppercase tracking-wider text-[#a19e95] block">
                  Payment Method
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PAYMENT_METHODS.filter(
                    (m) => gateway === 'razorpay' || m.id === 'card' || m.id === 'debit_card'
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={`rounded-xl p-3 border text-left transition ${
                        method === m.id
                          ? 'border-[#d4af37] bg-[#d4af37]/15 text-[#f5f2eb]'
                          : 'border-white/10 bg-white/[0.02] text-[#a19e95] hover:border-white/25'
                      }`}
                    >
                      <m.icon className="w-4 h-4 text-[#e8cd8b] mb-1.5" />
                      <p className="text-xs font-semibold">{m.label}</p>
                      <p className="text-[10px] opacity-75 truncate">{m.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method Inputs */}
              {method === 'upi' && (
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  <div className="sm:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-white text-[#09090b]">
                    <QrCode className="w-24 h-24 stroke-[1.5]" />
                    <span className="font-mono-tech text-[10px] font-semibold mt-2">
                      SCAN VIA ANY UPI APP
                    </span>
                  </div>
                  <div className="sm:col-span-8 space-y-3">
                    <label className="block text-xs uppercase tracking-wider text-[#a19e95]">
                      Or Pay Using UPI ID / VPA
                    </label>
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@okicici"
                      className="w-full rounded-xl bg-[#0f0f13] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                    />
                    <div className="flex flex-wrap gap-2 text-[10px] font-mono-tech text-[#cfc9be]">
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                        Google Pay
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                        PhonePe
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                        BHIM / Paytm
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {(method === 'card' || method === 'debit_card') && (
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                      Cardholder Name
                    </label>
                    <input
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      placeholder="Name on card"
                      className="w-full rounded-xl bg-[#0f0f13] border border-white/15 px-4 py-2.5 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                      Card Number
                    </label>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardInput(e.target.value))}
                      placeholder="4532 8910 2231 4242"
                      className="w-full rounded-xl bg-[#0f0f13] border border-white/15 px-4 py-2.5 text-sm font-mono-tech text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                        Expiry (MM/YY)
                      </label>
                      <input
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full rounded-xl bg-[#0f0f13] border border-white/15 px-4 py-2.5 text-sm font-mono-tech text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-[#a19e95] mb-1.5">
                        CVV
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                        className="w-full rounded-xl bg-[#0f0f13] border border-white/15 px-4 py-2.5 text-sm font-mono-tech text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'netbanking' && (
                <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-3">
                  <label className="block text-xs uppercase tracking-wider text-[#a19e95]">
                    Choose Your Bank
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-xl bg-[#0f0f13] border border-white/15 px-4 py-3 text-sm text-[#f5f2eb] focus:outline-none focus:border-[#d4af37]"
                  >
                    {BANKS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {paymentError && (
                <div className="rounded-xl bg-rose-950/50 border border-rose-500/40 p-4 flex items-start gap-3 text-sm text-rose-200">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handlePay(false)}
                  className="btn-luminous w-full py-4 rounded-full text-xs font-semibold uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {processing
                    ? 'Verifying Cryptographic Signature...'
                    : `Pay ${formatINR(booking.amount)} & Confirm Session`}
                  <ArrowRight className="w-4 h-4" />
                </button>

                {paymentConfig?.[gateway]?.mode !== 'live' && (
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => handlePay(true)}
                    className="w-full py-2.5 rounded-full border border-white/10 text-[11px] font-mono-tech text-[#a19e95] hover:text-rose-300 hover:border-rose-500/40 transition"
                  >
                    Test Failed Payment Flow (Sandbox)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: BOOKING SUMMARY */}
        <aside className="lg:col-span-5">
          <div className="rounded-3xl border border-white/15 bg-gradient-to-b from-[#17161e] to-[#101014] p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono-tech uppercase tracking-widest text-[#d4af37]">
                  Booking Summary
                </span>
                <p className="font-mono-tech text-sm text-[#f5f2eb] mt-0.5">
                  {booking.bookingCode}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] font-mono-tech uppercase text-[#cfc9be]">
                {booking.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-[#a19e95]">Photographer</span>
                <span className="text-[#f5f2eb] font-medium">{booking.photographerName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#a19e95]">Session Date</span>
                <span className="text-[#f5f2eb] font-medium">
                  {formatReadableDate(booking.date)}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#a19e95]">Package</span>
                <span className="text-[#f5f2eb] text-right">{booking.packageName}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#a19e95]">Time Slot</span>
                <span className="text-[#cfc9be] text-xs text-right">{booking.timeSlot}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#a19e95]">Location</span>
                <span className="text-[#cfc9be] text-right">{booking.location}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#a19e95]">Client</span>
                <span className="text-[#cfc9be] text-right">
                  {booking.clientName} ({booking.clientEmail})
                </span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-5 flex items-baseline justify-between">
              <span className="text-xs uppercase tracking-widest text-[#a19e95]">Amount Due</span>
              <span className="font-serif-display text-4xl text-[#e8cd8b]">
                {formatINR(booking.amount)}
              </span>
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4 flex items-start gap-3 text-xs text-[#a19e95]">
              <ShieldCheck className="w-5 h-5 text-[#d4af37] shrink-0" />
              <span>
                100% refundable upon cancellation via our Studio Manager—automatically releasing your reserved date.
              </span>
            </div>
          </div>
        </aside>
      </div>
    </PageTransition>
  );
}
