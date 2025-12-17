import api from "../api";

const CAR_BOOKING_BASE = "/customer/car-bookings";
const REVIEW_BASE = "/customer/reviews";

/**
 * Tạo CarBooking
 */
export const createCarBooking = async (data) => {
  try {
    const response = await api.post(CAR_BOOKING_BASE, data);
    return response.data.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể tạo đơn đặt xe";
    throw new Error(msg);
  }
};

export const fetchCarBookingsByAccount = async ({ page = 0, size = 10, accountID, keyword, status }) => {
  try {
    const params = { page, size };
    if (accountID) params.accountID = accountID;
    if (keyword) params.keyword = keyword;
    if (status !== undefined && status !== null) params.status = status;
    const res = await api.get(CAR_BOOKING_BASE, { params });
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Unable to load car bookings";
    throw new Error(msg);
  }
};

export const fetchCarBookingFull = async (id) => {
  try {
    const res = await api.get(`${CAR_BOOKING_BASE}/${id}/full`);
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể lấy thông tin đặt xe";
    throw new Error(msg);
  }
};

export const createReview = async (payload) => {
  try {
    const res = await api.post(REVIEW_BASE, payload);
    return res.data;
  } catch (error) {
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể gửi đánh giá";
    throw new Error(msg);
  }
};








