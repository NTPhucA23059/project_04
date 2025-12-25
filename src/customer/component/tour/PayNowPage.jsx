import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { formatUSD } from "../../../utils/currency";
import { processTourPayment as processMomoPayment } from "../../../services/customer/momoPaymentService";
import { processTourPayment as processPayPalPayment } from "../../../services/customer/paypalPaymentService";

export default function PayNowPage() {
    const { state } = useLocation();
    const booking = state?.booking;
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState("MOMO");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!booking) {
        return <div className="text-center py-20 text-gray-500">No booking found.</div>;
    }

    // Get orderCode and orderTotal from booking
    // Support both formats: OrderCode/orderCode, OrderTotal/orderTotal
    const orderCode = booking.OrderCode || booking.orderCode;
    const orderTotal = booking.OrderTotal || booking.orderTotal || 0;

    const handlePayment = async () => {
        if (!orderCode) {
            setError("Booking code not found");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Prepare booking object for payment service
            const bookingForPayment = {
                orderCode: orderCode,
                orderTotal: orderTotal,
            };

            if (paymentMethod === "MOMO") {
                // Process MoMo payment
                const payUrl = await processMomoPayment(bookingForPayment);
                
                // Redirect to MoMo
                window.location.href = payUrl;
                // Don't set loading to false here as we're redirecting
                return;
            } else if (paymentMethod === "PAYPAL") {
                // Process PayPal payment (amount is already in USD)
                const amountInUSD = parseFloat(orderTotal);
                const approvalUrl = await processPayPalPayment(
                    bookingForPayment,
                    "USD"
                );
                
                // Redirect to PayPal
                window.location.href = approvalUrl;
                // Don't set loading to false here as we're redirecting
                return;
            } else {
                setError("Invalid payment method selected");
                setLoading(false);
                return;
            }
        } catch (paymentError) {
            console.error("Payment error:", paymentError);
            setError(
                paymentError.message ||
                "Failed to initialize payment. Please try again or contact support."
            );
            setLoading(false);
        }
    };

    return (
        <div className="px-4 py-14 mt-10">
            <h1 className="text-3xl font-bold mb-6">Payment</h1>

            {/* BOOKING SUMMARY */}
            <div className="border bg-white rounded-xl p-6 shadow-md space-y-4 mb-8">
                <h2 className="text-xl font-semibold">Booking Summary</h2>

                <p><strong>Booking Code:</strong> {orderCode}</p>
                <p><strong>Tour:</strong> {booking.TourName || "Tour"}</p>
                {booking.DepartureDate && (
                    <p><strong>Departure:</strong> {new Date(booking.DepartureDate).toLocaleDateString()}</p>
                )}

                <p className="text-lg font-bold text-primary-700">
                    Total: {formatUSD(orderTotal)}
                </p>
            </div>

            {/* PAYMENT METHODS */}
            <div className="border bg-white rounded-xl p-6 shadow-md space-y-4">
                <h2 className="text-xl font-semibold mb-3">Select Payment Method</h2>

                <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "MOMO"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                }`}>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="MOMO"
                        checked={paymentMethod === "MOMO"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-primary-600"
                        disabled={loading}
                    />
                    <div className="flex-1">
                        <span className="font-medium">MoMo Wallet</span>
                        <p className="text-sm text-gray-500 mt-1">Pay with your MoMo wallet</p>
                    </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === "PAYPAL"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                }`}>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="PAYPAL"
                        checked={paymentMethod === "PAYPAL"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-primary-600"
                        disabled={loading}
                    />
                    <div className="flex-1">
                        <span className="font-medium">PayPal</span>
                        <p className="text-sm text-gray-500 mt-1">Pay with your PayPal account</p>
                    </div>
                </label>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* PAY BUTTON */}
            <button
                onClick={handlePayment}
                disabled={loading || !paymentMethod}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl mt-6 shadow-md transition"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                    </span>
                ) : (
                    `Pay ${formatUSD(orderTotal)}`
                )}
            </button>
        </div>
    );
}
