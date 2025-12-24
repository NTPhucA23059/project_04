import { useEffect, useMemo, useState } from "react";
import {
    fetchAllReviews,
    fetchAllReviewsByBooking
} from "../../../services/staff/reviewService";

const typeBadge = {
    TOUR: "bg-blue-100 text-blue-700 border border-blue-200",
    CAR: "bg-purple-100 text-purple-700 border border-purple-200"
};

export default function ReviewManagement() {
    const [reviews, setReviews] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [type, setType] = useState("ALL");
    const [loading, setLoading] = useState(false);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const [bookingReviews, setBookingReviews] = useState([]);
    const [showBookingDrawer, setShowBookingDrawer] = useState(false);

    // ==========================
    // LOAD ALL REVIEWS
    // ==========================
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await fetchAllReviews();
                setReviews(data);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ==========================
    // GROUP BY BOOKING
    // ==========================
    const bookings = useMemo(() => {
        const map = new Map();

        reviews.forEach(r => {
            const key =
                r.type === "TOUR"
                    ? `TOUR-${r.bookingToursID}`
                    : `CAR-${r.carBookingID}`;

            if (!map.has(key)) {
                map.set(key, {
                    type: r.type,
                    bookingToursID: r.bookingToursID,
                    carBookingID: r.carBookingID,
                    code: r.code,
                    name: r.name,
                    reviewCount: 1,
                    totalRating: r.rating
                });
            } else {
                const b = map.get(key);
                b.reviewCount++;
                b.totalRating += r.rating;
            }
        });

        return Array.from(map.values()).map(b => ({
            ...b,
            avgRating: (b.totalRating / b.reviewCount).toFixed(1)
        }));
    }, [reviews]);

    // ==========================
    // FILTER
    // ==========================
    const filtered = useMemo(() => {
        const kw = keyword.toLowerCase().trim();

        return bookings.filter(b => {
            const matchKw =
                !kw ||
                b.code?.toLowerCase().includes(kw) ||
                b.name?.toLowerCase().includes(kw);

            const matchType = type === "ALL" || b.type === type;

            return matchKw && matchType;
        });
    }, [keyword, type, bookings]);

    // ==========================
    // PAGINATION
    // ==========================
    const totalItems = filtered?.length || 0;
    const totalPages = Math.ceil(totalItems / pageSize) || 0;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const pageData = (filtered || []).slice(startIndex, endIndex);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [keyword, type, pageSize]);

    // ==========================
    // VIEW BOOKING REVIEWS
    // ==========================
    const viewBookingReviews = async (b) => {
        const params =
            b.type === "TOUR"
                ? { bookingToursID: b.bookingToursID }
                : { carBookingID: b.carBookingID };

        const data = await fetchAllReviewsByBooking(params);
        setBookingReviews(data);
        setShowBookingDrawer(true);
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold">Reviews</h1>

            {loading && <p className="text-sm text-gray-500">Loading...</p>}

            {/* FILTER */}
            <div className="bg-white border rounded-xl p-4 flex gap-3">
                <input
                    className="border px-3 py-2 rounded-lg text-sm w-72"
                    placeholder="Search by code / name"
                    value={keyword}
                    onChange={e => setKeyword(e.target.value)}
                />
                <select
                    className="border px-3 py-2 rounded-lg"
                    value={type}
                    onChange={e => setType(e.target.value)}
                >
                    <option value="ALL">All types</option>
                    <option value="TOUR">Tour</option>
                    <option value="CAR">Car</option>
                </select>
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-primary-50">
                        <tr>
                            <th className="px-4 py-3">Code</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Avg Rating</th>
                            <th className="px-4 py-3">Reviews</th>
                            <th className="px-4 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageData.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                    No reviews found
                                </td>
                            </tr>
                        ) : (
                            pageData.map(b => (
                            <tr
                                key={`${b.type}-${b.bookingToursID || b.carBookingID}`}
                                className="border-b"
                            >
                                <td className="px-4 py-3">{b.code}</td>
                                <td className="px-4 py-3">{b.name}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${typeBadge[b.type]}`}>
                                        {b.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3">⭐ {b.avgRating}</td>
                                <td className="px-4 py-3">{b.reviewCount}</td>
                                <td className="px-4 py-3">
                                    <button
                                        className="px-3 py-1 bg-indigo-600 text-white rounded text-xs"
                                        onClick={() => viewBookingReviews(b)}
                                    >
                                        View
                                    </button>
                                </td>
                            </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalItems > 0 && (
                <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Showing info */}
                    <p className="text-sm text-neutral-600 font-medium">
                        Showing {startIndex + 1}–{endIndex} of {totalItems} bookings
                    </p>

                    <div className="flex items-center gap-4">
                        {/* Page size selector */}
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-neutral-200 bg-white px-3 py-1.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                        >
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>

                        {/* Page navigation */}
                        {totalPages > 1 && (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage <= 1}
                                    className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
                                >
                                    Previous
                                </button>
                                
                                {/* Page numbers */}
                                {totalPages > 0 && (() => {
                                    const pages = [];
                                    const maxVisible = 7;
                                    
                                    if (totalPages <= maxVisible) {
                                        for (let i = 1; i <= totalPages; i++) {
                                            pages.push(i);
                                        }
                                    } else {
                                        pages.push(1);
                                        if (currentPage <= 4) {
                                            for (let i = 2; i <= 5; i++) {
                                                pages.push(i);
                                            }
                                            pages.push('...');
                                            pages.push(totalPages);
                                        } else if (currentPage >= totalPages - 3) {
                                            pages.push('...');
                                            for (let i = totalPages - 4; i <= totalPages; i++) {
                                                pages.push(i);
                                            }
                                        } else {
                                            pages.push('...');
                                            for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                                                pages.push(i);
                                            }
                                            pages.push('...');
                                            pages.push(totalPages);
                                        }
                                    }
                                    
                                    return pages.map((pageNum, idx) => {
                                        if (pageNum === '...') {
                                            return (
                                                <span key={`ellipsis-${idx}`} className="px-2 text-neutral-400">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`px-3 py-1.5 rounded-lg border transition ${
                                                    currentPage === pageNum
                                                        ? "bg-primary-600 text-white border-primary-600"
                                                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    });
                                })()}
                                
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {showBookingDrawer && (
                <BookingReviewDrawer
                    reviews={bookingReviews}
                    onClose={() => setShowBookingDrawer(false)}
                />
            )}
        </div>
    );
}

/* ==========================
   DRAWER
========================== */
function BookingReviewDrawer({ reviews, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
            <div className="bg-white w-full max-w-lg h-full p-6 overflow-y-auto">
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                        Booking Reviews ({reviews.length})
                    </h3>
                    <button onClick={onClose}>✕</button>
                </div>

                {reviews.length === 0 && (
                    <p className="text-sm text-gray-500">
                        Booking này chưa có review
                    </p>
                )}

                {reviews.map(r => (
                    <div key={r.reviewID} className="border-b py-3">
                        <div>⭐ {r.rating}/5</div>
                        <p className="mt-1">{r.comment}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(r.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
