const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || `Request failed (${res.status})`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  getHealth: () => request('/health'),
  getPhotographers: () => request('/photographers'),
  getPhotographer: (slug) => request(`/photographers/${slug}`),
  addReview: (slug, payload) =>
    request(`/photographers/${slug}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getPortfolio: (params = {}) => {
    const search = new URLSearchParams(params).toString();
    return request(`/portfolio${search ? `?${search}` : ''}`);
  },

  getAvailability: (photographerSlug, month) => {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return request(`/bookings/availability/${photographerSlug}${query}`);
  },
  getBookings: (params = {}) => {
    const search = new URLSearchParams(params).toString();
    return request(`/bookings${search ? `?${search}` : ''}`);
  },
  getBooking: (idOrCode) => request(`/bookings/${encodeURIComponent(idOrCode)}`),
  createBooking: (payload) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  cancelBooking: (idOrCode, reason) =>
    request(`/bookings/${encodeURIComponent(idOrCode)}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getPaymentConfig: () => request('/payments/config'),
  createRazorpayOrder: (bookingId) =>
    request('/payments/razorpay/order', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),
  verifyRazorpayPayment: (payload) =>
    request('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  createStripeIntent: (bookingId) =>
    request('/payments/stripe/intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }),
  confirmStripePayment: (payload) =>
    request('/payments/stripe/confirm', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  submitContact: (payload) =>
    request('/inquiries/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  submitCareerApplication: (payload) =>
    request('/inquiries/careers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
