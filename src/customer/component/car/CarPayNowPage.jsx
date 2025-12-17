import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../../../services/api";

export default function CarPayNowPage() {
    const { state } = useLocation();
    const booking = state?.booking;
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState("MOMO");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!booking) {
        return <div className="text-center py-20 text-gray-500">No booking found.</div>;
    }

    const handlePayment = async () => {
        setLoading(true);
        setError("");
        try {
            await api.post(`/customer/car-bookings/${booking.carBookingID}/pay`, null, {
                params: { paymentMethod }
            });
            navigate("/car-booking-success", { state: { booking } });
        } catch (err) {
            setError(err.response?.data?.message || "Payment failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-4 py-14 mt-10">
            <h1 className="text-3xl font-bold mb-6">Car Payment</h1>

            {/* BOOKING SUMMARY */}
            <div className="border bg-white rounded-xl p-6 shadow-md space-y-4 mb-8">
                <h2 className="text-xl font-semibold">Booking Summary</h2>

                <p><strong>Booking Code:</strong> {booking.BookingCode}</p>
                <p><strong>Car:</strong> {booking.CarName}</p>
                <p><strong>Pickup:</strong> {new Date(booking.PickupDate).toLocaleDateString()}</p>
                <p><strong>Dropoff:</strong> {new Date(booking.DropoffDate).toLocaleDateString()}</p>

                <p className="text-lg font-bold text-primary-700">
                    Total: {formatUSD(booking.FinalTotal)}
                </p>
            </div>

            {/* PAYMENT METHODS */}
            <div className="border bg-white rounded-xl p-6 shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <div className="space-y-2">
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="MOMO"
                            checked={paymentMethod === "MOMO"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-2"
                        />
                        MoMo
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="BANK"
                            checked={paymentMethod === "BANK"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-2"
                        />
                        Bank Transfer
                    </label>
                    <label className="flex items-center">
                        <input
                            type="radio"
                            value="CASH"
                            checked={paymentMethod === "CASH"}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mr-2"
                        />
                        Cash on Delivery
                    </label>
                </div>
            </div>

            {error && <p className="text-red-600 mb-4">{error}</p>}

            {/* PAY BUTTON */}
            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
                {loading ? "Processing..." : `Pay ${formatUSD(booking.FinalTotal)}`}
            </button>
        </div>
    );
}