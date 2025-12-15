import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createCustomerInfo, createBookingTour } from "../../../services/customer/bookingService";
import { getCurrentUser } from "../../../services/common/authService";

export default function CheckoutPage() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const tour = state?.tour;
    const details = state?.details;

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [form, setForm] = useState({
        CustomerName: "",
        CustomerCitizenCard: "",
        CustomerPhone: "",
        CustomerEmail: "",
        CapacityAdult: 1,
        CapacityKid: 0,
        CapacityBaby: 0,
        PaymentMethod: 1,
        OrderNote: "",
    });

    if (!tour || !details) {
        return <p className="p-10 text-center text-gray-600">Loading...</p>;
    }

    const availableSeats = details.NumberOfGuests - details.BookedSeat;

    const orderTotal =
        form.CapacityAdult * details.UnitPrice +
        form.CapacityKid * details.UnitPrice * 0.7 +
        form.CapacityBaby * details.UnitPrice * 0.3;

    function update(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "", TotalGuests: "" }));
    }

    const validators = {
        CustomerName: (v) =>
            !v
                ? "Full name is required"
                : v.trim().split(" ").length < 2
                    ? "Please enter at least 2 words"
                    : /[0-9!@#$%^&*]/.test(v)
                        ? "Name cannot contain numbers or special characters"
                        : "",

        CustomerEmail: (v) =>
            !v
                ? "Email is required"
                : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
                    ? "Invalid email format"
                    : "",

        CustomerPhone: (v) =>
            !v
                ? "Phone number is required"
                : !/^[0-9]{8,15}$/.test(v)
                    ? "Phone must be 8–15 digits"
                    : "",

        CustomerCitizenCard: (v) =>
            v && !/^[0-9]{9,12}$/.test(v)
                ? "ID/Passport must be 9–12 digits"
                : "",

        CapacityAdult: (v) => (v < 1 ? "At least 1 adult is required" : ""),

        PaymentMethod: (v) => (!v ? "Payment method is required" : ""),
    };

    function validateForm() {
        let newErrors = {};

        Object.keys(validators).forEach((field) => {
            const error = validators[field](form[field]);
            if (error) newErrors[field] = error;
        });

        const totalGuests =
            form.CapacityAdult + form.CapacityKid + form.CapacityBaby;

        if (totalGuests > availableSeats) {
            newErrors.TotalGuests = `Only ${availableSeats} seats left. You selected ${totalGuests}.`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // Map payment method number to string
    const getPaymentMethodString = (method) => {
        const map = {
            1: "CREDIT_CARD",
            2: "CASH",
            3: "BANK_TRANSFER"
        };
        return map[method] || "CASH";
    };

    async function handleSubmit() {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitError("");

        try {
            // Lấy AccountID từ user đã đăng nhập, nếu không có thì dùng 1 (guest)
            const currentUser = getCurrentUser();
            const accountID = currentUser?.accountID || currentUser?.AccountID || 1;

            // Bước 1: Tạo CustomerInfo
            const customerInfoData = {
                customerName: form.CustomerName,
                customerPhone: form.CustomerPhone,
                customerEmail: form.CustomerEmail,
                citizenCard: form.CustomerCitizenCard || null,
            };

            const customerInfo = await createCustomerInfo(customerInfoData);
            const customerInfoID = customerInfo.customerInfoID;

            // Bước 2: Tạo BookingTour
            const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
            const orderCode = "ORD" + Date.now();

            const bookingData = {
                accountID: accountID,
                customerInfoID: customerInfoID,
                tourDetailID: details.TourDetailID,
                adultCount: form.CapacityAdult,
                childCount: form.CapacityKid || 0,
                infantCount: form.CapacityBaby || 0,
                unitPrice: details.UnitPrice,
                orderTotal: orderTotal,
                paymentMethod: getPaymentMethodString(form.PaymentMethod),
                paymentStatus: 0, // 0 = Pending
                orderStatus: 1, // 1 = Processing
                orderCode: orderCode,
                expireAt: expireAt.toISOString(),
            };

            const booking = await createBookingTour(bookingData);

            // Bước 3: Chuẩn bị payload cho BookingSuccessPage (merge customerInfo vào booking)
            const payload = {
                ...booking,
                // Map field names để BookingSuccessPage có thể đọc được
                CapacityAdult: booking.adultCount,
                CapacityKid: booking.childCount || 0,
                CapacityBaby: booking.infantCount || 0,
                OrderTotal: booking.orderTotal,
                OrderCode: booking.orderCode,
                PaymentMethod: form.PaymentMethod, // Giữ số để BookingSuccessPage map đúng
                // Thêm customer info từ form
                CustomerName: form.CustomerName,
                CustomerPhone: form.CustomerPhone,
                CustomerEmail: form.CustomerEmail,
                CustomerCitizenCard: form.CustomerCitizenCard,
            };

            // Bước 4: Navigate to success page
            navigate("/booking-success", {
                state: {
                    payload: payload,
                    booking: payload, // Cũng truyền booking để tương thích
                    tour: tour,
                    details: details,
                },
            });
        } catch (error) {
            console.error("Booking error:", error);
            setSubmitError(error.message || "Có lỗi xảy ra khi tạo booking. Vui lòng thử lại!");
            setIsSubmitting(false);
        }
    }

    const inputStyle =
        "p-3 border rounded-lg w-full focus:outline-none focus:border-orange-500 transition";

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 lg:grid lg:grid-cols-3 lg:gap-12 mt-[50px]">

            {/* ================= LEFT FORM ================= */}
            <div className="lg:col-span-2 space-y-10">

                {/* ===== CONTACT ===== */}
                <section className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Contact Information</h2>

                    <input
                        className={`${inputStyle} ${errors.CustomerEmail ? "border-red-500" : ""}`}
                        placeholder="Email address"
                        value={form.CustomerEmail}
                        onChange={(e) => update("CustomerEmail", e.target.value)}
                    />
                    {errors.CustomerEmail && (
                        <p className="text-red-500 text-sm mt-1">{errors.CustomerEmail}</p>
                    )}
                </section>

                {/* ===== CUSTOMER INFO ===== */}
                <section className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Customer Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <input
                                className={`${inputStyle} ${errors.CustomerName ? "border-red-500" : ""}`}
                                placeholder="Full name"
                                value={form.CustomerName}
                                onChange={(e) => update("CustomerName", e.target.value)}
                            />
                            {errors.CustomerName && (
                                <p className="text-red-500 text-sm mt-1">{errors.CustomerName}</p>
                            )}
                        </div>

                        <div>
                            <input
                                className={`${inputStyle} ${errors.CustomerCitizenCard ? "border-red-500" : ""}`}
                                placeholder="Citizen ID / Passport"
                                value={form.CustomerCitizenCard}
                                onChange={(e) => update("CustomerCitizenCard", e.target.value)}
                            />
                            {errors.CustomerCitizenCard && (
                                <p className="text-red-500 text-sm mt-1">{errors.CustomerCitizenCard}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <input
                                className={`${inputStyle} ${errors.CustomerPhone ? "border-red-500" : ""}`}
                                placeholder="Phone number"
                                value={form.CustomerPhone}
                                onChange={(e) => update("CustomerPhone", e.target.value)}
                            />
                            {errors.CustomerPhone && (
                                <p className="text-red-500 text-sm mt-1">{errors.CustomerPhone}</p>
                            )}
                        </div>

                        <input
                            className={inputStyle}
                            placeholder="Note (optional)"
                            value={form.OrderNote}
                            onChange={(e) => update("OrderNote", e.target.value)}
                        />
                    </div>

                    {errors.TotalGuests && (
                        <p className="text-red-500 text-sm mt-3">{errors.TotalGuests}</p>
                    )}
                </section>

                {/* ===== GUESTS ===== */}
                <section className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Guests</h2>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm text-gray-600">Adult</label>
                            <input
                                type="number"
                                min="1"
                                className={`${inputStyle} ${errors.CapacityAdult ? "border-red-500" : ""}`}
                                value={form.CapacityAdult}
                                onChange={(e) => update("CapacityAdult", Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Kid</label>
                            <input
                                type="number"
                                min="0"
                                className={inputStyle}
                                value={form.CapacityKid}
                                onChange={(e) => update("CapacityKid", Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Baby</label>
                            <input
                                type="number"
                                min="0"
                                className={inputStyle}
                                value={form.CapacityBaby}
                                onChange={(e) => update("CapacityBaby", Number(e.target.value))}
                            />
                        </div>
                    </div>
                </section>

                {/* ===== PAYMENT ===== */}
                <section className="bg-white p-6 rounded-xl border shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Payment Method</h2>

                    <select
                        value={form.PaymentMethod}
                        onChange={(e) => update("PaymentMethod", Number(e.target.value))}
                        className={`${inputStyle} ${errors.PaymentMethod ? "border-red-500" : ""}`}
                    >
                        <option value={1}>Credit Card</option>
                        <option value={2}>Cash</option>
                        <option value={3}>Bank Transfer</option>
                    </select>
                </section>

                {/* ===== REFUND POLICY ===== */}
                <section className="p-6 border rounded-xl bg-orange-50">
                    <h2 className="text-xl font-bold text-orange-700 mb-3">
                        Refund & Cancellation Policy
                    </h2>
                    <ul className="space-y-1 text-sm text-gray-700">
                        <li>• ≥ 5 days before departure: 95% refund</li>
                        <li>• 4 days before departure: 90% refund</li>
                        <li>• 3 days before departure: 85% refund</li>
                        <li>• 2 days before departure: 80% refund</li>
                        <li>• 1 day before departure: 75% refund</li>
                        <li className="text-red-600 font-semibold">
                            • Departure day: No refund
                        </li>
                    </ul>
                </section>

                {/* ===== ERROR ===== */}
                {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{submitError}</p>
                    </div>
                )}

                {/* ===== CTA ===== */}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition
                    ${isSubmitting
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-orange-600 hover:bg-orange-700"
                        } text-white`}
                >
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                </button>
            </div>

            {/* ================= RIGHT SUMMARY ================= */}
            <aside className="border rounded-xl p-6 shadow-md bg-gray-50 h-fit sticky top-24">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                <div className="flex gap-4 mb-4">
                    <img
                        src={tour.TourImg}
                        className="w-24 h-24 rounded-lg object-cover"
                    />
                    <div>
                        <p className="font-semibold">{tour.TourName}</p>
                        <p className="text-gray-500 text-sm">{tour.Duration}</p>
                        <p className="font-bold mt-1 text-orange-600">
                            ${details.UnitPrice}
                        </p>
                    </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                    <p className="flex justify-between">
                        <span>Adults</span>
                        <span>{form.CapacityAdult} × ${details.UnitPrice}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Kids</span>
                        <span>{form.CapacityKid} × ${(details.UnitPrice * 0.7).toFixed(1)}</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Baby</span>
                        <span>{form.CapacityBaby} × ${(details.UnitPrice * 0.3).toFixed(1)}</span>
                    </p>

                    <p className="flex justify-between font-bold text-lg border-t pt-3 mt-3">
                        <span>Total</span>
                        <span className="text-orange-600">
                            ${orderTotal.toLocaleString()}
                        </span>
                    </p>
                </div>
            </aside>
        </div>
    );

}

