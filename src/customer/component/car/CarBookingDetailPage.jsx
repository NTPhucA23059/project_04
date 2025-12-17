import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatUSD } from "../../../utils/currency";
import StatusBadge from "../bookings/StatusBadge";
import { refundRules } from "../../component/data/mockData";
import { fetchCarBookingFull, createReview } from "../../../services/customer/carBookingService";
import { getCarBookingRefund } from "../../../services/customer/refundService";

export default function CarBookingDetailPage() {
    const { state } = useLocation();
    const bookingFromState = state?.booking;

    const [booking, setBooking] = useState(bookingFromState || null);
    const [loading, setLoading] = useState(!bookingFromState);
    const [error, setError] = useState("");

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [refundInfo, setRefundInfo] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [review, setReview] = useState({ rating: 5, comment: "" });
    const [refund, setRefund] = useState(null); // Refund information if exists
    const [previousRefundStatus, setPreviousRefundStatus] = useState(null); // Track previous refund status for notification

    useEffect(() => {
        const load = async () => {
            const id = state?.carBookingID || state?.id || bookingFromState?.carBookingID;
            const needFetch =
                !bookingFromState ||
                !bookingFromState.BaseAmount ||
                !bookingFromState.CarName ||
                !bookingFromState.PickupDate ||
                !bookingFromState.CustomerName;

            if (!needFetch && bookingFromState) {
                setBooking(bookingFromState);
                setLoading(false);
                return;
            }

            if (!id) {
                setError("No booking data found.");
                setLoading(false);
                return;
            }

            try {
                const full = await fetchCarBookingFull(id);
                const mappedBooking = mapFullToUI(full);
                setBooking(mappedBooking);

                // Fetch refund info for car booking
                try {
                    const refundData = await getCarBookingRefund(mappedBooking.carBookingID);
                    if (refundData) {
                        // Check if refund status changed from pending (0) to processed (1)
                        if (previousRefundStatus === 0 && refundData.refundStatus === 1) {
                            // Show notification that refund has been confirmed
                            window.dispatchEvent(new CustomEvent('toast', {
                                detail: {
                                    type: 'success',
                                    message: 'Your refund has been confirmed and processed!'
                                }
                            }));
                        }
                        setPreviousRefundStatus(refundData.refundStatus);
                        setRefund(refundData);
                    } else {
                        setPreviousRefundStatus(null);
                    }
                } catch (refundErr) {
                    // No refund found - might be auto-cancelled or no refund request
                    setRefund(null);
                    setPreviousRefundStatus(null);
                }
            } catch (err) {
                setError(err.message || "Cannot load car booking.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [bookingFromState, state]);

    const mapFullToUI = (full) => {
        const b = full.booking;
        const c = full.car;
        const customer = full.customer;
        return {
            carBookingID: b.carBookingID,
            BookingCode: b.bookingCode,
            BookingStatus: b.bookingStatus,
            PaymentStatus: b.paymentStatus === 1 ? "Paid" : "Pending",
            PaymentMethod: b.paymentMethod,
            CancelDeadline: b.cancelDeadline,
            PickupDate: b.pickupDate,
            DropoffDate: b.dropoffDate,
            PickupTime: "",
            DropoffTime: "",
            BaseAmount: Number(b.baseAmount ?? 0),
            FinalTotal: Number(b.finalTotal ?? 0),
            CarName: c?.modelName || c?.brand || "Car",
            CarImage: c?.image || c?.carImg || "/car.png",
            CustomerName: customer?.customerName,
            CustomerPhone: customer?.customerPhone,
            CustomerEmail: customer?.customerEmail,
            CustomerCitizenCard: customer?.citizenCard,
        };
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading car booking...</div>;
    }

    if (error || !booking) {
        return (
            <div className="text-center py-20 text-gray-500">
                {error || "No booking data found."}
            </div>
        );
    }

    // ===========================================
    // DATETIME PARSE
    // ===========================================
    const pickupDateTime = booking.PickupDate ? new Date(booking.PickupDate).getTime() : 0;
    const dropoffDateTime = booking.DropoffDate ? new Date(booking.DropoffDate).getTime() : 0;
    const now = Date.now();

    // ===========================================
    // BOOKING STATUS
    // ===========================================
    const getStatus = () => {
        if (booking.BookingStatus === 4 || booking.RefundApplied) return "Refunded";
        if (booking.BookingStatus === 3) return "Cancelled";

        if (booking.PaymentStatus === "Paid") {
            return now > dropoffDateTime ? "Completed" : "Paid";
        }

        if (booking.PaymentStatus === "Pending") {
            // Thanh toán tại quầy → expire sau 24h
            if (booking.PaymentMethod === "OFFICE" && booking.CancelDeadline && now > new Date(booking.CancelDeadline).getTime()) {
                return "Expired";
            }
            return "Pending";
        }

        return "Pending";
    };

    const status = getStatus();

    // ===========================================
    // CAN CANCEL ?
    // ===========================================
    const showCancelButton =
        booking.PaymentStatus === "Paid" &&
        now < pickupDateTime &&
        booking.BookingStatus !== 3 &&
        booking.BookingStatus !== 4 &&
        booking.RefundApplied === false &&
        (!booking.CancelDeadline || now < new Date(booking.CancelDeadline).getTime());

    // ===========================================
    // REFUND CALCULATION
    // ===========================================
    const calculateRefund = () => {
        const daysBefore = Math.ceil((pickupDateTime - now) / (1000 * 60 * 60 * 24));

        const matchedRule = refundRules.find(
            r => daysBefore >= r.MinDaysBefore && daysBefore <= r.MaxDaysBefore
        );

        const rate = matchedRule ? matchedRule.RefundPercentage / 100 : 0;

        setRefundInfo({
            daysBefore,
            rate,
            percent: rate * 100,
            refundAmount: Math.round(booking.BaseAmount * rate)
        });

        setShowCancelModal(true);
    };

    // ===========================================
    // REVIEW HANDLER (UI only)
    // ===========================================
    const handleSubmitReview = async () => {
        if (!review.rating || review.rating < 1 || review.rating > 5) {
            setToastMessage("Please select a rating 1-5");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }
        if (!review.comment.trim()) {
            setToastMessage("Please enter your feedback");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }
        try {
            await createReview({
                accountID: booking.accountID || booking.AccountID || 1,
                carBookingID: booking.carBookingID || booking.CarBookingID,
                rating: review.rating,
                comment: review.comment.trim(),
            });
            setToastMessage("Thanks for your review!");
        } catch (err) {
            setToastMessage(err.message || "Cannot submit review");
        } finally {
            setTimeout(() => setToastMessage(""), 3000);
            setShowReviewModal(false);
        }
    };

    // ===========================================
    // POLL FOR REFUND STATUS UPDATES
    // ===========================================
    useEffect(() => {
        if (!refund || refund.refundStatus !== 0 || !booking) return;

        const bookingId = booking?.carBookingID;
        if (!bookingId) return;

        const pollInterval = setInterval(async () => {
            try {
                const refundData = await getCarBookingRefund(bookingId);
                if (refundData && refundData.refundStatus === 1 && refund.refundStatus === 0) {
                    // Refund has been confirmed
                    window.dispatchEvent(new CustomEvent('toast', {
                        detail: {
                            type: 'success',
                            message: 'Your refund has been confirmed and processed!'
                        }
                    }));
                    setPreviousRefundStatus(1);
                    setRefund(refundData);
                    clearInterval(pollInterval);
                }
            } catch (err) {
                // Ignore errors during polling
                console.error('Error polling refund status:', err);
            }
        }, 10000); // Poll every 10 seconds

        return () => clearInterval(pollInterval);
    }, [refund, booking]);

    // ===========================================
    // SUBMIT REFUND REQUEST
    // ===========================================
    const handleSubmitRefund = () => {
        const bank = document.getElementById("refundBank").value.trim();
        const acc = document.getElementById("refundAccount").value.trim();
        const holder = document.getElementById("refundHolder").value.trim();

        if (!bank || !acc || !holder) {
            setToastMessage("Please fill in all bank details.");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }

        setToastMessage("Your refund request has been submitted.");
        setTimeout(() => setToastMessage(""), 3000);

        setShowCancelModal(false);
    };

    return (
        <div className="px-4 py-14 mt-10">
                    <Link to="/my-car-bookings" className="text-primary-700 underline">
                        ← Back to My Car Bookings
                    </Link>

            {/* HEADER */}
            <div className="mt-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">Car Booking Details</h1>
                <StatusBadge status={status} />
            </div>

            <p className="mt-2 text-gray-500">
                Booking Code: <strong>{booking.BookingCode}</strong>
            </p>

            <div className="mt-6 border rounded-xl p-6 shadow-md bg-white space-y-6">
                {/* CAR INFO */}
                <div className="flex gap-4">
                    <img
                        src={booking.CarImage}
                        className="w-32 h-32 rounded-lg object-cover"
                        alt=""
                    />
                    <div className="flex-1">
                        <h2 className="text-xl font-bold">{booking.CarName}</h2>

                        <p className="text-sm text-gray-600 mt-2">
                            <strong>Pickup:</strong>{" "}
                            {booking.PickupDate} {booking.PickupTime}
                        </p>

                        <p className="text-sm text-gray-600">
                            <strong>Drop-off:</strong>{" "}
                            {booking.DropoffDate} {booking.DropoffTime}
                        </p>

                        <p className="text-sm text-gray-700 mt-2">
                            {status === "Pending" && booking.PaymentMethod === "OFFICE" &&
                                `Pay at office before: ${new Date(booking.CancelDeadline).toLocaleString()}`}
                            {status === "Paid" && "Payment completed"}
                            {status === "Completed" && "Trip completed"}
                            {status === "Expired" && "Payment expired"}
                            {status === "Cancelled" && "Booking cancelled"}
                            {status === "Refunded" && "Refund processed"}
                        </p>
                    </div>
                </div>

                {/* CUSTOMER INFO */}
                <div>
                    <h3 className="text-lg font-semibold mb-2">Customer Information</h3>
                    <p><strong>Name:</strong> {booking.CustomerName}</p>
                    <p><strong>Phone:</strong> {booking.CustomerPhone}</p>
                    <p><strong>Email:</strong> {booking.CustomerEmail}</p>
                    <p><strong>Citizen ID:</strong> {booking.CustomerCitizenCard}</p>
                </div>

                {/* PAYMENT INFO */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Payment Summary</h3>

                    <div className="border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <tbody>
                                <tr className="border-t">
                                    <td className="p-3">Base Amount</td>
                                    <td className="p-3 text-right">{formatUSD(booking.BaseAmount)}</td>
                                </tr>

                                {booking.HasLateReturn && (
                                    <tr className="border-t">
                                        <td className="p-3">Late Fee</td>
                                        <td className="p-3 text-right text-red-600">
                                            + {formatUSD(booking.LateFee)}
                                        </td>
                                    </tr>
                                )}

                                {booking.HasExtraKM && (
                                    <tr className="border-t">
                                        <td className="p-3">Extra KM Fee</td>
                                        <td className="p-3 text-right text-red-600">
                                            + {formatUSD(booking.ExtraKMFee)}
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            <tfoot>
                                <tr className="border-t bg-primary-50">
                                    <td className="p-3 font-bold">Final Total</td>
                                    <td className="p-3 text-right font-bold text-primary-700 text-lg">
                                        {formatUSD(booking.FinalTotal)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Refund Information */}
                {refund && (
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Information</h3>
                        {refund.refundStatus === 0 ? (
                            // Pending confirmation - Waiting for staff confirmation
                            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold text-yellow-800 text-base">
                                        Waiting for Staff Confirmation
                                    </span>
                                </div>
                                <p className="text-sm text-yellow-700">
                                    Your refund request is being processed. Staff will confirm and process the refund as soon as possible.
                                </p>
                                <div className="pt-2 border-t border-yellow-200 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Refund Percentage:</span>
                                        <span className="font-semibold">{refund.refundPercentage}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Expected Refund Amount:</span>
                                        <span className="font-bold text-green-700">
                                            {formatUSD(refund.refundAmount || 0)}
                                        </span>
                                    </div>
                                    {refund.cancelDate && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Request Date:</span>
                                            <span className="font-medium">
                                                {new Date(refund.cancelDate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : refund.refundStatus === 1 ? (
                            // Confirmed refund - Show reason
                            <div className="bg-green-50 border border-green-300 rounded-lg p-4 space-y-3">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold text-green-800 text-base">
                                        Refund Processed
                                    </span>
                                </div>
                                {refund.refundReason && (
                                    <div className="bg-white rounded-lg p-3 border border-green-200">
                                        <p className="text-sm font-medium text-gray-700 mb-1">Refund Reason:</p>
                                        <p className="text-sm text-gray-800">{refund.refundReason}</p>
                                    </div>
                                )}
                                <div className="pt-2 border-t border-green-200 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Refund Percentage:</span>
                                        <span className="font-semibold">{refund.refundPercentage}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Refund Amount:</span>
                                        <span className="font-bold text-green-700 text-lg">
                                            {formatUSD(refund.refundAmount || 0)}
                                        </span>
                                    </div>
                                    {refund.cancelDate && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Request Date:</span>
                                            <span className="font-medium">
                                                {new Date(refund.cancelDate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                    {refund.processedDate && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Processed Date:</span>
                                            <span className="font-medium">
                                                {new Date(refund.processedDate).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            // Rejected or other status
                            <div className="bg-red-50 border border-red-300 rounded-lg p-4 space-y-2 text-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="font-semibold text-red-800">Refund Rejected</span>
                                </div>
                                {refund.refundReason && (
                                    <div className="bg-white rounded-lg p-3 border border-red-200">
                                        <p className="text-xs font-medium text-gray-700 mb-1">Reason:</p>
                                        <p className="text-sm text-gray-800">{refund.refundReason}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* NOTES */}
                {booking.Notes && (
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Notes</h3>
                        <p className="text-sm text-gray-700">{booking.Notes}</p>
                    </div>
                )}

                {/* ACTION BUTTONS */}
                <div className="space-y-3">
                    {status === "Pending" && booking.PaymentMethod === "OFFICE" && (
                        <Link
                            to="/payment"
                            state={{ booking }}
                            className="w-full block bg-primary-600 hover:bg-primary-700 text-white text-center py-3 rounded-xl font-semibold transition"
                        >
                            Pay Now
                        </Link>
                    )}

                    {showCancelButton && (
                        <button
                            type="button"
                            onClick={calculateRefund}
                            className="block w-full border border-red-500 text-red-600 hover:bg-red-50 text-center py-3 rounded-xl font-semibold transition"
                        >
                            Cancel Booking
                        </button>
                    )}

                    {status === "Completed" && (
                        <button
                            type="button"
                            onClick={() => setShowReviewModal(true)}
                            className="block w-full border border-primary-500 text-primary-600 hover:bg-primary-50 text-center py-3 rounded-xl font-semibold transition"
                        >
                            Review Service
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
                            <p><strong>Days before pickup:</strong> {refundInfo.daysBefore}</p>
                            <p><strong>Refund Rate:</strong> {refundInfo.percent}%</p>
                            <p className="text-md font-bold text-green-700 mt-3">
                                Refund Amount: {formatUSD(refundInfo.refundAmount)}
                            </p>
                        </div>

                        {/* BANK FORM */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold mb-2">Bank Information</h3>

                            <div className="space-y-3">
                                <input id="refundBank" className="w-full px-3 py-2 border rounded-lg" placeholder="Bank Name" />
                                <input id="refundAccount" className="w-full px-3 py-2 border rounded-lg" placeholder="Account Number" />
                                <input id="refundHolder" className="w-full px-3 py-2 border rounded-lg" placeholder="Account Holder Name" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>

                            <button
                                onClick={handleSubmitRefund}
                                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* REVIEW MODAL */}
            {showReviewModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-xl mx-4 p-6 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-4">Review Service</h2>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-semibold">Rating</label>
                                <select
                                    className="w-full border px-3 py-2 rounded"
                                    value={review.rating}
                                    onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
                                >
                                    {[5, 4, 3, 2, 1].map((r) => (
                                        <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm font-semibold">Comment</label>
                                <textarea
                                    className="w-full border px-3 py-2 rounded"
                                    rows={4}
                                    value={review.comment}
                                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                    placeholder="Share your experience..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowReviewModal(false)}
                                className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {toastMessage && (
                <div className="
                    fixed top-6 right-6 z-[9999]
                    bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg
                    animate-slide-in
                ">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}
