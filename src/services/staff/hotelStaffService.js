import api from "../api";

const BASE = "/staff/hotels";

export const searchHotels = async ({
  page = 0,
  size = 10,
  keyword,
  status,
  cityID,
}) => {
  const params = { page, size };
  if (keyword) params.keyword = keyword;
  if (status !== undefined && status !== null && status !== "") {
    params.status = status;
  }
  if (cityID) params.cityID = cityID;

  const res = await api.get(BASE, { params });
  return res.data;
};

export const getHotelById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

export const createHotel = async ({ hotel, mainImage, galleryImages }) => {
  const formData = new FormData();
  formData.append("hotel", JSON.stringify(hotel));
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

export const updateHotelMultipart = async ({ id, hotel, mainImage, galleryImages }) => {
  const formData = new FormData();
  formData.append("hotel", JSON.stringify(hotel));
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

export const deleteHotel = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};


