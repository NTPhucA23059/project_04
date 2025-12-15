import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import StatusBadge from "../../component/tour/StatusBadge";
import { fetchBookingFull } from "../../../services/customer/bookingService";

export default function BookingDetailPage() {
    const { state } = useLocation();
    const bookingFromState = state?.booking || state?.payload;

    const [booking, setBooking] = useState(bookingFromState || null);
    const [loading, setLoading] = useState(!bookingFromState);
    const [error, setError] = useState("");

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [refundInfo, setRefundInfo] = useState(null);
    const [toastMessage, setToastMessage] = useState("");

    // Nếu có bookingID truyền kèm, fetch full
    useEffect(() => {
        const load = async () => {
            const stateId = state?.bookingID || state?.id || bookingFromState?.bookingID || bookingFromState?.BookingID;

            // Nếu đã có booking từ state nhưng thiếu thông tin quan trọng, vẫn fetch full
            const needFetchFull =
                !bookingFromState ||
                !bookingFromState.UnitPrice ||
                !bookingFromState.CustomerName ||
                !bookingFromState.DepartureDate ||
                !bookingFromState.ArrivalDate;

            if (!needFetchFull && bookingFromState) {
                setBooking(bookingFromState);
                setLoading(false);
                return;
            }

            if (!stateId) {
                setError("No booking data found.");
                setLoading(false);
                return;
            }

            try {
                const full = await fetchBookingFull(stateId);
                setBooking(mapFullToUI(full));
            } catch (err) {
                setError(err.message || "Không thể tải thông tin booking.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [bookingFromState, state]);

    const mapFullToUI = (full) => {
        const b = full.booking;
        const td = full.tourDetail;
        const tour = full.tour;
        return {
            ...b,
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
            UnitPrice: Number(b.unitPrice ?? 0),
            TourName: tour?.tourName || "Tour",
            TourImg: tour?.tourImg || "https://placehold.co/300x200",
            DepartureDate: td?.departureDate,
            ArrivalDate: td?.arrivalDate,
            CustomerName: full.customer?.customerName,
            CustomerPhone: full.customer?.customerPhone,
            CustomerEmail: full.customer?.customerEmail,
            CustomerCitizenCard: full.customer?.citizenCard,
        };
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading booking...</div>;
    }

    if (error || !booking) {
        return <div className="text-center py-20 text-gray-500">{error || "No booking data found."}</div>;
    }

    const now = Date.now();
    const departure = booking.DepartureDate ? new Date(booking.DepartureDate).getTime() : 0;
    const arrival = booking.ArrivalDate ? new Date(booking.ArrivalDate).getTime() : 0;

    // ==========================
    // STATUS LOGIC CHUẨN
    // ==========================
    const getStatus = () => {
        if (booking.OrderStatus === 3) return "Cancelled";

        if (booking.PaymentStatus === "Paid") {
            if (now > arrival) return "Completed";
            return "Paid";
        }

        if (booking.PaymentStatus === "Pending") {
            if (now > new Date(booking.ExpireAt).getTime()) return "Expired";
            return "Pending";
        }

        return "Pending";
    };

    const status = getStatus();

    // ==========================
    // CANCEL RULE
    // ==========================
    const canCancel =
        booking.PaymentStatus === "Paid" &&
        now < departure &&
        status !== "Cancelled";

    // ==========================
    // PRICE
    // ==========================
    const priceAdult = booking.UnitPrice;
    const priceChild = Math.round(priceAdult * 0.7);
    const priceInfant = Math.round(priceAdult * 0.3);

    const subAdult = priceAdult * booking.CapacityAdult;
    const subChild = priceChild * booking.CapacityKid;
    const subInfant = priceInfant * booking.CapacityBaby;

    // ==========================
    // REFUND CALCULATION
    // ==========================
    const calculateRefund = () => {
        const daysBefore = Math.ceil((departure - now) / (1000 * 60 * 60 * 24));

        let rate = 0;
        if (daysBefore >= 5) rate = 0.95;
        else if (daysBefore === 4) rate = 0.9;
        else if (daysBefore === 3) rate = 0.85;
        else if (daysBefore === 2) rate = 0.8;
        else if (daysBefore === 1) rate = 0.75;
        else rate = 0;

        setRefundInfo({
            daysBefore,
            rate,
            refundAmount: Math.round(booking.OrderTotal * rate),
        });

        setShowCancelModal(true);
    };

    const handleSubmitRefund = () => {
        const bank = document.getElementById("refundBank").value.trim();
        const acc = document.getElementById("refundAccount").value.trim();
        const holder = document.getElementById("refundHolder").value.trim();

        if (!bank || !acc || !holder) {
            setToastMessage("Please fill in all bank details.");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }

        setToastMessage("Your cancellation request has been submitted.");
        setTimeout(() => setToastMessage(""), 4000);
        setShowCancelModal(false);
    };

    return (
        <div className="px-4 py-14 mt-10">
            <Link to="/my-tour-bookings" className="text-primary-700 underline">
                ← Back to My Bookings
            </Link>

            <div className="mt-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Booking Details</h1>
                <StatusBadge status={status} />
            </div>

            <p className="mt-2 text-gray-500">
                Booking Code: <strong>{booking.OrderCode}</strong>
            </p>

            {/* CARD */}
            <div className="mt-6 border rounded-xl p-6 shadow-md bg-white space-y-6">

                {/* TOP INFO */}
                <div className="flex gap-4">
                    <img
                        src={booking.TourImg}
                        className="w-32 h-32 rounded-lg object-cover"
                    />

                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{booking.TourName}</h2>

                        <p className="text-sm text-gray-600 mt-2">
                            <strong>Departure:</strong> {new Date(booking.DepartureDate).toLocaleDateString()}
                        </p>

                        <p className="text-sm text-gray-600">
                            <strong>Arrival:</strong> {new Date(booking.ArrivalDate).toLocaleDateString()}
                        </p>

                        <p className="text-sm text-gray-700 mt-2">
                            {status === "Pending" && `Pay before: ${new Date(booking.ExpireAt).toLocaleString()}`}
                            {status === "Paid" && "Payment completed"}
                            {status === "Completed" && "Tour completed"}
                            {status === "Expired" && "Payment expired"}
                            {status === "Cancelled" && "Booking cancelled"}
                            {status === "Refunded" && "Refund processed"}
                        </p>
                    </div>
                </div>

                {/* CUSTOMER INFO */}
                <div className="space-y-1 text-sm text-gray-700">
                    <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                    <p><strong>Name:</strong> {booking.CustomerName}</p>
                    <p><strong>Phone:</strong> {booking.CustomerPhone}</p>
                    <p><strong>Email:</strong> {booking.CustomerEmail}</p>
                    <p><strong>Citizen ID:</strong> {booking.CustomerCitizenCard}</p>
                </div>

                {/* PASSENGERS */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Passengers</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Adult: {booking.CapacityAdult}</li>
                        {booking.CapacityKid > 0 && <li>• Child: {booking.CapacityKid}</li>}
                        {booking.CapacityBaby > 0 && <li>• Infant: {booking.CapacityBaby}</li>}
                    </ul>
                </div>

                {/* PAYMENT SUMMARY */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Payment Summary</h3>

                    <div className="border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 text-gray-700">
                                <tr>
                                    <th className="p-3 text-left">Passenger</th>
                                    <th className="p-3 text-right">Price</th>
                                    <th className="p-3 text-right">Qty</th>
                                    <th className="p-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-t">
                                    <td className="p-3">Adult</td>
                                    <td className="p-3 text-right">${priceAdult}</td>
                                    <td className="p-3 text-right">{booking.CapacityAdult}</td>
                                    <td className="p-3 text-right font-semibold">${subAdult}</td>
                                </tr>

                                {booking.CapacityKid > 0 && (
                                    <tr className="border-t">
                                        <td className="p-3">Child</td>
                                        <td className="p-3 text-right">${priceChild}</td>
                                        <td className="p-3 text-right">{booking.CapacityKid}</td>
                                        <td className="p-3 text-right font-semibold">${subChild}</td>
                                    </tr>
                                )}

                                {booking.CapacityBaby > 0 && (
                                    <tr className="border-t">
                                        <td className="p-3">Infant</td>
                                        <td className="p-3 text-right">${priceInfant}</td>
                                        <td className="p-3 text-right">{booking.CapacityBaby}</td>
                                        <td className="p-3 text-right font-semibold">${subInfant}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-3 text-right font-bold text-primary-700 text-lg">
                        Total: ${booking.OrderTotal}
                    </div>
                </div>

                {/* NOTES */}
                {booking.OrderNote && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Notes</h3>
                        <p className="text-sm text-gray-700">{booking.OrderNote}</p>
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="space-y-3">
                    {status === "Pending" && (
                        <Link
                            to="/payment"
                            state={{ booking }}
                            className="block w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-center rounded-xl font-semibold"
                        >
                            Pay Now
                        </Link>
                    )}

                    {canCancel && (
                        <button
                            type="button"
                            onClick={calculateRefund}
                            className="block w-full border border-red-500 text-red-600 hover:bg-red-50 py-3 rounded-xl font-semibold transition"
                        >
                            Cancel Booking
                        </button>
                    )}
                </div>
            </div>

            {/* CANCEL MODAL */}
            {showCancelModal && refundInfo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-xl mx-4 p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Refund Request</h2>

                        <div className="bg-gray-50 p-4 rounded-lg border">
                            <p><strong>Days before departure:</strong> {refundInfo.daysBefore}</p>
                            <p><strong>Refund rate:</strong> {refundInfo.rate * 100}%</p>
                            <p className="font-bold text-green-700 mt-3">
                                Refund Amount: ${refundInfo.refundAmount}
                            </p>
                        </div>

                        <div className="mt-4">
                            <h3 className="text-lg font-semibold">Bank Information</h3>
                            <div className="space-y-3 mt-2">
                                <input id="refundBank" className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Bank Name (e.g., Vietcombank)" />
                                <input id="refundAccount" className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Account Number" />
                                <input id="refundHolder" className="w-full px-3 py-2 border rounded-lg"
                                    placeholder="Account Holder Name" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 rounded-lg border"
                            >
                                Close
                            </button>

                            <button
                                onClick={handleSubmitRefund}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toastMessage && (
                <div className="fixed top-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
