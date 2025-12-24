import api from "../api";

export const fetchAllReviews = async () => {
    const res = await api.get("/api/staff/reviews");
    return res.data;
};

export const deleteReview = async (reviewID) => {
    await api.delete(`/api/staff/reviews/${reviewID}`);
};

export const fetchAllReviewsByBooking = async (params) => {
    const query = new URLSearchParams(params).toString();
    const res = await api.get(`/api/staff/reviews/by-booking?${query}`);
    return res.data;
};