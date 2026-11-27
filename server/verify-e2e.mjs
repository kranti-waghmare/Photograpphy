import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';

const BASE = 'http://127.0.0.1:5000/api';

async function waitForHealth(timeoutMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${BASE}/health`);
      if (res.ok) return await res.json();
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('Server did not become healthy in time');
}

async function run() {
  const serverProc = spawn('node', ['src/index.js'], {
    cwd: new URL('.', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1').replace(/\/$/, ''),
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  serverProc.stdout.on('data', (d) => process.stdout.write(`[API] ${d}`));
  serverProc.stderr.on('data', (d) => process.stderr.write(`[API ERR] ${d}`));

  try {
    const health = await waitForHealth();
    console.log('Health:', health);
    assert.equal(health.status, 'ok');

    // 1. Verify 3 photographers
    const { photographers } = await (await fetch(`${BASE}/photographers`)).json();
    assert.equal(photographers.length, 3, 'Expected exactly 3 photographers');
    console.log('Photographers verified:', photographers.map((p) => p.name).join(', '));

    // 2. Verify portfolio
    const { items } = await (await fetch(`${BASE}/portfolio`)).json();
    assert.ok(items.length >= 6, 'Expected seeded portfolio items');

    // Pick a far future date to avoid seed collisions
    const testDate = '2026-12-24';

    // 3. Book Elena on 2026-12-24
    const createRes = await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photographerSlug: 'elena-vance',
        date: testDate,
        packageId: 'elena-editorial-campaign',
        location: 'Studio I, Mumbai',
        clientName: 'Test Collector',
        clientEmail: 'collector@example.com',
        clientPhone: '+91 98200 12345',
      }),
    });
    assert.equal(createRes.status, 201);
    const { booking } = await createRes.json();
    console.log('Created booking:', booking.bookingCode, 'amount:', booking.amount);

    // 4. Duplicate booking on same photographer + same date must return 409 Conflict
    const dupRes = await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photographerSlug: 'elena-vance',
        date: testDate,
        packageId: 'elena-signature-portrait',
        location: 'Mumbai',
        clientName: 'Second User',
        clientEmail: 'second@example.com',
        clientPhone: '+91 99999 88888',
      }),
    });
    assert.equal(dupRes.status, 409, 'Duplicate booking for same photographer/date must be rejected');
    console.log('Duplicate booking properly rejected with 409');

    // 5. Independent calendar check: Marcus should still be bookable on the same date!
    const marcusRes = await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photographerSlug: 'marcus-thorne',
        date: testDate,
        packageId: 'marcus-spatial-study',
        location: 'Bengaluru',
        clientName: 'Arch Studio',
        clientEmail: 'arch@example.com',
        clientPhone: '+91 98000 11111',
      }),
    });
    assert.equal(marcusRes.status, 201, 'Independent calendar should allow another photographer on same date');
    console.log('Independent calendar verified for Marcus Thorne on same date');

    // 6. Razorpay order + HMAC-SHA256 verification
    const orderRes = await fetch(`${BASE}/payments/razorpay/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: booking._id }),
    });
    assert.equal(orderRes.status, 200);
    const orderData = await orderRes.json();

    const verifyRes = await fetch(`${BASE}/payments/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: booking._id,
        razorpayOrderId: orderData.orderId,
        razorpayPaymentId: orderData.sandboxAuthorization.paymentId,
        razorpaySignature: orderData.sandboxAuthorization.signature,
        paymentMethod: 'upi',
        paymentDetails: { upiId: 'collector@okaxis' },
      }),
    });
    assert.equal(verifyRes.status, 200);
    const verifiedData = await verifyRes.json();
    assert.equal(verifiedData.verified, true);
    assert.equal(verifiedData.booking.status, 'confirmed');
    assert.equal(verifiedData.booking.paymentStatus, 'paid');
    console.log('Payment verified & booking confirmed');

    // 7. Cancel booking and confirm date becomes available again
    const cancelRes = await fetch(`${BASE}/bookings/${booking.bookingCode}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'E2E test cancellation' }),
    });
    assert.equal(cancelRes.status, 200);
    const cancelData = await cancelRes.json();
    assert.equal(cancelData.booking.status, 'cancelled');
    assert.equal(cancelData.booking.paymentStatus, 'refunded');
    assert.ok(!cancelData.bookedDates.some((d) => d.date === testDate), 'Date must be freed after cancellation');

    // 8. Re-book Elena on freed date -> must succeed with 201
    const rebookRes = await fetch(`${BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        photographerSlug: 'elena-vance',
        date: testDate,
        packageId: 'elena-signature-portrait',
        location: 'Studio I, Mumbai',
        clientName: 'New Client',
        clientEmail: 'newclient@example.com',
        clientPhone: '+91 98111 22233',
      }),
    });
    assert.equal(rebookRes.status, 201, 'Rebooking after cancellation must succeed');
    console.log('Re-booking freed date after cancellation succeeded!');

    console.log('ALL E2E API CHECKS PASSED');
  } finally {
    serverProc.kill();
  }
}

run().catch((err) => {
  console.error('E2E FAILED:', err);
  process.exit(1);
});
