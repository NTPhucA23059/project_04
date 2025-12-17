// src/services/staff/invoiceStaffService.js
import api from "../api";

const BASE = "/staff/invoices";


export const searchInvoices = async ({
  page = 0,
  size = 10,
  keyword,
  status,
  bookingID,
  staffID,
}) => {
  const params = { page, size };

  if (keyword) params.keyword = keyword;
  if (status !== undefined && status !== null && status !== "") {
    params.status = status;
  }
  if (bookingID) params.bookingID = bookingID;
  if (staffID) params.staffID = staffID;

  const res = await api.get(BASE, { params });
  return res.data;
};

/**
 * Get invoice by ID
 */
export const getInvoiceById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

/**
 * Create new invoice
 */
export const createInvoice = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

/**
 * Update invoice
 */
export const updateInvoice = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

/**
 * Export invoice as PDF
 */
export const exportInvoicePdf = async (id) => {
  try {
    const res = await api.get(`${BASE}/${id}/pdf`, {
      responseType: 'blob', // Important for binary data
    });
    return res.data;
  } catch (error) {
    // If error response is blob (JSON error from backend), try to parse it
    if (error.response && error.response.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const json = JSON.parse(text);
        const errorMessage = json.error || json.message || "Failed to export PDF";
        throw new Error(errorMessage);
      } catch (parseError) {
        // If parsing fails, it might be a real PDF error or other issue
        throw new Error(error.response?.status === 400 
          ? "Bad request. Invoice may not exist or PDF generation failed." 
          : error.message || "Failed to export PDF");
      }
    }
    // If error response is already JSON
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error(error.message || "Failed to export PDF");
  }
};
