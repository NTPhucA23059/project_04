import { useEffect, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import {
    submitCarReview,
    getCarReviewByBooking,
    deleteReview
} from "../../../services/customer/reviewService";

export default function CarReview({ carBookingID }) {
    const [review, setReview] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    // ==========================
    // LOAD REVIEW (nếu đã đánh giá)
    // ==========================
    useEffect(() => {
        const loadReview = async () => {
            try {
                const data = await getCarReviewByBooking(carBookingID);
                setReview(data);
            } catch {
                setReview(null); // chưa đánh giá
            }
        };

        if (carBookingID) loadReview();
    }, [carBookingID]);

    // ==========================
    // SUBMIT
    // ==========================
    const handleSubmit = async () => {
        if (!rating) {
            alert("Please select rating");
            return;
        }

        try {
            setLoading(true);

            const data = await submitCarReview({
                carBookingID,
                rating,
                comment
            });

            setReview(data);
            setRating(0);
            setComment("");
        } catch (err) {
            alert(err.message || "Submit failed");
        } finally {
            setLoading(false);
        }
    };

    // ==========================
    // DELETE
    // ==========================
    const handleDelete = async () => {
        if (!window.confirm("Delete this review?")) return;

        try {
            await deleteReview(review.reviewID);
            setReview(null);
        } catch {
            alert("Delete failed");
        }
    };

    // ==========================
    // UI – ĐÃ ĐÁNH GIÁ
    // ==========================
    if (review) {
        return (
            <div className="mt-4 p-4 border rounded-xl bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon
                            key={s}
                            className={`w-5 h-5 ${s <= review.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                                }`}
                        />
                    ))}
                    <span className="text-sm font-medium">
                        {review.rating}/5
                    </span>
                </div>

                <p className="text-gray-700 mb-3">{review.comment}</p>

                <button
                    onClick={handleDelete}
                    className="px-4 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                >
                    Delete Review
                </button>
            </div>
        );
    }

    // ==========================
    // UI – FORM ĐÁNH GIÁ
    // ==========================
    return (
        <div className="mt-4 p-4 bg-white border rounded-xl shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                {/* ⭐ Rating */}
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                            key={star}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(star)}
                            className={`w-6 h-6 cursor-pointer ${(hover || rating) >= star
                                ? "text-yellow-400"
                                : "text-gray-300"
                                }`}
                        />
                    ))}
                </div>

                {/* Comment */}
                <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this car..."
                    className="flex-1 px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                />

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-5 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-60"
                >
                    {loading ? "Saving..." : "Submit Review"}
                </button>
            </div>
        </div>
    );
}
