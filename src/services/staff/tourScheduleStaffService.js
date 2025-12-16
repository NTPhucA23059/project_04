import api from "../api";

const BASE = "/staff/tour-schedules";

// Get all schedules for a tour detail
export const getTourSchedules = async (tourDetailID) => {
  const res = await api.get(`${BASE}/tour-detail/${tourDetailID}`);
  return res.data || [];
};

// Create a new schedule
export const createTourSchedule = async (payload) => {
  const res = await api.post(BASE, payload);
  return res.data;
};

// Update a schedule
export const updateTourSchedule = async (scheduleID, payload) => {
  const res = await api.put(`${BASE}/${scheduleID}`, payload);
  return res.data;
};

// Delete a schedule
export const deleteTourSchedule = async (scheduleID) => {
  const res = await api.delete(`${BASE}/${scheduleID}`);
  return res.data;
};

