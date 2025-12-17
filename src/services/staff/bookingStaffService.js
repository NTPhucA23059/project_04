import api from "../api";

const BASE = "/staff/booking-tours";

/**
 * Search bookings with filters
 */
export const searchBookings = async ({
  page = 0,
  size = 10,
  keyword,
  status, // orderStatus
  tourDetailID,
  accountID,
}) => {
  const params = {
    page,
    size,
  };
  if (keyword) params.keyword = keyword;
  if (status !== undefined && status !== null) params.status = status;
  if (tourDetailID) params.tourDetailID = tourDetailID;
  if (accountID) params.accountID = accountID;

  const res = await api.get(BASE, { params });
  return res.data;
};

/**
 * Get booking by ID
 */
export const getBookingById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

/**
 * Get full booking details by ID
 */
export const getFullBookingById = async (id) => {
  const res = await api.get(`${BASE}/${id}/full`);
  return res.data;
};

/**
 * Update payment status (for COD bookings when customer pays at office)
 */
export const updatePaymentStatus = async (bookingID, paymentStatus, processedBy = null) => {
  const res = await api.put(`${BASE}/${bookingID}/payment-status`, {
    paymentStatus,
    processedBy, // Staff accountID who processed the payment
  });
  return res.data;
};

/**
 * Update booking
 */
export const updateBooking = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

/**
 * Delete booking
 */
export const deleteBooking = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

/**
 * Create booking (for staff booking on behalf of customer)
 */
export const createBooking = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

