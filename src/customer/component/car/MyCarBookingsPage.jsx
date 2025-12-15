import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../component/tour/StatusBadge";
import { getCurrentUser } from "../../../services/common/authService";
import { fetchCarBookingsByAccount, fetchCarBookingFull } from "../../../services/customer/carBookingService";

export default function MyCarBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const now = Date.now();

    useEffect(() => {
        const load = async () => {
            const user = getCurrentUser();
            const accountID = user?.accountID || user?.AccountID;
            if (!accountID) {
                setError("Please log in to view your car bookings.");
                return;
            }
            setLoading(true);
            setError("");
            try {
                const res = await fetchCarBookingsByAccount({ page: 0, size: 20, accountID });
                const items = res.items || [];
                const fullList = await Promise.all(
                    items.map(async (b) => {
                        try {
                            const full = await fetchCarBookingFull(b.carBookingID);
                            return mapFullToUI(full);
                        } catch {
                            return mapBasicToUI(b);
                        }
                    })
                );
                setBookings(fullList);
            } catch (err) {
                setError(err.message || "Unable to load car bookings.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const mapBasicToUI = (b) => ({
        carBookingID: b.carBookingID,
        BookingCode: b.bookingCode,
        PaymentStatus: b.paymentStatus === 1 ? "Paid" : "Pending",
        BookingStatus: b.bookingStatus,
        CancelDeadline: b.cancelDeadline,
        PickupDate: b.pickupDate,
        DropoffDate: b.dropoffDate,
        PickupTime: "",
        DropoffTime: "",
        CarName: "Car",
        CarImageUrl: "/car.png",
        FinalTotal: Number(b.finalTotal ?? 0),
    });

    const mapFullToUI = (full) => {
        const b = full.booking;
        const car = full.car;
        return {
            carBookingID: b.carBookingID,
            BookingCode: b.bookingCode,
            PaymentStatus: b.paymentStatus === 1 ? "Paid" : "Pending",
            BookingStatus: b.bookingStatus,
            CancelDeadline: b.cancelDeadline,
            PickupDate: b.pickupDate,
            DropoffDate: b.dropoffDate,
            PickupTime: "",
            DropoffTime: "",
            CarName: car?.modelName || "Car",
            CarImageUrl: car?.image || car?.carImg || "/car.png",
            FinalTotal: Number(b.finalTotal ?? 0),
        };
    };

    const getStatus = (b) => {
        const pickup = b.PickupDate ? new Date(b.PickupDate).getTime() : 0;
        const drop = b.DropoffDate ? new Date(b.DropoffDate).getTime() : 0;

        if (b.PaymentStatus === "Paid") {
            return now > drop ? "Completed" : "Paid";
        }

        if (b.PaymentStatus === "Pending") {
            const expire = b.CancelDeadline ? new Date(b.CancelDeadline).getTime() : 0;
            return now > expire ? "Expired" : "Pending";
        }

        if (b.BookingStatus === 3) return "Cancelled";
        return "Pending";
    };

    return (
        <div className="px-4 py-12 mt-20">
            <h1 className="text-4xl font-bold mb-10 text-neutral-800">My Car Bookings</h1>

            {error && <p className="text-red-600 text-lg">{error}</p>}
            {loading && <p className="text-gray-500 text-lg">Loading...</p>}

            {!loading && !error && bookings.length === 0 && (
                <p className="text-gray-500 text-lg">You have no car bookings.</p>
            )}

            <div className="space-y-8">
                {bookings.map((b) => {
                    const status = getStatus(b);

                    return (
                        <div
                            key={b.CarBookingID}
                            className="bg-white rounded-2xl border shadow hover:shadow-lg transition"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center px-6 py-4 bg-neutral-50 border-b">
                                <div>
                                    <p className="text-xs text-gray-400">Booking Code</p>
                                    <p className="font-bold text-xl">{b.BookingCode}</p>
                                </div>
                                <StatusBadge status={status} />
                            </div>

                            {/* Body */}
                            <div className="p-6 flex flex-col md:flex-row gap-6">
                                <img
                                    src={b.CarImageUrl || "/car.png"}
                                    className="w-40 h-32 rounded-xl object-cover border shadow"
                                />

                                <div className="flex-1 text-sm space-y-2">
                                    <p className="text-xl font-bold">{b.CarName}</p>

                                    <p>
                                        <strong>Pickup:</strong>{" "}
                                        {new Date(b.PickupDate).toLocaleDateString()}{" "}
                                        {b.PickupTime}
                                    </p>

                                    <p>
                                        <strong>Dropoff:</strong>{" "}
                                        {new Date(b.DropoffDate).toLocaleDateString()}{" "}
                                        {b.DropoffTime}
                                    </p>

                                    <p>
                                        <strong>Total:</strong>{" "}
                                        <span className="font-bold text-primary-700 text-lg">
                                            ${b.FinalTotal.toLocaleString()}
                                        </span>
                                    </p>

                                    {status === "Pending" && (
                                        <p className="text-sm text-red-600">
                                            Pay before:{" "}
                                            {new Date(b.CancelDeadline).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-4 px-6 pb-6">
                                {status === "Pending" && (
                                    <Link
                                        to="/car-payment"
                                        state={{ booking: b }}
                                        className="px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        Pay Now
                                    </Link>
                                )}

                                <Link
                                    to="/car-booking-detail"
                                    state={{ booking: b }}
                                    className="px-5 py-2 border rounded-lg hover:bg-neutral-100"
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
