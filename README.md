# Atelier Lumière — Fine Art Photography Studio & Booking Platform

A full-stack luxury photography studio and real-time booking platform built with **React.js**, **Tailwind CSS**, **Framer Motion**, **React Router DOM**, **Node.js**, **Express.js**, and **MongoDB**.

## Key Features
- **Editorial Hero & Studio Showcase**: Full-screen hero with HD photography background video, ambient studio fallback, featured portfolio collections, studio services, and verified client testimonials.
- **3 Principal Photographers**: Dedicated profiles for **Elena Vance**, **Marcus Thorne**, and **Aria Takahashi** with bios, camera kits, transparent packages, ratings, and live client review submissions.
- **Independent Availability Calendars & Concurrency Protection**:
  - Each photographer has an independent date calendar backed by MongoDB.
  - Booked dates are locked and disabled on the calendar.
  - Enforced by a MongoDB partial unique index on `{ photographerSlug, date }` for active (`pending_payment` / `confirmed`) bookings so duplicate concurrent bookings return `409 Conflict`.
  - Cancelling any booking frees the date immediately for new reservations.
- **Payment Gateway & Cryptographic Verification**:
  - Separate `/payment/:bookingId` checkout supporting **Razorpay** (UPI/QR, Credit/Debit Cards, NetBanking with HMAC-SHA256 signature verification) and **Stripe** (PaymentIntents).
  - Works out of the box in **Studio Verified Sandbox** mode and switches automatically to live gateways when API keys are set in `server/.env`.
- **8 Complete Pages**: Home, Portfolio (with category/artist filters & EXIF lightbox), Our Photographers, Booking (Reserve + Manage/Cancel), Payment, About Us, Careers, and Contact Us.

## Running Locally

1. **Install dependencies** (already installed if set up):
   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   ```

2. **Start both API (`:5000`) and Frontend (`:5173`)**:
   ```bash
   npm run dev
   ```
   > If no local MongoDB server is running at `MONGODB_URI`, the backend automatically starts an embedded `MongoMemoryServer` instance and seeds the 3 photographers, 8 portfolio plates, and sample bookings.

3. **Run Production Build & E2E API Verification**:
   ```bash
   npm run build
   node server/verify-e2e.mjs
   ```

## Environment Variables (`server/.env`)
- `PORT`: API port (default `5000`)
- `MONGODB_URI`: MongoDB connection string (defaults to `mongodb://127.0.0.1:27017/atelier_lumiere`)
- `USE_IN_MEMORY_FALLBACK`: Set `true` to auto-start embedded MongoDB when `MONGODB_URI` is unreachable
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Optional live Razorpay credentials
- `STRIPE_SECRET_KEY`: Optional live Stripe secret key
