import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function PayNowPage() {
    const { state } = useLocation();
    const booking = state?.booking;
    const navigate = useNavigate();

    const [paymentMethod, setPaymentMethod] = useState(booking?.PaymentMethod || 1);
    const [toastMessage, setToastMessage] = useState("");

    if (!booking) {
        return <div className="text-center py-20 text-gray-500">No booking found.</div>;
    }

    const handlePayment = () => {
        setToastMessage("Processing payment...");
        setTimeout(() => {
            setToastMessage("Payment successful!");

            // Giả lập cập nhật trạng thái đơn hàng
            booking.OrderStatus = 2;  // Paid
            booking.PaymentStatus = 1;

            setTimeout(() => {
                navigate("/booking-detail", { state: { booking } });
            }, 1200);

        }, 1500);
    };

    return (
        <div className="px-4 py-14 mt-10  ">

            <h1 className="text-3xl font-bold mb-6">Payment</h1>

            {/* BOOKING SUMMARY */}
            <div className="border bg-white rounded-xl p-6 shadow-md space-y-4 mb-8">
                <h2 className="text-xl font-semibold">Booking Summary</h2>

                <p><strong>Booking Code:</strong> {booking.OrderCode}</p>
                <p><strong>Tour:</strong> {booking.TourName}</p>
                <p><strong>Departure:</strong> {new Date(booking.DepartureDate).toLocaleDateString()}</p>

                <p className="text-lg font-bold text-primary-700">
                    Total: ${booking.OrderTotal.toLocaleString()}
                </p>
            </div>

            {/* PAYMENT METHODS */}
            <div className="border bg-white rounded-xl p-6 shadow-md space-y-4">
                <h2 className="text-xl font-semibold mb-3">Select Payment Method</h2>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                        type="radio"
                        checked={paymentMethod === 1}
                        onChange={() => setPaymentMethod(1)}
                    />
                    <span>Credit Card</span>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                        type="radio"
                        checked={paymentMethod === 3}
                        onChange={() => setPaymentMethod(3)}
                    />
                    <span>Bank Transfer</span>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-neutral-50">
                    <input
                        type="radio"
                        checked={paymentMethod === 2}
                        onChange={() => setPaymentMethod(2)}
                    />
                    <span>Cash</span>
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
