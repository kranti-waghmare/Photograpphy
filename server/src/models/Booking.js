import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: { type: String, required: true, unique: true, index: true },
    photographer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Photographer',
      required: true,
    },
    photographerSlug: { type: String, required: true, index: true },
    photographerName: { type: String, required: true },
    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    timeSlot: {
      type: String,
      required: true,
      default: 'Full Day Studio & Location (09:00 – 18:00)',
    },
    packageId: { type: String, required: true },
    packageName: { type: String, required: true },
    shootType: { type: String, required: true },
    location: { type: String, required: true },
    clientName: { type: String, required: true, trim: true },
    clientEmail: { type: String, required: true, trim: true, lowercase: true },
    clientPhone: { type: String, required: true, trim: true },
    notes: { type: String, default: '' },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'cancelled'],
      default: 'pending_payment',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'stripe', null],
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'card', 'debit_card', 'netbanking', 'wallet', null],
      default: null,
    },
    paymentDetails: {
      last4: { type: String, default: null },
      upiId: { type: String, default: null },
      bankName: { type: String, default: null },
    },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
    stripePaymentIntentId: { type: String, default: null },
    paidAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancellationReason: { type: String, default: null },
  },
  { timestamps: true }
);

// Prevent multiple active bookings for the same photographer on the same date.
// Cancelled bookings drop out of the partial index, freeing the date automatically.
bookingSchema.index(
  { photographerSlug: 1, date: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending_payment', 'confirmed'] },
    },
  }
);

export const Booking = mongoose.model('Booking', bookingSchema);
