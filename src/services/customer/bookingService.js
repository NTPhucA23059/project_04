import api from "../api";

// Customer-facing booking & customer info endpoints
const BOOKING_BASE = "/customer/booking-tours";
const CUSTOMER_BASE = "/customer/customers";

/**
 * Tạo CustomerInfo mới
 */
export const createCustomerInfo = async (customerData) => {
  try {
    const response = await api.post(CUSTOMER_BASE, {
      customerName: customerData.customerName,
      customerPhone: customerData.customerPhone,
      customerEmail: customerData.customerEmail || null,
      citizenCard: customerData.citizenCard || null,
    });

    return response.data.data; // { customerInfoID, ... }
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể tạo thông tin khách hàng";
    throw new Error(errorMessage);
  }
};

/**
 * Tạo BookingTour mới
 */
export const createBookingTour = async (bookingData) => {
  try {
    const response = await api.post(BOOKING_BASE, bookingData);
    return response.data.data; // BookingTourResponseDTO
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể tạo booking";
    throw new Error(errorMessage);
  }
};

/**
 * Lấy thông tin booking theo ID
 */
export const getBookingById = async (id) => {
  try {
    const response = await api.get(`${BOOKING_BASE}/${id}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể lấy thông tin booking";
    throw new Error(errorMessage);
  }
};

/**
 * Lấy danh sách booking theo accountID (public)
 */
export const fetchBookingsByAccount = async ({ page = 0, size = 10, accountID }) => {
  try {
    const params = { page, size };
    if (accountID) params.accountID = accountID;
    const res = await api.get(BOOKING_BASE, { params });
    return res.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể lấy danh sách booking";
    throw new Error(errorMessage);
  }
};

/**
 * Lấy full thông tin booking (booking + tour + customer)
 */
export const fetchBookingFull = async (id) => {
  try {
    const res = await api.get(`${BOOKING_BASE}/${id}/full`);
    return res.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể lấy thông tin booking";
    throw new Error(errorMessage);
  }
};







