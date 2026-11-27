import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';
import Stripe from 'stripe';
import { Booking } from '../models/Booking.js';

const router = express.Router();

function getSigningSecret() {
  return process.env.RAZORPAY_KEY_SECRET || process.env.PAYMENT_WEBHOOK_SECRET || 'atelier_lumiere_dev_secret_2026';
}

function getRazorpayClient() {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return null;
}

function getStripeClient() {
  if (process.env.STRIPE_SECRET_KEY) {
    return new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return null;
}

async function findBookingByIdOrCode(idOrCode) {
  const query = mongoose.Types.ObjectId.isValid(idOrCode)
    ? { _id: idOrCode }
    : { bookingCode: String(idOrCode).toUpperCase() };
  return Booking.findOne(query);
}

// GET /api/payments/config
router.get('/config', (_req, res) => {
  const hasLiveRazorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  const hasLiveStripe = Boolean(process.env.STRIPE_SECRET_KEY);

  res.json({
    razorpay: {
      mode: hasLiveRazorpay ? 'live' : 'studio_sandbox',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_AtelierLumiere2026',
    },
    stripe: {
      mode: hasLiveStripe ? 'live' : 'studio_sandbox',
    },
    supportedMethods: ['upi', 'card', 'debit_card', 'netbanking', 'wallet'],
    currency: 'INR',
  });
});

// POST /api/payments/razorpay/order
router.post('/razorpay/order', async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required.' });
    }

    const booking = await findBookingByIdOrCode(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot pay for a cancelled booking.' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking is already paid.' });
    }

    const amountInPaise = Math.round(booking.amount * 100);
    const razorpay = getRazorpayClient();

    let orderId;
    let mode = 'studio_sandbox';

    if (razorpay) {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: booking.currency || 'INR',
        receipt: booking.bookingCode,
        notes: {
          bookingCode: booking.bookingCode,
          photographer: booking.photographerName,
          date: booking.date,
        },
      });
      orderId = order.id;
      mode = 'live';
    } else {
      orderId = `order_LUM_${crypto.randomBytes(6).toString('hex')}`;
    }

    booking.razorpayOrderId = orderId;
    booking.paymentGateway = 'razorpay';
    await booking.save();

    // Generate server-issued sandbox token if running in Studio Sandbox mode so client can still exercise real HMAC verification
    const previewPaymentId = `pay_LUM_${crypto.randomBytes(6).toString('hex')}`;
    const expectedSignature = crypto
      .createHmac('sha256', getSigningSecret())
      .update(`${orderId}|${previewPaymentId}`)
      .digest('hex');

    res.json({
      mode,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_AtelierLumiere2026',
      orderId,
      amount: amountInPaise,
      displayAmount: booking.amount,
      currency: booking.currency || 'INR',
      bookingCode: booking.bookingCode,
      // Sandbox verification helper payload (used only when live Razorpay popup is not active)
      sandboxAuthorization:
        mode === 'studio_sandbox'
          ? {
              paymentId: previewPaymentId,
              signature: expectedSignature,
            }
          : null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/razorpay/verify
router.post('/razorpay/verify', async (req, res, next) => {
  try {
    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod,
      paymentDetails,
      simulateFailure,
    } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required.' });
    }

    const booking = await findBookingByIdOrCode(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking was cancelled and cannot be paid.' });
    }

    if (simulateFailure) {
      booking.paymentStatus = 'failed';
      await booking.save();
      return res.status(402).json({
        verified: false,
        error: 'Payment authorization declined by issuing bank. Please try another method.',
        booking,
      });
    }

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ error: 'Missing Razorpay verification parameters.' });
    }

    if (booking.razorpayOrderId && booking.razorpayOrderId !== razorpayOrderId) {
      return res.status(400).json({ error: 'Order ID mismatch.' });
    }

    const expected = crypto
      .createHmac('sha256', getSigningSecret())
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'utf8');
    const receivedBuf = Buffer.from(String(razorpaySignature), 'utf8');

    const isValid =
      expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isValid) {
      booking.paymentStatus = 'failed';
      await booking.save();
      return res.status(400).json({
        verified: false,
        error: 'Cryptographic payment signature verification failed.',
      });
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentGateway = 'razorpay';
    booking.paymentMethod = paymentMethod || 'upi';
    booking.paymentDetails = {
      last4: paymentDetails?.last4 || null,
      upiId: paymentDetails?.upiId || null,
      bankName: paymentDetails?.bankName || null,
    };
    booking.razorpayOrderId = razorpayOrderId;
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;
    booking.paidAt = new Date();

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('photographer', 'name slug title avatar location specialty')
      .lean();

    res.json({
      verified: true,
      message: 'Payment verified securely. Your session is officially confirmed.',
      booking: populated,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/stripe/intent
router.post('/stripe/intent', async (req, res, next) => {
  try {
    const { bookingId } = req.body;
    const booking = await findBookingByIdOrCode(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Cannot pay for a cancelled booking.' });
    }
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking is already paid.' });
    }

    const stripe = getStripeClient();
    let paymentIntentId;
    let clientSecret;
    let mode = 'studio_sandbox';

    if (stripe) {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(booking.amount * 100),
        currency: (booking.currency || 'INR').toLowerCase(),
        metadata: {
          bookingCode: booking.bookingCode,
          photographer: booking.photographerName,
          date: booking.date,
        },
        automatic_payment_methods: { enabled: true },
      });
      paymentIntentId = intent.id;
      clientSecret = intent.client_secret;
      mode = 'live';
    } else {
      paymentIntentId = `pi_LUM_${crypto.randomBytes(6).toString('hex')}`;
      const sig = crypto
        .createHmac('sha256', getSigningSecret())
        .update(paymentIntentId)
        .digest('hex')
        .slice(0, 24);
      clientSecret = `${paymentIntentId}_secret_${sig}`;
    }

    booking.stripePaymentIntentId = paymentIntentId;
    booking.paymentGateway = 'stripe';
    await booking.save();

    res.json({
      mode,
      paymentIntentId,
      clientSecret,
      amount: booking.amount,
      currency: booking.currency || 'INR',
      bookingCode: booking.bookingCode,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/payments/stripe/confirm
router.post('/stripe/confirm', async (req, res, next) => {
  try {
    const { bookingId, paymentIntentId, clientSecret, last4, paymentMethod } = req.body;
    const booking = await findBookingByIdOrCode(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking was cancelled.' });
    }

    const stripe = getStripeClient();
    if (stripe && paymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (intent.status !== 'succeeded') {
        return res.status(400).json({
          verified: false,
          error: `Stripe payment status is ${intent.status}.`,
        });
      }
    } else {
      const expectedSig = crypto
        .createHmac('sha256', getSigningSecret())
        .update(String(paymentIntentId))
        .digest('hex')
        .slice(0, 24);
      const expectedSecret = `${paymentIntentId}_secret_${expectedSig}`;
      if (!paymentIntentId || clientSecret !== expectedSecret || booking.stripePaymentIntentId !== paymentIntentId) {
        booking.paymentStatus = 'failed';
        await booking.save();
        return res.status(400).json({
          verified: false,
          error: 'Stripe PaymentIntent verification failed.',
        });
      }
    }

    booking.status = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.paymentGateway = 'stripe';
    booking.paymentMethod = paymentMethod || 'card';
    booking.paymentDetails = { last4: last4 || '4242', upiId: null, bankName: null };
    booking.paidAt = new Date();
    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate('photographer', 'name slug title avatar location specialty')
      .lean();

    res.json({
      verified: true,
      message: 'Stripe payment confirmed. Your photography session is locked in.',
      booking: populated,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
