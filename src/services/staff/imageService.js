import api from "../api";

export const deleteImage = async (imageId) => {
  const res = await api.delete(`/staff/images/${imageId}`);
  return res.data;
};








