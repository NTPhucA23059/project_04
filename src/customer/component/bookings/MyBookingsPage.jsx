import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../../../services/common/authService";
import { fetchBookingsByAccount, fetchBookingFull } from "../../../services/customer/bookingService";
import BookingCard from "./BookingCard";
import { FunnelIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import api from "../../../services/api";

// Convert relative URL to absolute URL
const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}/${url.replace(/^\/+/, "")}`;
};

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const [sortBy, setSortBy] = useState("upcoming");

    const now = Date.now();

    useEffect(() => {
        const load = async () => {
            const user = getCurrentUser();
            const accountID = user?.accountID || user?.AccountID;
            if (!accountID) {
                setError("Please login to view your tour bookings.");
                return;
            }
            setLoading(true);
            setError("");
            try {
                const res = await fetchBookingsByAccount({ page: 0, size: 20, accountID });
                const items = res.items || [];
                // Get full info for each booking to have tour/tourDetail
                const fullList = await Promise.all(
                    items.map(async (b) => {
                        try {
                            const full = await fetchBookingFull(b.bookingID);
                            return mapFullToUI(full);
                        } catch {
                            return mapBasicToUI(b);
                        }
                    })
                );
                setBookings(fullList);
            } catch (err) {
                setError(err.message || "Unable to load booking list.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const mapBasicToUI = (b) => ({
        bookingID: b.bookingID,
        BookingID: b.bookingID,
        OrderCode: b.orderCode,
        OrderTotal: Number(b.orderTotal ?? 0),
        PaymentStatus: b.paymentStatus === 1 ? "Paid" : "Pending",
        OrderStatus: b.orderStatus,
        ExpireAt: b.expireAt,
        CapacityAdult: b.adultCount,
        CapacityKid: b.childCount || 0,
        CapacityBaby: b.infantCount || 0,
        TourName: "Tour",
        TourImg: "https://placehold.co/300x200",
        DepartureDate: b.expireAt,
        ArrivalDate: b.expireAt,
    });

    const mapFullToUI = (full) => {
        const b = full.booking;
        const td = full.tourDetail;
        const tour = full.tour;
        return {
            bookingID: b.bookingID,
            BookingID: b.bookingID,
            OrderCode: b.orderCode,
            OrderTotal: Number(b.orderTotal ?? 0),
            PaymentStatus: b.paymentStatus === 1 ? "Paid" : "Pending",
            PaymentMethod: b.paymentMethod || "COD",
            OrderStatus: b.orderStatus,
            ExpireAt: b.expireAt,
            CreatedAt: b.createdAt,
            CapacityAdult: b.adultCount,
            CapacityKid: b.childCount || 0,
            CapacityBaby: b.infantCount || 0,
            TourName: tour?.tourName || "Tour",
            TourCode: tour?.tourCode || "N/A",
            TourImg: toAbsoluteUrl(tour?.tourImg) || "https://placehold.co/300x200",
            DepartureDate: td?.departureDate,
            ArrivalDate: td?.arrivalDate,
        };
    };

    // Status logic - Use orderStatus directly from backend
    // orderStatus là gì thì hiển thị đúng trạng thái đó
    const getStatus = (b) => {
        const orderStatus = b.OrderStatus;
        
        // Map orderStatus to display status
        switch (orderStatus) {
            case 0:
                return "Pending Processing";
            case 1:
                return "Confirmed";
            case 2:
                return "On-going";
            case 3:
                return "Completed";
            case 4:
                return "Auto Cancelled";
            case 5:
                return "Refunded";
            default:
                return "Pending Processing";
        }
    };

    // Filter and sort bookings
    const filteredAndSortedBookings = useMemo(() => {
        let result = [...bookings];

        // Filter by status
        if (filterStatus !== "All") {
            result = result.filter((b) => {
                const status = getStatus(b);
                return status === filterStatus;
            });
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case "upcoming":
                    const aDep = a.DepartureDate ? new Date(a.DepartureDate).getTime() : 0;
                    const bDep = b.DepartureDate ? new Date(b.DepartureDate).getTime() : 0;
                    return aDep - bDep; // Ascending (earliest first)
                case "recent":
                    const aCreated = a.CreatedAt ? new Date(a.CreatedAt).getTime() : 0;
                    const bCreated = b.CreatedAt ? new Date(b.CreatedAt).getTime() : 0;
                    return bCreated - aCreated; // Descending (newest first)
                case "status":
                    const statusOrder = {
                        "Pending Processing": 1,
                        "Confirmed": 2,
                        "On-going": 3,
                        "Completed": 4,
                        "Auto Cancelled": 5,
                        "Refunded": 6,
                    };
                    return (
                        (statusOrder[getStatus(a)] || 99) - (statusOrder[getStatus(b)] || 99)
                    );
                case "amount":
                    return b.OrderTotal - a.OrderTotal; // Descending (highest first)
                default:
                    return 0;
            }
        });

        return result;
    }, [bookings, filterStatus, sortBy]);

    const statusCounts = useMemo(() => {
        const counts = {
            All: bookings.length,
            "Pending Processing": 0,
            "Confirmed": 0,
            "On-going": 0,
            "Completed": 0,
            "Auto Cancelled": 0,
            "Refunded": 0,
        };
        bookings.forEach((b) => {
            const status = getStatus(b);
            if (counts[status] !== undefined) {
                counts[status]++;
            }
        });
        return counts;
    }, [bookings]);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold tracking-wide text-neutral-800">
                        My Bookings
                    </h1>
                    <div className="text-sm text-gray-600">
                        Total: <span className="font-semibold">{bookings.length}</span> bookings
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                )}

                {loading && (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading bookings...</p>
                    </div>
                )}

                {/* Filters and Sort */}
                {!loading && !error && bookings.length > 0 && (
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        {/* Status Filter */}
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <FunnelIcon className="w-4 h-4 inline mr-1" />
                                Filter by Status
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {["All", "Pending Processing", "Confirmed", "On-going", "Completed", "Auto Cancelled", "Refunded"].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                            filterStatus === status
                                                ? "bg-primary-600 text-white"
                                                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        {status} {statusCounts[status] !== undefined && `(${statusCounts[status]})`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="sm:w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <ArrowsUpDownIcon className="w-4 h-4 inline mr-1" />
                                Sort by
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="upcoming">Upcoming First</option>
                                <option value="recent">Recent First</option>
                                <option value="status">By Status</option>
                                <option value="amount">Highest Amount</option>
                            </select>
                        </div>
                    </div>
                )}

                {!loading && !error && bookings.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-12 h-12 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No Bookings Yet
                            </h3>
                            <p className="text-gray-500 mb-6">
                                You haven't booked any tours yet. Start exploring our amazing tours!
                            </p>
                            <Link
                                to="/tours"
                                className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                            >
                                Browse Tours
                            </Link>
                        </div>
                    </div>
                )}

                {!loading && !error && bookings.length > 0 && filteredAndSortedBookings.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-500 text-lg">
                            No bookings found with status "{filterStatus}".
                        </p>
                        <button
                            onClick={() => setFilterStatus("All")}
                            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Show All Bookings
                        </button>
                    </div>
                )}

                <div className="space-y-8">
                    {filteredAndSortedBookings.map((b) => {
                        const status = getStatus(b);
                        return <BookingCard key={b.bookingID || b.BookingID} booking={b} status={status} />;
                    })}
                </div>
            </div>
        </div>
    );
}

