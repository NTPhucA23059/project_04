import { CalendarIcon, MapPinIcon } from "@heroicons/react/24/outline";
import api from "../../../services/api";

// Convert relative URL to absolute URL
const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}/${url.replace(/^\/+/, "")}`;
};

export default function BookingTourInfo({ booking, status }) {
    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
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

    const getStatusMessage = () => {
        switch (status) {
            case "Pending":
                return `Pay before: ${formatDateTime(booking.ExpireAt)}`;
            case "Paid":
                return "Payment completed";
            case "Completed":
                return "Tour completed";
            case "Expired":
                return "Payment expired";
            case "Cancelled":
                return "Booking cancelled";
            case "Refunded":
                return "Refund processed";
            default:
                return "";
        }
    };

    return (
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <img
                src={toAbsoluteUrl(booking.TourImg) || "https://placehold.co/300x200"}
                alt={booking.TourName}
                className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/300x200";
                }}
            />

            <div className="flex-1 space-y-2">
                <h2 className="text-xl font-bold text-gray-900">{booking.TourName}</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary-600" />
                        <span><strong>Departure:</strong> {formatDate(booking.DepartureDate)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-primary-600" />
                        <span><strong>Arrival:</strong> {formatDate(booking.ArrivalDate)}</span>
                    </div>
                </div>

                <p className="text-sm text-gray-700 mt-2">
                    {getStatusMessage()}
                </p>
            </div>
        </div>
    );
}

