import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Photographer } from '../models/Photographer.js';

const router = express.Router();

function generateBookingCode() {
  const random = crypto.randomBytes(2).toString('hex').toUpperCase();
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LUM-26-${random}${num}`.slice(0, 11);
}

function getTodayDateString() {
  return new Date().toISOString().split('T')[0];
}

// GET /api/bookings/availability/:photographerSlug
// Returns independent availability calendar dates for the given photographer.
router.get('/availability/:photographerSlug', async (req, res, next) => {
  try {
    const { photographerSlug } = req.params;
    const { month } = req.query; // optional YYYY-MM

    const photographer = await Photographer.findOne({ slug: photographerSlug }).lean();
    if (!photographer) {
      return res.status(404).json({ error: 'Photographer not found.' });
    }

    const query = {
      photographerSlug,
      status: { $in: ['pending_payment', 'confirmed'] },
    };

    if (month && /^\d{4}-\d{2}$/.test(month)) {
      query.date = { $regex: `^${month}-` };
    }

    const activeBookings = await Booking.find(query)
      .select('date status timeSlot packageName bookingCode paymentStatus')
      .sort({ date: 1 })
      .lean();

    res.json({
      photographerSlug,
      photographerName: photographer.name,
      bookedDates: activeBookings.map((b) => ({
        date: b.date,
        status: b.status,
        paymentStatus: b.paymentStatus,
        timeSlot: b.timeSlot,
        packageName: b.packageName,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings
// Supports lookup by ?email=, ?code=, or returns all non-sensitive recent bookings for studio management.
router.get('/', async (req, res, next) => {
  try {
    const { email, code, photographerSlug } = req.query;
    const filter = {};
    if (email) filter.clientEmail = email.toString().trim().toLowerCase();
    if (code) filter.bookingCode = code.toString().trim().toUpperCase();
    if (photographerSlug) filter.photographerSlug = photographerSlug.toString().trim();

    const bookings = await Booking.find(filter)
      .populate('photographer', 'name slug title avatar location')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

// GET /api/bookings/:idOrCode
router.get('/:idOrCode', async (req, res, next) => {
  try {
    const { idOrCode } = req.params;
    const query = mongoose.Types.ObjectId.isValid(idOrCode)
      ? { _id: idOrCode }
      : { bookingCode: idOrCode.toUpperCase() };

    const booking = await Booking.findOne(query)
      .populate('photographer', 'name slug title avatar location specialty rating')
      .lean();

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    res.json({ booking });
  } catch (err) {
    next(err);
  }
});

// POST /api/bookings
// Creates a booking and locks the date for that photographer.
router.post('/', async (req, res, next) => {
  try {
    const {
      photographerSlug,
      date,
      timeSlot,
      packageId,
      shootType,
      location,
      clientName,
      clientEmail,
      clientPhone,
      notes,
    } = req.body;

    if (!photographerSlug || !date || !packageId || !clientName || !clientEmail || !clientPhone) {
      return res.status(400).json({
        error: 'Please complete photographer, date, package, and all client contact fields.',
      });
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD.' });
    }

    if (date < getTodayDateString()) {
      return res.status(400).json({ error: 'Cannot book a date in the past.' });
    }

    const photographer = await Photographer.findOne({ slug: photographerSlug });
    if (!photographer) {
      return res.status(404).json({ error: 'Selected photographer was not found.' });
    }

    const selectedPkg = photographer.packages.find((p) => p.id === packageId);
    if (!selectedPkg) {
      return res.status(400).json({ error: 'Selected photography package is invalid.' });
    }

    // Explicit pre-check before insert (backed by MongoDB partial unique index for concurrency safety)
    const existingActive = await Booking.findOne({
      photographerSlug,
      date,
      status: { $in: ['pending_payment', 'confirmed'] },
    }).lean();

    if (existingActive) {
      return res.status(409).json({
        error: `${photographer.name} is already booked on ${date}. Please choose another available date or photographer.`,
      });
    }

    const booking = await Booking.create({
      bookingCode: generateBookingCode(),
      photographer: photographer._id,
      photographerSlug: photographer.slug,
      photographerName: photographer.name,
      date,
      timeSlot: timeSlot || selectedPkg.duration,
      packageId: selectedPkg.id,
      packageName: selectedPkg.name,
      shootType: shootType || photographer.categories[0] || 'Editorial',
      location: (location || photographer.location).trim(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim().toLowerCase(),
      clientPhone: clientPhone.trim(),
      notes: (notes || '').trim(),
      amount: selectedPkg.price,
      currency: 'INR',
      status: 'pending_payment',
      paymentStatus: 'pending',
    });

    const populated = await Booking.findById(booking._id)
      .populate('photographer', 'name slug title avatar location specialty')
      .lean();

    res.status(201).json({
      message: 'Session reserved. Complete payment to finalize your booking.',
      booking: populated,
    });
  } catch (err) {
    // Handle MongoDB unique index violation on concurrent duplicate booking attempts
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'This date was just reserved by another client. Please select another available date.',
      });
    }
    next(err);
  }
});

// POST /api/bookings/:idOrCode/cancel
// Cancels a booking and immediately frees the date in the photographer's availability calendar.
router.post('/:idOrCode/cancel', async (req, res, next) => {
  try {
    const { idOrCode } = req.params;
    const { reason } = req.body || {};

    const query = mongoose.Types.ObjectId.isValid(idOrCode)
      ? { _id: idOrCode }
      : { bookingCode: idOrCode.toUpperCase() };

    const booking = await Booking.findOne(query);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'This booking has already been cancelled.' });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = (reason || 'Client requested cancellation').trim();
    if (booking.paymentStatus === 'paid') {
      booking.paymentStatus = 'refunded';
    }

    await booking.save();

    // Return refreshed booked dates for this photographer so UI immediately unlocks the date
    const remainingBooked = await Booking.find({
      photographerSlug: booking.photographerSlug,
      status: { $in: ['pending_payment', 'confirmed'] },
    })
      .select('date status timeSlot packageName')
      .lean();

    res.json({
      message: `Booking ${booking.bookingCode} cancelled. ${booking.date} is now available again for ${booking.photographerName}.`,
      booking,
      bookedDates: remainingBooked,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
