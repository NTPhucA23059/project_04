import { useState, useMemo } from "react";
import { StarIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function CarReview({ reviews }) {
    const [open, setOpen] = useState(false);

    const { avgRating, sortedReviews, breakdown } = useMemo(() => {
        if (!reviews.length) {
            return {
                avgRating: "0.0",
                sortedReviews: [],
                breakdown: [0, 0, 0, 0, 0],
            };
        }

        const sorted = [...reviews].sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        const avg = reviews.reduce((s, r) => s + r.Rating, 0) / reviews.length;

        const bd = [0, 0, 0, 0, 0];
        reviews.forEach((r) => bd[5 - r.Rating]++);

        return {
            avgRating: avg.toFixed(1),
            sortedReviews: sorted,
            breakdown: bd
        };
    }, [reviews]);

    const ratingColors = {
        5: "bg-green-500",
        4: "bg-blue-500",
        3: "bg-yellow-400",
        2: "bg-orange-500",
        1: "bg-red-500",
    };

    return (
        <div className="mt-12">
            {/* ================= Overview Section ================= */}
            <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

            <div className="flex items-center gap-4 mb-6">
                <p className="text-4xl font-bold text-orange-600">{avgRating}</p>

                <div className="flex text-yellow-500">
                    {Array(Math.round(avgRating)).fill(0).map((_, i) => (
                        <StarIcon key={i} className="w-6 h-6" />
                    ))}
                </div>

                <p className="text-gray-500">{reviews.length} reviews</p>
            </div>

            {/* Show first 3 reviews */}
            {sortedReviews.slice(0, 3).map((r) => (
                <div key={r.ReviewID} className="border-b pb-3 mb-4">
                    <p className="font-semibold">User {r.AccountID}</p>
                    <div className="flex text-yellow-500">
                        {Array(r.Rating).fill(0).map((_, i) => (
                            <StarIcon key={i} className="w-4 h-4" />
                        ))}
                    </div>
                    <p className="text-gray-700">{r.Comment}</p>
                </div>
            ))}

            {reviews.length > 3 && (
                <button
                    onClick={() => setOpen(true)}
                    className="text-orange-600 font-semibold hover:underline"
                >
                    View all reviews
                </button>
            )}

            {/* ================= Modal ================= */}
            {open && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
                    <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-xl shadow-xl overflow-hidden">

                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h2 className="text-xl font-bold">All Reviews</h2>
                            <button
                                onClick={() => setOpen(false)}
                                className="hover:text-gray-900"
                            >
                                <XMarkIcon className="w-7 h-7 text-gray-600" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto p-5 space-y-8">

                            {/* AVG Rating inside modal */}
                            <div className="flex items-center gap-6 pb-3 border-b">
                                <div className="text-center">
                                    <p className="text-5xl font-bold text-orange-600">{avgRating}</p>
                                    <p className="text-sm text-gray-600">{reviews.length} reviews</p>
                                </div>

                                <div className="flex text-yellow-500">
                                    {Array(Math.round(avgRating))
                                        .fill(0)
                                        .map((_, i) => (
                                            <StarIcon key={i} className="h-7 w-7" />
                                        ))}
                                </div>
                            </div>

                            {/* Rating Breakdown */}
                            <div className="space-y-3 border-b pb-5">
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = breakdown[5 - star];
                                    const percent = Math.round((count / reviews.length) * 100) || 0;

                                    return (
                                        <div key={star} className="flex items-center gap-3">
                                            <span className="w-10 text-sm">{star} ★</span>

                                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full ${ratingColors[star]}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>

                                            <span className="w-12 text-right text-sm text-gray-500">
                                                {percent}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* All Reviews */}
                            <div className="space-y-6">
                                {sortedReviews.map((r) => (
                                    <div key={r.ReviewID} className="pb-4 border-b last:border-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold shadow">
                                                {`U${r.AccountID}`}
                                            </div>

                                            <div>
                                                <p className="font-semibold">{`User ${r.AccountID}`}</p>
                                                <div className="flex text-yellow-500">
                                                    {Array(r.Rating).fill(0).map((_, i) => (
                                                        <StarIcon key={i} className="h-5 w-5" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-gray-700">{r.Comment}</p>

                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(r.CreatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
