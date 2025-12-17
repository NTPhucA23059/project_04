import api from "../api";

const REFUND_BASE = "/customer/refunds";

/**
 * Submit refund request for tour booking
 */
export const submitRefundRequest = async (data) => {
  try {
    const response = await api.post(`${REFUND_BASE}/request`, data);
    return response.data;
  } catch (error) {
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Unable to submit refund request";
    throw new Error(msg);
  }
};

/**
 * Get refund status for tour booking
 */
export const getRefundByBooking = async (bookingID) => {
  try {
    const response = await api.get(`${REFUND_BASE}/booking/${bookingID}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No refund found
    }
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Unable to get refund status";
    throw new Error(msg);
  }
};

/**
 * Submit refund request for car booking
 */
export const requestCarBookingRefund = async (data) => {
  try {
    const response = await api.post(`${REFUND_BASE}/car-booking/request`, data);
    return response.data;
  } catch (error) {
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Unable to submit refund request";
    throw new Error(msg);
  }
};

/**
 * Get refund status for car booking
 */
export const getCarBookingRefund = async (bookingID) => {
  try {
    const response = await api.get(`${REFUND_BASE}/car-booking/${bookingID}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No refund found
    }
    const msg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Unable to get refund status";
    throw new Error(msg);
  }
};
