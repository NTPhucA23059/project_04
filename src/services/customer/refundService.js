import api from "../api";

const BASE = "/customer/refunds";

/**
 * Submit a refund request for a booking
 * @param {Object} refundRequest - { bookingID, bankName, bankAccount, accountHolder, note }
 * @returns {Promise} Refund response
 */
export const submitRefundRequest = async (refundRequest) => {
    const res = await api.post(`${BASE}/request`, refundRequest);
    return res.data;
};

/**
 * Get refund status for a booking
 * @param {Number} bookingID - Booking ID
 * @returns {Promise} Refund information
 */
export const getRefundByBooking = async (bookingID) => {
    const res = await api.get(`${BASE}/booking/${bookingID}`);
    return res.data;
};

