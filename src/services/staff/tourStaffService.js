import api from "../api";

const BASE = "/staff/tours";
const CATEGORY_BASE = "/staff/tour-categories";

// ==============================
// SEARCH + FILTER + PAGING
// ==============================
export const searchTours = async ({
  page = 0,
  size = 10,
  keyword,
  status,
  categoryId,
}) => {
  const params = { page, size };

  if (keyword) params.keyword = keyword;
  if (status !== undefined && status !== null && status !== "") {
    params.status = status;
  }
  if (categoryId) params.categoryId = categoryId;

  const res = await api.get(BASE, { params });
  return res.data;
};

// ==============================
// GET DETAIL
// ==============================
export const getTourById = async (id) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

// ==============================
// CREATE TOUR (MULTIPART)
// ==============================
export const createTour = async ({ tour, mainImage, galleryImages }) => {
  const formData = new FormData();
  formData.append("tour", JSON.stringify(tour));

  if (mainImage) {
    formData.append("mainImage", mainImage);
  }

  if (galleryImages && galleryImages.length > 0) {
    galleryImages.forEach((file) =>
      formData.append("galleryImages", file)
    );
  }

  const res = await api.post(BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// ==============================
// UPDATE TOUR 
// ==============================
export const updateTour = async (id, { tour, mainImage, galleryImages }) => {
  const formData = new FormData();
  formData.append("tour", JSON.stringify(tour));

  if (mainImage) {
    formData.append("mainImage", mainImage);
  }

  if (galleryImages && galleryImages.length > 0) {
    galleryImages.forEach((file) => formData.append("galleryImages", file));
  }

  const res = await api.put(`${BASE}/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};

// ==============================
// DELETE TOUR
// ==============================
export const deleteTour = async (id) => {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
};

// ==============================
// GET ALL TOUR CATEGORIES
// ==============================
export const getAllTourCategories = async () => {
  const res = await api.get(`${CATEGORY_BASE}/all`);
  return res.data;
};

// ==============================
// UPLOAD EXTRA GALLERY IMAGES
// ==============================
export const uploadTourImages = async (tourDetailID, files) => {
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (const f of files) {
    formData.append("files", f);
  }

  const res = await api.post(
    `${BASE}/${tourDetailID}/images`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return res.data;
};








