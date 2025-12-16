import api from "../api";

const BASE = "/staff/attractions";

// Search + filter + paging
export const searchAttractions = async ({
  page = 0,
  size = 10,
  keyword,
  cityID,
  status,
  minRating,
  maxRating,
}) => {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (cityID) params.cityID = cityID;
  if (status !== undefined && status !== null && status !== "") {
    params.status = status;
  }
  if (minRating) params.minRating = minRating;
  if (maxRating) params.maxRating = maxRating;

  const res = await api.get(BASE, { params });
  return res.data;
};

// Get detail
export const getAttractionById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

// Create attraction (multipart: attraction json + image)
export const createAttraction = async ({ attraction, image }) => {
  const formData = new FormData();
  formData.append("attraction", JSON.stringify(attraction));
  if (image) {
    formData.append("image", image);
  }

  const res = await api.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update attraction (multipart: attraction json + image)
export const updateAttractionMultipart = async ({ id, attraction, image }) => {
  const formData = new FormData();
  formData.append("attraction", JSON.stringify(attraction));
  if (image) {
    formData.append("image", image);
  }

  const res = await api.put(`${BASE}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Update attraction (JSON only, no image)
export const updateAttraction = async (id, attraction) => {
  const res = await api.put(`${BASE}/${id}`, attraction);
  return res.data;
};

// Delete attraction
export const deleteAttraction = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

// Get all attractions (for dropdown, no pagination)
export const getAllAttractions = async () => {
  const res = await api.get(`${BASE}`, {
    params: { page: 0, size: 1000 }, // Get large number to get all
  });
  return res.data.items || [];
};




