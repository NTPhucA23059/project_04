import api from "../api";

const BASE = "/staff/refunds";
const BANK_INFO_BASE = "/staff/refund-bank-info";

/**
 * Search refunds with filters
 */
export const searchRefunds = async ({
  page = 0,
  size = 10,
  status,
  bookingID,
  staffID,
}) => {
  const params = { page, size };
  if (status !== undefined && status !== null) params.status = status;
  if (bookingID) params.bookingID = bookingID;
  if (staffID) params.staffID = staffID;

  const res = await api.get(BASE, { params });
  return res.data;
};

/**
 * Get refund by ID
 */
export const getRefundById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

/**
 * Create refund
 */
export const createRefund = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

/**
 * Update refund
 */
export const updateRefund = async (id, payload) => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
};

/**
 * Delete refund
 */
export const deleteRefund = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

/**
 * Get refund bank info by refund ID
 */
export const getBankInfoByRefundID = async (refundID) => {
  const res = await api.get(`${BANK_INFO_BASE}/refund/${refundID}`);
  return res.data;
};

/**
 * Get refund bank info by ID
 */
export const getBankInfoById = async (id) => {
  const res = await api.get(`${BANK_INFO_BASE}/id/${id}`);
  return res.data;
};

/**
 * Create refund bank info
 */
export const createBankInfo = async (payload) => {
  const res = await api.post(BANK_INFO_BASE, payload);
  return res.data;
};

/**
 * Update refund bank info
 */
export const updateBankInfo = async (id, payload) => {
  const res = await api.put(`${BANK_INFO_BASE}/${id}`, payload);
  return res.data;
};

/**
 * Delete refund bank info
 */
export const deleteBankInfo = async (id) => {
  const res = await api.delete(`${BANK_INFO_BASE}/${id}`);
  return res.data;
};

