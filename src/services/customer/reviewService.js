import api from "../api";

const getAccountID = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) throw new Error("User not logged in");

    const user = JSON.parse(userStr);
    if (!user.accountID) throw new Error("Account ID not found");

    return user.accountID;
};

// ==========================
// CREATE REVIEW
// ==========================
export const submitTourReview = async ({ bookingToursID, rating, comment }) => {
    const accountID = getAccountID();

    const res = await api.post(
        "/api/reviews/tour",
        { bookingToursID, rating, comment },
        { params: { accountID } }
    );

    return res.data;
};

export const submitCarReview = async ({ carBookingID, rating, comment }) => {
    const accountID = getAccountID();

    const res = await api.post(
        "/api/reviews/car",
        { carBookingID, rating, comment },
        { params: { accountID } }
    );

    return res.data;
};

// ==========================
// GET REVIEW (✅ FIX HERE)
// ==========================
export const getTourReviewByBooking = async (bookingToursID) => {
    const res = await api.get("/api/reviews/by-booking", {
        params: { bookingToursID }
    });
    return res.data; // null | ReviewResponseDTO
};

export const getCarReviewByBooking = async (carBookingID) => {
    const res = await api.get("/api/reviews/by-booking", {
        params: { carBookingID }
    });
    return res.data; // null | ReviewResponseDTO
};

// ==========================
// GET REVIEWS BY TOUR ID
// ==========================
export const getReviewsByTourID = async (tourID) => {
    try {
        const res = await api.get(`/api/reviews/by-tour/${tourID}`);
        return res.data || [];
    } catch (error) {
        console.error("Error fetching reviews by tour ID:", error);
        return [];
    }
};

// ==========================
// DELETE REVIEW
// ==========================
export const deleteReview = async (reviewID) => {
    await api.delete(`/api/reviews/${reviewID}`);
};
