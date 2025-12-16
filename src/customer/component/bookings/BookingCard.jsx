import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { CalendarIcon, CreditCardIcon, MapPinIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import api from "../../../services/api";

// Convert relative URL to absolute URL
const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}/${url.replace(/^\/+/, "")}`;
};

export default function BookingCard({ booking, status }) {
    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const getDaysUntilDeparture = () => {
        if (!booking.DepartureDate) return null;
        const departure = new Date(booking.DepartureDate).getTime();
        const now = Date.now();
        const diff = departure - now;
        if (diff <= 0) return null;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const getPaymentMethodLabel = (method) => {
        const map = {
            COD: "Cash on Delivery",
            MOMO: "MoMo Wallet",
            PAYPAL: "PayPal",
        };
        return map[method] || method || "N/A";
    };

    const daysUntilDeparture = getDaysUntilDeparture();

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 hover:shadow-xl transition overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start px-6 py-4 bg-neutral-50 border-b">
                <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-1">Booking Code</p>
                    <p className="font-bold text-xl mb-2">{booking.OrderCode}</p>
                    {booking.TourCode && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-gray-400">Tour Code:</span>
                            <span className="font-medium">{booking.TourCode}</span>
                        </div>
                    )}
                </div>
                <StatusBadge status={status} />
            </div>

            {/* Content */}
            <div className="flex flex-col md:flex-row gap-6 p-6">
                {/* Image */}
                <div className="w-full md:w-48">
                    <img
                        src={toAbsoluteUrl(booking.TourImg) || "https://placehold.co/300x200"}
                        alt={booking.TourName}
                        className="w-full h-40 md:h-full rounded-xl object-cover shadow-md border"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/300x200";
                        }}
                    />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-3">
                    <p className="font-semibold text-2xl text-neutral-900 leading-tight">
                        {booking.TourName}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-700">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-primary-600" />
                            <div>
                                <span className="text-gray-500">Departure:</span>{" "}
                                <span className="font-medium">{formatDate(booking.DepartureDate)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-primary-600" />
                            <div>
                                <span className="text-gray-500">Arrival:</span>{" "}
                                <span className="font-medium">{formatDate(booking.ArrivalDate)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CreditCardIcon className="w-4 h-4 text-primary-600" />
                            <div>
                                <span className="text-gray-500">Payment:</span>{" "}
                                <span className="font-medium">{getPaymentMethodLabel(booking.PaymentMethod)}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500">Guests:</span>{" "}
                            <span className="font-medium">
                                {booking.CapacityAdult + booking.CapacityKid + booking.CapacityBaby} 
                                {" "}({booking.CapacityAdult} Adult{booking.CapacityAdult !== 1 ? "s" : ""}
                                {booking.CapacityKid > 0 && `, ${booking.CapacityKid} Child${booking.CapacityKid !== 1 ? "ren" : ""}`}
                                {booking.CapacityBaby > 0 && `, ${booking.CapacityBaby} Infant${booking.CapacityBaby !== 1 ? "s" : ""}`})
                            </span>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 text-sm">Total Payment:</span>
                            <span className="font-bold text-primary-700 text-xl">
                                ${booking.OrderTotal.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Status-specific messages */}
                    {status === "Pending Processing" && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">
                                <strong>⚠️ Payment Required:</strong> Please pay before{" "}
                                {formatDateTime(booking.ExpireAt)} or your booking will be automatically cancelled.
                            </p>
                        </div>
                    )}

                    {status === "Confirmed" && daysUntilDeparture !== null && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-blue-700 text-sm flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                <span>
                                    <strong>Departure in {daysUntilDeparture} day{daysUntilDeparture !== 1 ? "s" : ""}!</strong> 
                                    {" "}Get ready for your amazing journey.
                                </span>
                            </p>
                        </div>
                    )}

                    {status === "On-going" && (
                        <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <p className="text-indigo-700 text-sm flex items-center gap-2">
                                <MapPinIcon className="w-4 h-4" />
                                <span>
                                    <strong>🎉 Tour is currently in progress!</strong> Enjoy your trip!
                                </span>
                            </p>
                        </div>
                    )}

                    {status === "Completed" && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-700 text-sm flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>
                                    <strong>✅ Tour completed!</strong> We hope you had a wonderful experience.
                                </span>
                            </p>
                        </div>
                    )}

                    {status === "Auto Cancelled" && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">
                                <strong>⚠️ Payment Expired:</strong> This booking was automatically cancelled due to missed payment deadline.
                            </p>
                        </div>
                    )}

                    {status === "Refunded" && (
                        <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <p className="text-purple-700 text-sm">
                                <strong>💰 Refund Processed:</strong> This booking has been cancelled and refunded.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 px-6 pb-6 mt-2">
                    {/* Only show "Pay Now" if Pending Processing + not expired */}
                {status === "Pending Processing" && (
                    <Link
                        to="/payment"
                        state={{ booking }}
                        className="px-5 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition shadow-sm"
                    >
                        Pay Now
                    </Link>
                )}

                {/* Always allow viewing details */}
                <Link
                    to="/booking-detail"
                    state={{ booking }}
                    className="px-5 py-2 border rounded-lg bg-white hover:bg-neutral-100 transition font-semibold text-neutral-700 shadow-sm"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}

