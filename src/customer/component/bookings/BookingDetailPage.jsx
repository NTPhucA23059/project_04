import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchBookingFull } from "../../../services/customer/bookingService";
import { submitRefundRequest, getRefundByBooking } from "../../../services/customer/refundService";
import BookingHeader from "./BookingHeader";
import BookingTourInfo from "./BookingTourInfo";
import BookingCustomerInfo from "./BookingCustomerInfo";
import BookingPassengers from "./BookingPassengers";
import BookingPaymentSummary from "./BookingPaymentSummary";
import CancelBookingModal from "./CancelBookingModal";
import api from "../../../services/api";
import { formatUSD } from "../../../utils/currency";

// Convert relative URL to absolute URL
const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}/${url.replace(/^\/+/, "")}`;
};

export default function BookingDetailPage() {
    const { state } = useLocation();
    const bookingFromState = state?.booking || state?.payload;

    const [booking, setBooking] = useState(bookingFromState || null);
    const [loading, setLoading] = useState(!bookingFromState);
    const [error, setError] = useState("");

    const [showCancelModal, setShowCancelModal] = useState(false);
    const [refundInfo, setRefundInfo] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [refund, setRefund] = useState(null); // Refund information if exists
    const [previousRefundStatus, setPreviousRefundStatus] = useState(null); // Track previous refund status for notification

    // Fetch booking full info if needed
    useEffect(() => {
        const load = async () => {
            const stateId = state?.bookingID || state?.id || bookingFromState?.bookingID || bookingFromState?.BookingID;

            // Check if we need to fetch full info
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
                const mappedBooking = mapFullToUI(full);
                setBooking(mappedBooking);

                // Fetch refund info if booking is refunded (orderStatus = 5) or has refund request
                // orderStatus = 5 means Refunded, but we should check for refund info in all cases
                try {
                    const refundData = await getRefundByBooking(mappedBooking.bookingID || mappedBooking.BookingID);
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
                setError(err.message || "Unable to load booking information.");
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
            TourImg: toAbsoluteUrl(tour?.tourImg) || "https://placehold.co/300x200",
            DepartureDate: td?.departureDate,
            ArrivalDate: td?.arrivalDate,
            CustomerName: full.customer?.customerName,
            CustomerPhone: full.customer?.customerPhone,
            CustomerEmail: full.customer?.customerEmail,
            CustomerCitizenCard: full.customer?.citizenCard,
        };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 lg:px-6">
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading booking...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                <div className="max-w-4xl mx-auto px-4 lg:px-6">
                    <div className="text-center py-20">
                        <p className="text-red-600">{error || "No booking data found."}</p>
                    </div>
                </div>
            </div>
        );
    }

    const now = Date.now();
    const departure = booking.DepartureDate ? new Date(booking.DepartureDate).getTime() : 0;
    const arrival = booking.ArrivalDate ? new Date(booking.ArrivalDate).getTime() : 0;

    // Status logic - Use orderStatus directly from backend
    // orderStatus là gì thì hiển thị đúng trạng thái đó
    const getStatus = () => {
        const orderStatus = booking.OrderStatus;
        
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

    const status = getStatus();

    // Cancel rule - Chỉ có thể hủy khi orderStatus = 1 (CONFIRMED - đã đặt thành công, chưa tới ngày đi)
    // orderStatus = 2 (đang đi) không hủy được
    const canCancel = booking.OrderStatus === 1; // Chỉ orderStatus = 1 mới hủy được

    // Refund calculation
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

    const navigate = useNavigate();
    const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

    // Poll for refund status updates if refund is pending
    useEffect(() => {
        if (!refund || refund.refundStatus !== 0) return;

        const pollInterval = setInterval(async () => {
            try {
                const bookingId = booking?.bookingID || booking?.BookingID;
                if (!bookingId) return;

                const refundData = await getRefundByBooking(bookingId);
                if (refundData && refundData.refundStatus === 1 && refund.refundStatus === 0) {
                    // Refund has been confirmed
                    window.dispatchEvent(new CustomEvent('toast', {
                        detail: {
                            type: 'success',
                            message: 'Your refund has been confirmed and processed!'
                        }
                    }));
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

    const handleSubmitRefund = async (bankInfo) => {
        if (!booking?.bookingID && !booking?.BookingID) {
            setToastMessage("Error: Booking ID not found.");
            return;
        }

        setIsSubmittingRefund(true);
        try {
            const refundRequest = {
                bookingID: booking.bookingID || booking.BookingID,
                bankName: bankInfo.bankName,
                bankAccount: bankInfo.accountNumber,
                accountHolder: bankInfo.accountHolder,
                note: refundInfo?.note || "",
            };

            const response = await submitRefundRequest(refundRequest);
            const refundData = response.data || response;

            // Navigate to refund success page
            navigate("/refund-success", {
                state: {
                    refund: refundData,
                    booking: booking,
                    bankInfo: response.bankInfo || {
                        bankName: bankInfo.bankName,
                        bankAccount: bankInfo.accountNumber,
                        accountHolder: bankInfo.accountHolder
                    }
                }
            });
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "Failed to submit refund request. Please try again.";
            setToastMessage(`❌ ${errorMessage}`);
        } finally {
            setIsSubmittingRefund(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 lg:px-6">
                <BookingHeader booking={booking} status={status} />

                <div className="bg-white border rounded-xl p-6 shadow-md space-y-6">
                    {/* Tour Info */}
                    <BookingTourInfo booking={booking} status={status} />

                    {/* Customer Info */}
                    <div className="border-t pt-6">
                        <BookingCustomerInfo booking={booking} />
                    </div>

                    {/* Passengers */}
                    <div className="border-t pt-6">
                        <BookingPassengers booking={booking} />
                    </div>

                    {/* Payment Summary */}
                    <div className="border-t pt-6">
                        <BookingPaymentSummary booking={booking} />
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
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Refund Status:</span>
                                        <span className="font-semibold text-red-700">Rejected</span>
                                    </div>
                                    {refund.refundReason && (
                                        <div className="pt-2 border-t border-red-200">
                                            <span className="text-gray-600">Reason:</span>
                                            <p className="text-gray-700 mt-1">{refund.refundReason}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Cancellation Reason */}
                    {status === "Auto Cancelled" && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation Information</h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-700">
                                    <strong>Reason:</strong> This booking was automatically cancelled due to expired payment deadline (24 hours for COD bookings).
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Refunded status - will be shown in Refund Information section above if refund exists */}

                    {/* Notes */}
                    {booking.OrderNote && (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Notes</h3>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                {booking.OrderNote}
                            </p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="border-t pt-6 space-y-3">
                        {status === "Pending Processing" && (
                            <Link
                                to="/payment"
                                state={{ booking }}
                                className="block w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-center rounded-xl font-semibold transition"
                            >
                                Pay Now
                            </Link>
                        )}

                        {canCancel && (
                            <button
                                type="button"
                                onClick={calculateRefund}
                                className="block w-full border-2 border-red-500 text-red-600 hover:bg-red-50 py-3 rounded-xl font-semibold transition"
                            >
                                Cancel Booking & Request Refund
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            <CancelBookingModal
                show={showCancelModal}
                refundInfo={refundInfo}
                bookingTotal={booking.OrderTotal}
                onClose={() => {
                    setShowCancelModal(false);
                    setRefundInfo(null);
                }}
                onSubmit={handleSubmitRefund}
                isSubmitting={isSubmittingRefund}
            />

            {/* Toast Message */}
            {toastMessage && (
                <div className="fixed top-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg z-50">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}

