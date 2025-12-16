import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

export default function BookingHeader({ booking, status }) {
    return (
        <div className="mb-6">
            <Link 
                to="/my-tour-bookings" 
                className="text-primary-700 hover:text-primary-800 underline inline-flex items-center gap-1 mb-4"
            >
                ← Back to My Bookings
            </Link>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
                    <p className="mt-2 text-gray-500">
                        Booking Code: <strong className="text-gray-900">{booking.OrderCode}</strong>
                    </p>
                </div>
                <StatusBadge status={status} />
            </div>
        </div>
    );
}

