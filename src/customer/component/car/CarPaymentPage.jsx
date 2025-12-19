import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function CarPaymentPage() {
    const { state } = useLocation();
    const booking = state?.booking;
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState(booking?.PaymentMethod || "MOMO");
    const [toastMessage, setToastMessage] = useState("");

    if (!booking) {
        return (
            <div className="text-center py-20 text-gray-500">
                No booking found. Please go back to your bookings.
            </div>
        );
    }

    const handlePayment = () => {
        setToastMessage("Processing payment...");
        setTimeout(() => {
            setToastMessage("Payment successful!");

            // Update booking status
            booking.PaymentStatus = 1;
            booking.BookingStatus = 1; // Confirmed

            setTimeout(() => {
                navigate("/my-car-bookings");
            }, 1200);
        }, 1500);
    };

    // Format currency
    const formatCurrency = (amount) => {
        if (!amount) return "0 VND";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    // Get car name
    const carName = booking.CarName || booking.carName || booking.ModelName || booking.modelName || "N/A";
    const carBrand = booking.Brand || booking.brand || "N/A";

    return (
        <div className="px-4 py-14 mt-10">
            <h1 className="text-3xl font-bold mb-6">Car Rental Payment</h1>

            {/* BOOKING SUMMARY */}
            <div className="border bg-white rounded-xl p-6 shadow-md space-y-4 mb-8">
                <h2 className="text-xl font-semibold">Booking Summary</h2>

                <div className="space-y-2">
                    <p>
                        <strong>Car:</strong> {carBrand} {carName}
                    </p>
                    {booking.PickupDate && (
                        <p>
                            <strong>Pickup Date:</strong>{" "}
                            {new Date(booking.PickupDate).toLocaleDateString("vi-VN")}
                            {booking.PickupTime && ` at ${booking.PickupTime}`}
                        </p>
                    )}
                    {booking.DropoffDate && (
                        <p>
                            <strong>Dropoff Date:</strong>{" "}
                            {new Date(booking.DropoffDate).toLocaleDateString("vi-VN")}
                            {booking.DropoffTime && ` at ${booking.DropoffTime}`}
                        </p>
                    )}
                    {booking.TotalAmount && (
                        <p className="text-lg font-bold text-primary-700 mt-4">
                            Total: {formatCurrency(booking.TotalAmount)}
                        </p>
                    )}
                </div>
            </div>

            {/* PAYMENT METHODS */}
            <div className="border bg-white rounded-xl p-6 shadow-md space-y-4">
                <h2 className="text-xl font-semibold mb-3">Select Payment Method</h2>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="MOMO"
                        checked={paymentMethod === "MOMO"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>MoMo Wallet</span>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="PAYPAL"
                        checked={paymentMethod === "PAYPAL"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>PayPal</span>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Cash on Delivery (COD)</span>
                </label>
            </div>

            {/* PAY BUTTON */}
            <button
                onClick={handlePayment}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl mt-6 shadow-md"
            >
                Pay Now
            </button>

            {/* TOAST */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-[9999] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-in">
                    {toastMessage}
                </div>
            )}
        </div>
    );
}






