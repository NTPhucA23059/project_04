import api from "../api";

const BASE = "/staff/cars";
const CAR_TYPE_BASE = "/staff/car-types";

export const searchCars = async ({
  page = 0,
  size = 10,
  keyword,
  status,
  carTypeID,
}) => {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (status !== undefined && status !== null && status !== "") {
    params.status = status;
  }
  if (carTypeID) params.carTypeID = carTypeID;

  const res = await api.get(BASE, { params });
  return res.data;
};

export const getCarById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createCar = async ({ car, mainImage, galleryImages }) => {
  const formData = new FormData();
  formData.append("car", JSON.stringify(car));
  if (mainImage) {
    formData.append("mainImage", mainImage);
  }
  if (galleryImages && galleryImages.length > 0) {
    galleryImages.forEach((file) => formData.append("galleryImages", file));
  }

  const res = await api.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const updateCarMultipart = async ({ id, car, mainImage, galleryImages }) => {
  const formData = new FormData();
  formData.append("car", JSON.stringify(car));
  if (mainImage) {
    formData.append("mainImage", mainImage);
  }
  if (galleryImages && galleryImages.length > 0) {
    galleryImages.forEach((file) => {
      if (file) formData.append("galleryImages", file);
    });
  }

  const res = await api.put(`${BASE}/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteCar = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

// Lấy tất cả Car Types (dropdown)
export const getAllCarTypes = async () => {
  const res = await api.get(`${CAR_TYPE_BASE}/all`);
  return res.data;
};

// Upload nhiều ảnh cho car
export const uploadCarImages = async (carId, files) => {
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (const f of files) {
    formData.append("files", f);
  }

  const res = await api.post(`${BASE}/${carId}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};








