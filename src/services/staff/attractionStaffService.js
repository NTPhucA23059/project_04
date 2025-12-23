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

// Create attraction (JSON only - backend doesn't support multipart)
export const createAttraction = async ({ attraction, image }) => {
  // Backend only accepts JSON (@RequestBody), not multipart/form-data
  // If image upload is needed in the future, backend needs to be updated to support @RequestPart
  // Ignore image parameter - backend doesn't support image upload for attractions
  
  // Explicitly set Content-Type to JSON to ensure we're not sending multipart
  const res = await api.post(BASE, attraction, {
    headers: {
      'Content-Type': 'application/json'
    }
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

  // Don't set Content-Type manually - let browser set it with boundary automatically
  const res = await api.put(`${BASE}/${id}`, formData);
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




