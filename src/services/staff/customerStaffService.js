import api from "../api";

const BASE = "/staff/customers";

/**
 * Create customer info (for staff booking on behalf of customer)
 */
export const createCustomerInfo = async (customerData) => {
  try {
    const response = await api.post(BASE, {
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
      "Cannot create customer information";
    throw new Error(errorMessage);
  }
};

