import api from "../api";

const BASE = "/staff/flights";

export const searchFlights = async ({
  page = 0,
  size = 10,
  keyword,
  status,
  fromCityID,
  toCityID,
}) => {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (status !== undefined && status !== null && status !== "") {
    params.status = status;
  }
  if (fromCityID) params.fromCityID = fromCityID;
  if (toCityID) params.toCityID = toCityID;

  const res = await api.get(BASE, { params });
  return res.data;
};

export const createFlight = async (payload, imageFile) => {
  if (imageFile) {
    // Multipart form data
    const formData = new FormData();
    formData.append("flight", JSON.stringify(payload));
    formData.append("image", imageFile);
    
    const res = await api.post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } else {
    // JSON only
    const res = await api.post(`${BASE}/json`, payload);
    return res.data;
  }
};

export const updateFlight = async (id, payload, imageFile) => {
  if (imageFile) {
    // Multipart form data
    const formData = new FormData();
    formData.append("flight", JSON.stringify(payload));
    formData.append("image", imageFile);
    
    const res = await api.put(`${BASE}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } else {
    // JSON only
    const res = await api.put(`${BASE}/${id}/json`, payload);
    return res.data;
  }
};

export const deleteFlight = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

export const getFlightById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};




