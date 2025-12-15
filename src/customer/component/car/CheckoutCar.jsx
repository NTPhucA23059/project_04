import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import { refundRules } from "../../component/data/mockData";
import { getCurrentUser } from "../../../services/common/authService";
import { createCustomerInfo } from "../../../services/customer/bookingService";
import { createCarBooking } from "../../../services/customer/carBookingService";

export default function CheckoutCar() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const car = state?.car;

    const [errors, setErrors] = useState({});
    const [agree, setAgree] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        email: "",
        citizenId: "",
        pickupDate: "",
        pickupTime: "",
        pickupLocation: "",
        dropoffDate: "",
        dropoffTime: "",
        dropoffLocation: "",
        paymentMethod: "",
        notes: "",
    });

    if (!car) {
        return <p className="p-10 text-center text-neutral-600">Đang tải dữ liệu…</p>;
    }

    const update = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // =====================
    // VALIDATION
    // =====================
    const validators = {
        fullName: (v) =>
            !v ? "Vui lòng nhập họ tên"
                : v.trim().split(" ").length < 2
                    ? "Họ tên phải có ít nhất 2 từ"
                    : "",
        phone: (v) =>
            !v ? "Vui lòng nhập số điện thoại"
                : !/^[0-9]{8,15}$/.test(v)
                    ? "Số điện thoại không hợp lệ (8-15 số)"
                    : "",
        email: (v) =>
            !v ? "Vui lòng nhập email"
                : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
                    ? "Email không đúng định dạng"
                    : "",
        pickupDate: (v) => (!v ? "Vui lòng chọn ngày nhận xe" : ""),
        dropoffDate: (v) => (!v ? "Vui lòng chọn ngày trả xe" : ""),
        pickupLocation: (v) => (!v ? "Vui lòng nhập địa điểm nhận xe" : ""),
        dropoffLocation: (v) => (!v ? "Vui lòng nhập địa điểm trả xe" : ""),
    };

    const validateForm = () => {
        let newErrors = {};

        // basic validators
        Object.keys(validators).forEach((field) => {
            const error = validators[field](form[field]);
            if (error) newErrors[field] = error;
        });

        // date validation
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const pickup = new Date(form.pickupDate + " " + form.pickupTime);
        const dropoff = new Date(form.dropoffDate + " " + form.dropoffTime);

        if (form.pickupDate) {
            if (new Date(form.pickupDate) <= today) {
                newErrors.pickupDate = "Ngày nhận xe phải là ngày trong tương lai";
            }
        }

        if (form.dropoffDate) {
            if (new Date(form.dropoffDate) <= today) {
                newErrors.dropoffDate = "Ngày trả xe phải là ngày trong tương lai";
            }
        }

        if (form.pickupDate && form.dropoffDate && dropoff <= pickup) {
            newErrors.dropoffDate = "Ngày trả xe phải sau ngày nhận xe";
        }

        if (
            form.pickupDate === form.dropoffDate &&
            form.pickupTime &&
            form.dropoffTime &&
            form.dropoffTime <= form.pickupTime
        ) {
            newErrors.dropoffTime = "Giờ trả xe phải sau giờ nhận xe";
        }

        if (!form.paymentMethod) {
            newErrors.paymentMethod = "Vui lòng chọn phương thức thanh toán";
        }

        if (!agree) {
            newErrors.agree = "Bạn phải đồng ý với chính sách hoàn tiền";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // =====================
    // RENTAL DAYS & TOTAL
    // =====================
    const dailyRate = Number(car.DailyRate ?? car.dailyRate ?? 0);

    const days =
        form.pickupDate && form.dropoffDate
            ? Math.max(
                1,
                (new Date(form.dropoffDate) - new Date(form.pickupDate)) /
                (1000 * 60 * 60 * 24)
            )
            : 0;

    const total = days * dailyRate;

    // =====================
    // SUBMIT
    // =====================
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitError("");

        try {
            if (!dailyRate || Number.isNaN(dailyRate)) {
                throw new Error("Giá thuê xe không hợp lệ. Vui lòng chọn xe khác.");
            }

            const currentUser = getCurrentUser();
            const accountID = currentUser?.accountID || currentUser?.AccountID || 1;

            // 1) Tạo CustomerInfo (public endpoint)
            const customerInfo = await createCustomerInfo({
                customerName: form.fullName,
                customerPhone: form.phone,
                customerEmail: form.email,
                citizenCard: form.citizenId || null,
            });
            const customerInfoID = customerInfo.customerInfoID;

            // 2) Tạo CarBooking
            const carID = car.CarID ?? car.carID ?? car.id;
            if (!carID) {
                throw new Error("Không xác định được CarID. Vui lòng chọn lại xe từ danh sách.");
            }

            const bookingCode = "CR" + Date.now();
            const paymentStatus = 0; // Pending
            const bookingStatus = 1; // Processing
            const cancelDeadline =
                form.paymentMethod === "OFFICE"
                    ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                    : null;

            const pickupTime = form.pickupTime || "00:00";
            const dropoffTime = form.dropoffTime || "00:00";

            const bookingData = {
                accountID,
                customerInfoID,
                carID,
                pickupDate: new Date(form.pickupDate + "T" + pickupTime).toISOString(),
                dropoffDate: new Date(form.dropoffDate + "T" + dropoffTime).toISOString(),
                needDriver: false,
                needAirConditioner: false,
                baseAmount: total,
                finalTotal: total,
                paymentMethod: form.paymentMethod,
                paymentStatus,
                bookingCode,
                bookingStatus,
                cancelDeadline,
            };

            const booking = await createCarBooking(bookingData);

            // 3) Payload cho trang success (map lại các field UI đang dùng)
            const payload = {
                ...form,
                ...booking,
                TotalAmount: total,
                bookingCode: booking.bookingCode,
                paymentMethod: form.paymentMethod,
            };

            navigate("/car-booking-success", { state: { payload, car } });
        } catch (error) {
            console.error("Car booking error:", error);
            setSubmitError(error.message || "Không thể tạo đơn đặt xe, vui lòng thử lại.");
            setIsSubmitting(false);
        }
    };

    const inputStyle =
        "p-3 border rounded-lg w-full focus:outline-none focus:border-primary-600 transition";

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 lg:grid lg:grid-cols-3 lg:gap-12 mt-[50px]">

            {/* ========================= */}
            {/* LEFT CONTENT */}
            {/* ========================= */}
            <div className="lg:col-span-2 space-y-10">

                {/* CONTACT */}
                <div>
                    <h2 className="text-xl font-bold mb-2">Thông Tin Liên Hệ</h2>
                    <div className="relative">
                        <FaEnvelope className="absolute left-3 top-3 text-neutral-400" />
                        <input
                            className={`${inputStyle} pl-10 ${errors.email ? "border-red-500" : ""}`}
                            placeholder="Email"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                        />
                    </div>
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                {/* CUSTOMER */}
                <div>
                    <h2 className="text-xl font-bold mb-2">Thông Tin Khách Hàng</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3 text-neutral-400" />
                            <input
                                className={`${inputStyle} pl-10 ${errors.fullName ? "border-red-500" : ""}`}
                                placeholder="Họ và tên"
                                value={form.fullName}
                                onChange={(e) => update("fullName", e.target.value)}
                            />
                        </div>

                        <input
                            className={inputStyle}
                            placeholder="CMND / CCCD / Passport"
                            value={form.citizenId}
                            onChange={(e) => update("citizenId", e.target.value)}
                        />
                    </div>

                    {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}

                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="relative">
                            <FaPhone className="absolute left-3 top-3 text-neutral-400" />
                            <input
                                className={`${inputStyle} pl-10 ${errors.phone ? "border-red-500" : ""}`}
                                placeholder="Số điện thoại"
                                value={form.phone}
                                onChange={(e) => update("phone", e.target.value)}
                            />
                        </div>

                        <input
                            className={inputStyle}
                            placeholder="Ghi chú (không bắt buộc)"
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                        />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>

                {/* PICKUP */}
                <div>
                    <h2 className="text-xl font-bold mb-2">Thông Tin Nhận Xe</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            className={`${inputStyle} ${errors.pickupDate ? "border-red-500" : ""}`}
                            value={form.pickupDate}
                            onChange={(e) => update("pickupDate", e.target.value)}
                        />

                        <input
                            type="time"
                            className={inputStyle}
                            value={form.pickupTime}
                            onChange={(e) => update("pickupTime", e.target.value)}
                        />
                    </div>

                    {errors.pickupDate && <p className="text-red-500 text-sm">{errors.pickupDate}</p>}

                    <div className="relative mt-4">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-neutral-400" />
                        <input
                            className={`${inputStyle} pl-10 ${errors.pickupLocation ? "border-red-500" : ""}`}
                            placeholder="Địa điểm nhận xe"
                            value={form.pickupLocation}
                            onChange={(e) => update("pickupLocation", e.target.value)}
                        />
                    </div>
                    {errors.pickupLocation && (
                        <p className="text-red-500 text-sm">{errors.pickupLocation}</p>
                    )}
                </div>

                {/* DROPOFF */}
                <div>
                    <h2 className="text-xl font-bold mb-2">Thông Tin Trả Xe</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="date"
                            className={`${inputStyle} ${errors.dropoffDate ? "border-red-500" : ""}`}
                            value={form.dropoffDate}
                            onChange={(e) => update("dropoffDate", e.target.value)}
                        />
                        <input
                            type="time"
                            className={inputStyle}
                            value={form.dropoffTime}
                            onChange={(e) => update("dropoffTime", e.target.value)}
                        />
                    </div>

                    {errors.dropoffDate && <p className="text-red-500 text-sm">{errors.dropoffDate}</p>}
                    {errors.dropoffTime && <p className="text-red-500 text-sm">{errors.dropoffTime}</p>}

                    <div className="relative mt-4">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-neutral-400" />
                        <input
                            className={`${inputStyle} pl-10 ${errors.dropoffLocation ? "border-red-500" : ""}`}
                            placeholder="Địa điểm trả xe"
                            value={form.dropoffLocation}
                            onChange={(e) => update("dropoffLocation", e.target.value)}
                        />
                    </div>
                    {errors.dropoffLocation && (
                        <p className="text-red-500 text-sm">{errors.dropoffLocation}</p>
                    )}
                </div>

                {/* PAYMENT METHOD */}
                <div className="p-5 border rounded-xl bg-white">
                    <h2 className="text-xl font-bold mb-2">Phương Thức Thanh Toán</h2>

                    <div className="space-y-2 text-sm">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="pay"
                                value="OFFICE"
                                checked={form.paymentMethod === "OFFICE"}
                                onChange={(e) => update("paymentMethod", e.target.value)}
                            />
                            Thanh toán tại quầy
                        </label>

                        {form.paymentMethod === "OFFICE" && (
                            <p className="ml-6 text-red-600">
                                ⚠ Bạn phải đến trụ sở thanh toán trong 24 giờ sau khi đặt xe.
                            </p>
                        )}

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="pay"
                                value="MOMO"
                                checked={form.paymentMethod === "MOMO"}
                                onChange={(e) => update("paymentMethod", e.target.value)}
                            />
                            Ví MoMo
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="pay"
                                value="PAYPAL"
                                checked={form.paymentMethod === "PAYPAL"}
                                onChange={(e) => update("paymentMethod", e.target.value)}
                            />
                            PayPal
                        </label>

                        {errors.paymentMethod && (
                            <p className="text-red-500 text-sm">{errors.paymentMethod}</p>
                        )}
                    </div>
                </div>

                {/* REFUND POLICY */}
                <div className="p-5 border rounded-xl bg-white">
                    <h2 className="text-xl font-bold mb-2">Chính Sách Hoàn Tiền</h2>
                    <ul className="text-sm text-gray-700 space-y-1">
                        {refundRules.map((r, i) => (
                            <li key={i}>• {r.Label}</li>
                        ))}
                    </ul>
                </div>

                {/* TERMS CONFIRM */}
                <label className="flex items-start gap-2">
                    <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                    />
                    <span className="text-sm">
                        Tôi đồng ý với các điều khoản và chính sách hoàn tiền của dịch vụ.
                    </span>
                </label>
                {errors.agree && <p className="text-red-500 text-sm">{errors.agree}</p>}

            </div>

            {/* ========================= */}
            {/* RIGHT SUMMARY */}
            {/* ========================= */}
            <div className="border rounded-xl p-6 shadow-md h-fit bg-accent-50">
                <h2 className="text-lg font-bold mb-4">Tổng Quan Chi Phí</h2>

                <div className="flex gap-4 mb-4">
                    <img src={car.ImageUrl} className="w-28 h-20 rounded-lg object-cover" />
                    <div>
                        <p className="font-semibold">{car.ModelName}</p>
                        <p className="text-neutral-600 text-sm">{car.Transmission}</p>
                        <p className="font-bold text-primary-600">${car.DailyRate}/ngày</p>
                    </div>
                </div>

                <div className="border-t pt-4 text-sm space-y-2">
                    <p className="flex justify-between">
                        <span>Số ngày thuê</span>
                        <span>{days} ngày</span>
                    </p>

                    <p className="flex justify-between font-bold text-lg pt-2 border-t mt-3 text-primary-700">
                        <span>Tổng tiền</span>
                        <span>${total.toLocaleString()}</span>
                    </p>
                </div>

                {submitError && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                        {submitError}
                    </div>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className={`w-full text-white py-4 rounded-lg mt-4 font-bold ${
                        isSubmitting
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-primary-600 hover:bg-primary-700"
                    }`}
                >
                    {isSubmitting ? "Đang xử lý..." : "Xác Nhận Đặt Xe"}
                </button>
            </div>
        </div>
    );
}
