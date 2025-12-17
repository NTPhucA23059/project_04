import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaUser, FaPhone, FaEnvelope } from "react-icons/fa";
import { refundRules } from "../../component/data/mockData";
import { getCurrentUser, isAuthenticated } from "../../../services/common/authService";
import { createCustomerInfo } from "../../../services/customer/bookingService";
import { createCarBooking } from "../../../services/customer/carBookingService";
import { formatUSD } from "../../../utils/currency";
import api from "../../../services/api";

export default function CheckoutCar() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const car = state?.car;

    // Check authentication - redirect to login if not authenticated
    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login", { 
                state: { 
                    from: "/checkout-car",
                    message: "Please login to book a car"
                } 
            });
        }
    }, [navigate]);

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
        pickupTime: "09:00",
        pickupLocation: "",
        dropoffDate: "",
        dropoffTime: "17:00",
        dropoffLocation: "",
        paymentMethod: "",
        notes: "",
        needDriver: false,
        needAirConditioner: true,
    });

    // Auto-fill user info if logged in
    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setForm(prev => ({
                ...prev,
                email: user.email || prev.email,
                fullName: user.fullName || user.name || prev.fullName,
                phone: user.phone || prev.phone,
            }));
        }
    }, []);

    // Get minimum date (today)
    const getMinDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString().split('T')[0];
    };

    // Get minimum time for dropoff if same day as pickup
    const getMinTime = () => {
        if (form.pickupDate === form.dropoffDate && form.pickupTime) {
            const [hours, minutes] = form.pickupTime.split(':');
            const nextHour = String(parseInt(hours) + 1).padStart(2, '0');
            return `${nextHour}:${minutes}`;
        }
        return "00:00";
    };

    if (!car) {
        return (
            <div className="p-10 text-center text-neutral-600">
                <p>Loading car information...</p>
                <p className="text-sm mt-2">If this persists, please go back and select a car.</p>
            </div>
        );
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
            !v ? "Please enter your full name"
                : v.trim().split(" ").length < 2
                    ? "Full name must have at least 2 words"
                    : "",
        phone: (v) =>
            !v ? "Please enter your phone number"
                : !/^[0-9]{8,15}$/.test(v)
                    ? "Invalid phone number (8-15 digits)"
                    : "",
        email: (v) =>
            !v ? "Please enter your email"
                : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
                    ? "Invalid email format"
                    : "",
        pickupDate: (v) => (!v ? "Please select pickup date" : ""),
        dropoffDate: (v) => (!v ? "Please select dropoff date" : ""),
        pickupLocation: (v) => (!v ? "Please enter pickup location" : ""),
        dropoffLocation: (v) => (!v ? "Please enter dropoff location" : ""),
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
            const pickupDateOnly = new Date(form.pickupDate);
            pickupDateOnly.setHours(0, 0, 0, 0);
            if (pickupDateOnly < today) {
                newErrors.pickupDate = "Pickup date must be today or later";
            }
        }

        if (form.dropoffDate) {
            const dropoffDateOnly = new Date(form.dropoffDate);
            dropoffDateOnly.setHours(0, 0, 0, 0);
            if (dropoffDateOnly < today) {
                newErrors.dropoffDate = "Dropoff date must be today or later";
            }
        }

        if (form.pickupDate && form.dropoffDate) {
            const pickupDateOnly = new Date(form.pickupDate);
            const dropoffDateOnly = new Date(form.dropoffDate);
            pickupDateOnly.setHours(0, 0, 0, 0);
            dropoffDateOnly.setHours(0, 0, 0, 0);
            
            if (dropoffDateOnly < pickupDateOnly) {
                newErrors.dropoffDate = "Dropoff date must be on or after pickup date";
            }
        }

        if (
            form.pickupDate === form.dropoffDate &&
            form.pickupTime &&
            form.dropoffTime &&
            form.dropoffTime <= form.pickupTime
        ) {
            newErrors.dropoffTime = "Dropoff time must be after pickup time";
        }

        if (!form.paymentMethod) {
            newErrors.paymentMethod = "Please select a payment method";
        }

        if (!agree) {
            newErrors.agree = "You must agree to the refund policy";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // =====================
    // RENTAL DAYS & TOTAL
    // =====================
    const dailyRate = Number(car.DailyRate ?? car.dailyRate ?? 0);
    const baseDailyRate = dailyRate;

    // Calculate rental days
    const days =
        form.pickupDate && form.dropoffDate
            ? Math.max(
                1,
                Math.ceil(
                    (new Date(form.dropoffDate) - new Date(form.pickupDate)) /
                    (1000 * 60 * 60 * 24)
                )
            )
            : 0;

    // Calculate base amount
    let baseAmount = days * baseDailyRate;
    
    // Add optional services (if applicable - you may need to adjust based on your API)
    // For now, these are included in the base rate, but you can add extras here
    // const driverFee = form.needDriver ? days * 500000 : 0; // Example: 500k/day for driver
    // baseAmount += driverFee;
    
    const total = baseAmount;

    // =====================
    // SUBMIT
    // =====================
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitError("");

        try {
            if (!dailyRate || Number.isNaN(dailyRate)) {
                throw new Error("Invalid car rental rate. Please select another car.");
            }

            const currentUser = getCurrentUser();
            if (!currentUser) {
                throw new Error("You must be logged in to book a car. Please login first.");
            }
            const accountID = currentUser?.accountID || currentUser?.AccountID;
            if (!accountID) {
                throw new Error("Invalid user account. Please login again.");
            }

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
                throw new Error("Car ID not found. Please select a car from the list.");
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
                pickupLocation: form.pickupLocation,
                dropoffLocation: form.dropoffLocation,
                needDriver: form.needDriver || false,
                needAirConditioner: form.needAirConditioner !== false, // Default to true if car has AC
                baseAmount: total,
                finalTotal: total,
                paymentMethod: form.paymentMethod,
                paymentStatus,
                bookingCode,
                bookingStatus,
                cancelDeadline,
                notes: form.notes || null,
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
            setSubmitError(error.message || "Failed to create car booking. Please try again.");
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
                    <h2 className="text-xl font-bold mb-2">Contact Information</h2>
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
                    <h2 className="text-xl font-bold mb-2">Customer Information</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                            <FaUser className="absolute left-3 top-3 text-neutral-400" />
                            <input
                                className={`${inputStyle} pl-10 ${errors.fullName ? "border-red-500" : ""}`}
                                placeholder="Full Name"
                                value={form.fullName}
                                onChange={(e) => update("fullName", e.target.value)}
                            />
                        </div>

                        <input
                            className={inputStyle}
                            placeholder="ID Card / Passport (Optional)"
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
                                placeholder="Phone Number"
                                value={form.phone}
                                onChange={(e) => update("phone", e.target.value)}
                            />
                        </div>

                        <input
                            className={inputStyle}
                            placeholder="Notes (Optional)"
                            value={form.notes}
                            onChange={(e) => update("notes", e.target.value)}
                        />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                </div>

                {/* PICKUP */}
                <div>
                    <h2 className="text-xl font-bold mb-2">Pickup Information</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <input
                                type="date"
                                min={getMinDate()}
                                className={`${inputStyle} ${errors.pickupDate ? "border-red-500" : ""}`}
                                value={form.pickupDate}
                                onChange={(e) => {
                                    update("pickupDate", e.target.value);
                                    // Auto-set dropoff date to at least pickup date
                                    if (form.dropoffDate && new Date(e.target.value) > new Date(form.dropoffDate)) {
                                        update("dropoffDate", e.target.value);
                                    }
                                }}
                            />
                            <p className="text-xs text-neutral-500 mt-1">Select pickup date</p>
                        </div>

                        <div>
                            <input
                                type="time"
                                className={inputStyle}
                                value={form.pickupTime}
                                onChange={(e) => update("pickupTime", e.target.value)}
                            />
                            <p className="text-xs text-neutral-500 mt-1">Pickup time</p>
                        </div>
                    </div>

                    {errors.pickupDate && <p className="text-red-500 text-sm">{errors.pickupDate}</p>}

                    <div className="relative mt-4">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-neutral-400" />
                        <input
                            className={`${inputStyle} pl-10 ${errors.pickupLocation ? "border-red-500" : ""}`}
                            placeholder="Pickup Location"
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
                    <h2 className="text-xl font-bold mb-2">Dropoff Information</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <input
                                type="date"
                                min={form.pickupDate || getMinDate()}
                                className={`${inputStyle} ${errors.dropoffDate ? "border-red-500" : ""}`}
                                value={form.dropoffDate}
                                onChange={(e) => update("dropoffDate", e.target.value)}
                            />
                            <p className="text-xs text-neutral-500 mt-1">Select dropoff date</p>
                        </div>
                        <div>
                            <input
                                type="time"
                                min={form.pickupDate === form.dropoffDate ? getMinTime() : undefined}
                                className={`${inputStyle} ${errors.dropoffTime ? "border-red-500" : ""}`}
                                value={form.dropoffTime}
                                onChange={(e) => update("dropoffTime", e.target.value)}
                            />
                            <p className="text-xs text-neutral-500 mt-1">Dropoff time</p>
                        </div>
                    </div>

                    {errors.dropoffDate && <p className="text-red-500 text-sm">{errors.dropoffDate}</p>}
                    {errors.dropoffTime && <p className="text-red-500 text-sm">{errors.dropoffTime}</p>}

                    <div className="relative mt-4">
                        <FaMapMarkerAlt className="absolute left-3 top-3 text-neutral-400" />
                        <input
                            className={`${inputStyle} pl-10 ${errors.dropoffLocation ? "border-red-500" : ""}`}
                            placeholder="Dropoff Location"
                            value={form.dropoffLocation}
                            onChange={(e) => update("dropoffLocation", e.target.value)}
                        />
                    </div>
                    {errors.dropoffLocation && (
                        <p className="text-red-500 text-sm">{errors.dropoffLocation}</p>
                    )}
                </div>

                {/* ADDITIONAL OPTIONS */}
                <div className="p-5 border rounded-xl bg-white">
                    <h2 className="text-xl font-bold mb-4">Additional Options</h2>
                    
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.needAirConditioner}
                                onChange={(e) => update("needAirConditioner", e.target.checked)}
                                className="w-5 h-5 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                                disabled={!(car.HasAirConditioner ?? car.hasAirConditioner ?? false)}
                            />
                            <div>
                                <span className="font-medium">Air Conditioner</span>
                                {!(car.HasAirConditioner ?? car.hasAirConditioner ?? false) && (
                                    <span className="text-xs text-neutral-500 ml-2">(Not available for this car)</span>
                                )}
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.needDriver}
                                onChange={(e) => update("needDriver", e.target.checked)}
                                className="w-5 h-5 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                                disabled={!(car.HasDriverOption ?? car.hasDriverOption ?? false)}
                            />
                            <div>
                                <span className="font-medium">Include Driver</span>
                                {!(car.HasDriverOption ?? car.hasDriverOption ?? false) && (
                                    <span className="text-xs text-neutral-500 ml-2">(Not available for this car)</span>
                                )}
                            </div>
                        </label>
                    </div>
                </div>

                {/* PAYMENT METHOD */}
                <div className="p-5 border rounded-xl bg-white">
                    <h2 className="text-xl font-bold mb-2">Payment Method</h2>

                    <div className="space-y-2 text-sm">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="pay"
                                value="OFFICE"
                                checked={form.paymentMethod === "OFFICE"}
                                onChange={(e) => update("paymentMethod", e.target.value)}
                            />
                            Pay at Office
                        </label>

                        {form.paymentMethod === "OFFICE" && (
                            <p className="ml-6 text-amber-600 text-sm bg-amber-50 p-2 rounded">
                                ⚠ You must pay at our office within 24 hours after booking, or your reservation will be cancelled.
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
                            MoMo Wallet
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
                    <h2 className="text-xl font-bold mb-2">Refund Policy</h2>
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
                        I agree to the terms and refund policy of the service.
                    </span>
                </label>
                {errors.agree && <p className="text-red-500 text-sm">{errors.agree}</p>}

            </div>

            {/* ========================= */}
            {/* RIGHT SUMMARY */}
            {/* ========================= */}
            <div className="border rounded-xl p-6 shadow-md h-fit bg-accent-50">
                <h2 className="text-lg font-bold mb-4">Cost Summary</h2>

                <div className="flex gap-4 mb-4">
                    <img 
                        src={(() => {
                            const imgUrl = car.image || car.imageUrl || car.ImageUrl || car.Image || car.MainImage ||
                                          (car.images && car.images.length > 0 ? (car.images[0].imageUrl || car.images[0].ImageUrl) : null);
                            if (!imgUrl) return "https://placehold.co/200x150?text=Car";
                            if (/^https?:\/\//.test(imgUrl)) return imgUrl;
                            const base = (api.defaults.baseURL || window.location.origin).replace(/\/$/, "");
                            return imgUrl.startsWith('/') ? `${base}${imgUrl}` : `${base}/${imgUrl.replace(/^\/+/, "")}`;
                        })()}
                        alt={car.ModelName || car.modelName || "Car"}
                        className="w-28 h-20 rounded-lg object-cover border bg-neutral-100"
                        onError={(e) => {
                            e.target.src = "https://placehold.co/200x150?text=Car";
                            e.target.onerror = null;
                        }}
                    />
                    <div className="flex-1">
                        <p className="font-semibold text-lg">{car.ModelName || car.modelName}</p>
                        <p className="text-neutral-600 text-sm">{car.Brand || car.brand} • {car.Transmission || car.transmission}</p>
                        <p className="font-bold text-primary-600 mt-1">{formatUSD(baseDailyRate)}/day</p>
                    </div>
                </div>

                <div className="border-t pt-4 text-sm space-y-3">
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Rental Period</span>
                        <span className="font-medium">
                            {days} {days === 1 ? 'day' : 'days'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between">
                        <span className="text-neutral-600">Daily Rate</span>
                        <span className="font-medium">{formatUSD(baseDailyRate)}</span>
                    </div>

                    {form.needDriver && (
                        <div className="flex justify-between text-neutral-600">
                            <span>Driver Service</span>
                            <span>Included</span>
                        </div>
                    )}

                    {form.needAirConditioner && (
                        <div className="flex justify-between text-neutral-600">
                            <span>Air Conditioning</span>
                            <span>Included</span>
                        </div>
                    )}

                    <div className="flex justify-between font-bold text-lg pt-3 border-t mt-3 text-primary-700">
                        <span>Total Amount</span>
                        <span>{formatUSD(total)}</span>
                    </div>
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
                    {isSubmitting ? "Processing..." : "Confirm Booking"}
                </button>
            </div>
        </div>
    );
}
