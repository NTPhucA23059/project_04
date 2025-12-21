import api from "../api";

const PAYPAL_BASE = "/api/payments/paypal";

/**
 * Kiểm tra booking có tồn tại không
 * @param {string} orderId - orderCode hoặc bookingID
 * @param {string} bookingType - "TOUR" hoặc "CAR"
 * @returns {Promise<Object>} Thông tin booking
 */
export const checkBooking = async (orderId, bookingType = "TOUR") => {
  try {
    const response = await api.get(`${PAYPAL_BASE}/check-booking`, {
      params: {
        orderId,
        bookingType,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      "Không thể kiểm tra booking";
    throw new Error(errorMessage);
  }
};

/**
 * Tạo PayPal payment request
 * @param {Object} paymentData - Dữ liệu thanh toán
 * @param {number} paymentData.amount - Số tiền (phải là số thập phân, ví dụ: 100.00)
 * @param {string} paymentData.orderId - orderCode hoặc bookingID
 * @param {string} paymentData.orderInfo - Mô tả đơn hàng (optional)
 * @param {string} paymentData.source - Nguồn: "WEB" hoặc "POS" (optional, default: "WEB")
 * @param {string} paymentData.bookingType - "TOUR" hoặc "CAR" (optional, default: "TOUR")
 * @param {string} paymentData.currency - Mã tiền tệ (optional, default: "USD")
 * @returns {Promise<Object>} Response chứa approvalUrl và paypalOrderId
 */
export const createPayPalPayment = async (paymentData) => {
  try {
    const response = await api.post(`${PAYPAL_BASE}/create`, {
      amount: paymentData.amount,
      orderId: paymentData.orderId,
      orderInfo: paymentData.orderInfo || "Thanh toán đơn hàng qua PayPal",
      source: paymentData.source || "WEB",
      bookingType: paymentData.bookingType || "TOUR",
      currency: paymentData.currency || "USD",
    });

    if (response.data.data && response.data.data.approvalUrl) {
      return response.data.data;
    }
    throw new Error("Không nhận được approval URL từ PayPal");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Không thể tạo thanh toán PayPal";
    throw new Error(errorMessage);
  }
};

/**
 * Capture PayPal payment (xác nhận thanh toán)
 * @param {string} paypalOrderId - PayPal order ID từ create payment response
 * @returns {Promise<Object>} Response chứa status và transactionId
 */
export const capturePayPalPayment = async (paypalOrderId) => {
  try {
    const response = await api.post(`${PAYPAL_BASE}/capture`, {
      paypalOrderId,
    });

    if (response.data.data) {
      return response.data.data;
    }
    throw new Error("Không nhận được response từ PayPal");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Không thể capture thanh toán PayPal";
    throw new Error(errorMessage);
  }
};

/**
 * Redirect đến PayPal để thanh toán
 * @param {string} approvalUrl - URL từ createPayPalPayment response
 */
export const redirectToPayPal = (approvalUrl) => {
  if (!approvalUrl) {
    throw new Error("Approval URL không hợp lệ");
  }
  window.location.href = approvalUrl;
};

/**
 * Xử lý thanh toán PayPal cho Tour booking
 * @param {Object} booking - Thông tin booking
 * @param {string} booking.orderCode - Mã đơn hàng
 * @param {number} booking.orderTotal - Tổng tiền
 * @param {string} currency - Mã tiền tệ (optional, default: "USD")
 * @returns {Promise<string>} approvalUrl để redirect
 */
export const processTourPayment = async (booking, currency = "USD") => {
  try {
    // Kiểm tra booking trước
    await checkBooking(booking.orderCode, "TOUR");

    // Tạo payment
    const paymentData = {
      amount: parseFloat(booking.orderTotal) || 0,
      orderId: booking.orderCode,
      orderInfo: `Thanh toán đơn hàng tour #${booking.orderCode}`,
      bookingType: "TOUR",
      currency: currency,
    };

    const result = await createPayPalPayment(paymentData);
    return result.approvalUrl;
  } catch (error) {
    throw new Error(`Lỗi xử lý thanh toán tour: ${error.message}`);
  }
};

/**
 * Xử lý thanh toán PayPal cho Car booking
 * @param {Object} booking - Thông tin booking
 * @param {string} booking.bookingCode - Mã đơn đặt xe
 * @param {number} booking.finalTotal - Tổng tiền
 * @param {string} currency - Mã tiền tệ (optional, default: "USD")
 * @returns {Promise<string>} approvalUrl để redirect
 */
export const processCarPayment = async (booking, currency = "USD") => {
  try {
    // Kiểm tra booking trước
    await checkBooking(booking.bookingCode, "CAR");

    // Tạo payment
    const paymentData = {
      amount: parseFloat(booking.finalTotal) || 0,
      orderId: booking.bookingCode,
      orderInfo: `Thanh toán đơn đặt xe #${booking.bookingCode}`,
      bookingType: "CAR",
      currency: currency,
    };

    const result = await createPayPalPayment(paymentData);
    return result.approvalUrl;
  } catch (error) {
    throw new Error(`Lỗi xử lý thanh toán xe: ${error.message}`);
  }
};


