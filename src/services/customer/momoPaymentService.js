import api from "../api";

const MOMO_BASE = "/api/payments/momo";

/**
 * Kiểm tra booking có tồn tại không
 * @param {string} orderId - orderCode hoặc bookingID
 * @param {string} bookingType - "TOUR" hoặc "CAR"
 * @returns {Promise<Object>} Thông tin booking
 */
export const checkBooking = async (orderId, bookingType = "TOUR") => {
  try {
    const response = await api.get(`${MOMO_BASE}/check-booking`, {
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
 * Tạo MoMo payment request
 * @param {Object} paymentData - Dữ liệu thanh toán
 * @param {number} paymentData.amount - Số tiền (VND)
 * @param {string} paymentData.orderId - orderCode hoặc bookingID
 * @param {string} paymentData.orderInfo - Mô tả đơn hàng (optional)
 * @param {string} paymentData.source - Nguồn: "WEB" hoặc "POS" (optional, default: "WEB")
 * @param {string} paymentData.bookingType - "TOUR" hoặc "CAR" (optional, default: "TOUR")
 * @returns {Promise<Object>} Response chứa payUrl
 */
export const createMomoPayment = async (paymentData) => {
  try {
    // Validate and format amount
    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Số tiền không hợp lệ");
    }
    
    // Validate orderId
    if (!paymentData.orderId || paymentData.orderId.trim() === "") {
      throw new Error("Order ID không được để trống");
    }
    
    // Validate bookingType
    const bookingType = paymentData.bookingType || "TOUR";
    if (bookingType !== "TOUR" && bookingType !== "CAR") {
      throw new Error("Booking type phải là TOUR hoặc CAR");
    }
    
    const requestBody = {
      amount: amount, // Send as number, backend will convert to BigDecimal
      orderId: paymentData.orderId.trim(),
      orderInfo: paymentData.orderInfo || "Thanh toán đơn hàng qua MoMo",
      source: paymentData.source || "WEB",
      bookingType: bookingType,
    };
    
    console.log("MoMo Payment Request:", requestBody);
    
    const response = await api.post(`${MOMO_BASE}/create`, requestBody);

    if (response.data.data && response.data.data.payUrl) {
      return response.data.data;
    }
    throw new Error("Không nhận được payUrl từ MoMo");
  } catch (error) {
    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Không thể tạo thanh toán MoMo";
    throw new Error(errorMessage);
  }
};

/**
 * Redirect đến MoMo để thanh toán
 * @param {string} payUrl - URL từ createMomoPayment response
 */
export const redirectToMomo = (payUrl) => {
  if (!payUrl) {
    throw new Error("Pay URL không hợp lệ");
  }
  window.location.href = payUrl;
};

/**
 * Xử lý thanh toán MoMo cho Tour booking
 * @param {Object} booking - Thông tin booking
 * @param {string} booking.orderCode - Mã đơn hàng
 * @param {number} booking.orderTotal - Tổng tiền (VND)
 * @returns {Promise<string>} payUrl để redirect
 */
export const processTourPayment = async (booking) => {
  try {
    // Validate booking data
    if (!booking || !booking.orderCode) {
      throw new Error("Thông tin booking không hợp lệ");
    }
    
    const orderTotal = parseFloat(booking.orderTotal);
    if (isNaN(orderTotal) || orderTotal <= 0) {
      throw new Error(`Số tiền không hợp lệ: ${booking.orderTotal}`);
    }
    
    // Kiểm tra booking trước
    await checkBooking(booking.orderCode, "TOUR");

    // Tạo payment
    const paymentData = {
      amount: orderTotal,
      orderId: booking.orderCode,
      orderInfo: `Thanh toán đơn hàng tour #${booking.orderCode}`,
      bookingType: "TOUR",
    };

    const result = await createMomoPayment(paymentData);
    return result.payUrl;
  } catch (error) {
    throw new Error(`Lỗi xử lý thanh toán tour: ${error.message}`);
  }
};

/**
 * Xử lý thanh toán MoMo cho Car booking
 * @param {Object} booking - Thông tin booking
 * @param {string} booking.bookingCode - Mã đơn đặt xe
 * @param {number} booking.finalTotal - Tổng tiền (VND)
 * @returns {Promise<string>} payUrl để redirect
 */
export const processCarPayment = async (booking) => {
  try {
    // Kiểm tra booking trước
    await checkBooking(booking.bookingCode, "CAR");

    // Tạo payment
    const paymentData = {
      amount: parseFloat(booking.finalTotal) || 0,
      orderId: booking.bookingCode,
      orderInfo: `Thanh toán đơn đặt xe #${booking.bookingCode}`,
      bookingType: "CAR",
    };

    const result = await createMomoPayment(paymentData);
    return result.payUrl;
  } catch (error) {
    throw new Error(`Lỗi xử lý thanh toán xe: ${error.message}`);
  }
};


