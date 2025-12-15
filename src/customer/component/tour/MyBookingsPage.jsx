import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../component/tour/StatusBadge";
import { getCurrentUser } from "../../../services/common/authService";
import { fetchBookingsByAccount, fetchBookingFull } from "../../../services/customer/bookingService";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const now = Date.now();

    useEffect(() => {
        const load = async () => {
            const user = getCurrentUser();
            const accountID = user?.accountID || user?.AccountID;
            if (!accountID) {
                setError("Vui lòng đăng nhập để xem đơn đặt tour của bạn.");
                return;
            }
            setLoading(true);
            setError("");
            try {
                const res = await fetchBookingsByAccount({ page: 0, size: 20, accountID });
                const items = res.items || [];
                // Lấy full info cho từng booking để có tour/tourDetail
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
                setError(err.message || "Không thể tải danh sách booking.");
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
            OrderStatus: b.orderStatus,
            ExpireAt: b.expireAt,
            CapacityAdult: b.adultCount,
            CapacityKid: b.childCount || 0,
            CapacityBaby: b.infantCount || 0,
            TourName: tour?.tourName || "Tour",
            TourImg: tour?.tourImg || "https://placehold.co/300x200",
            DepartureDate: td?.departureDate,
            ArrivalDate: td?.arrivalDate,
        };
    };

    // ================================
    // STATUS LOGIC (THEO QUY ĐỊNH MỚI)
    // ================================
    const getStatus = (b) => {
        const departure = b.DepartureDate ? new Date(b.DepartureDate).getTime() : 0;
        const arrival = b.ArrivalDate ? new Date(b.ArrivalDate).getTime() : 0;

        if (b.PaymentStatus === "Paid") {
            if (now > arrival) return "Completed";
            return "Paid";
        }

        if (b.PaymentStatus === "Pending") {
            if (now > new Date(b.ExpireAt).getTime()) return "Expired";
            return "Pending";
        }

        if (b.OrderStatus === 3) return "Cancelled";
        return "Pending";
    };

    return (
        <div className="px-4 py-12 mt-20">

            <h1 className="text-4xl font-bold mb-10 tracking-wide text-neutral-800">
                My Bookings
            </h1>

            {error && <p className="text-red-600 text-lg">{error}</p>}
            {loading && <p className="text-gray-500 text-lg">Đang tải...</p>}

            {!loading && !error && bookings.length === 0 && (
                <p className="text-gray-500 text-lg">
                    You haven't booked any tours.
                </p>
            )}

            <div className="space-y-8">
                {bookings.map((b, i) => {
                    const status = getStatus(b);

                    return (
                        <div
                            key={i}
                            className="bg-white rounded-2xl shadow-lg border border-neutral-200 hover:shadow-xl transition overflow-hidden"
                        >
                            {/* HEADER */}
                            <div className="flex justify-between items-center px-6 py-4 bg-neutral-50 border-b">
                                <div>
                                    <p className="text-xs text-gray-400">Booking Code</p>
                                    <p className="font-bold text-xl">{b.OrderCode}</p>
                                </div>

                                <StatusBadge status={status} />
                            </div>

                            {/* CONTENT */}
                            <div className="flex flex-col md:flex-row gap-6 p-6">
                                {/* IMAGE */}
                                <div className="w-full md:w-48">
                                    <img
                                        src={b.TourImg}
                                        alt="tour"
                                        className="w-full h-40 md:h-full rounded-xl object-cover shadow-md border"
                                    />
                                </div>

                                {/* DETAILS */}
                                <div className="flex-1 space-y-3">
                                    <p className="font-semibold text-2xl text-neutral-900 leading-tight">
                                        {b.TourName}
                                    </p>

                                    <div className="grid grid-cols-2 gap-4 text-sm text-neutral-700">
                                        <p>
                                            <strong>Guests:</strong>{" "}
                                            {b.CapacityAdult + b.CapacityKid + b.CapacityBaby}
                                        </p>
                                        <p>
                                            <strong>Departure:</strong>{" "}
                                            {new Date(b.DepartureDate).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Arrival:</strong>{" "}
                                            {new Date(b.ArrivalDate).toLocaleDateString()}
                                        </p>
                                        <p>
                                            <strong>Total Payment:</strong>{" "}
                                            <span className="font-bold text-primary-700 text-lg">
                                                ${b.OrderTotal.toLocaleString()}
                                            </span>
                                        </p>
                                    </div>

                                    {/* SHOW PAYMENT DEADLINE FOR "Pending" */}
                                    {status === "Pending" && (
                                        <p className="text-red-600 text-sm mt-1">
                                            <strong>Pay before:</strong>{" "}
                                            {new Date(b.ExpireAt).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-4 px-6 pb-6 mt-2">

                                {/* ONLY SHOW "PAY NOW" IF PENDING + not expired */}
                                {status === "Pending" && (
                                    <Link
                                        to="/payment"
                                        state={{ booking: b }}
                                        className="px-5 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition shadow-sm"
                                    >
                                        Pay Now
                                    </Link>
                                )}

                                {/* ALWAYS allow viewing details */}
                                <Link
                                    to="/booking-detail"
                                    state={{ booking: b }}
                                    className="px-5 py-2 border rounded-lg bg-white hover:bg-neutral-100 transition font-semibold text-neutral-700 shadow-sm"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
