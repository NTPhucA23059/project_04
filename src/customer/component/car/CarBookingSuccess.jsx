import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    CalendarDaysIcon
} from "@heroicons/react/24/solid";
import { formatUSD } from "../../../utils/currency";
import { fetchCarById } from "../../../services/customer/carService";

export default function CarBookingSuccess() {
    const { state } = useLocation();
    const [carData, setCarData] = useState(state?.car || null);
    const [loadingCar, setLoadingCar] = useState(false);

    const booking = state?.payload;
    const car = carData;

    // Fetch car data if not available or incomplete
    useEffect(() => {
        const loadCar = async () => {
            // If no car data or car data is missing key fields, fetch from API
            const carId = booking?.carID || booking?.carId || booking?.CarID || state?.car?.CarID || state?.car?.carID;
            
            if (!carData || (!carData.ModelName && !carData.modelName && !carData.CarName)) {
                if (carId) {
                    setLoadingCar(true);
                    try {
                        const fetchedCar = await fetchCarById(carId);
                        setCarData(fetchedCar);
                    } catch (err) {
                        console.error("Error fetching car:", err);
                    } finally {
                        setLoadingCar(false);
                    }
                }
            }
        };
        
        if (booking) {
            loadCar();
        }
    }, [booking, carData, state?.car]);

    if (!booking) {
        return (
            <div className="max-w-xl mx-auto text-center py-20">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto" />
                <p className="text-gray-600 mt-4">Không tìm thấy thông tin đặt xe.</p>
            </div>
        );
    }

    // Show loading state while fetching car
    if (loadingCar) {
        return (
            <div className="max-w-xl mx-auto text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải thông tin...</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString, timeString) => {
        if (!dateString) return "N/A";
        try {
            const [hours, minutes] = timeString ? timeString.split(':') : ['00', '00'];
            const date = new Date(dateString);
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return date.toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
            });
        } catch {
            return `${dateString} ${timeString || ''}`;
        }
    };

    const created = new Date();
    const expire = new Date(created.getTime() + 24 * 60 * 60 * 1000);
    const deadline = expire.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });

    const paymentMethodLabel = {
        OFFICE: "Thanh toán tại quầy",
        MOMO: "Ví điện tử MoMo",
        PAYPAL: "PayPal"
    }[booking.paymentMethod];

    return (
        <div className="max-w-4xl mx-auto mt-16 px-6 py-10 bg-white border rounded-2xl shadow-xl">

            {/* HEADER */}
            <div className="text-center">
                <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto" />
                <h1 className="text-3xl font-bold mt-3">Booking Successful!</h1>
                <p className="text-gray-600 mt-2">
                    Thank you for choosing our car rental service.
                </p>
                {booking.bookingCode && (
                    <div className="mt-4 inline-block bg-primary-50 border-2 border-primary-600 rounded-lg px-6 py-3">
                        <p className="text-sm text-neutral-600 font-medium">Booking Code</p>
                        <p className="text-2xl font-bold text-primary-700 mt-1">{booking.bookingCode}</p>
                    </div>
                )}
            </div>

            {/* CAR INFO */}
            {car && (
                <div className="mt-8 border rounded-xl p-6 bg-neutral-50">
                    <h2 className="text-xl font-bold mb-4">Thông Tin Xe</h2>

                    <div className="flex gap-4">
                        <img
                            src={(() => {
                                const imgUrl = car.image || car.ImageUrl || car.imageUrl || car.Image || car.MainImage ||
                                              (car.images && car.images.length > 0 ? (car.images[0].imageUrl || car.images[0].ImageUrl) : null);
                                if (!imgUrl) return "https://placehold.co/200x150?text=Car";
                                if (/^https?:\/\//.test(imgUrl)) return imgUrl;
                                const base = "http://localhost:8081"; // Default API base
                                return imgUrl.startsWith('/') ? `${base}${imgUrl}` : `${base}/${imgUrl.replace(/^\/+/, "")}`;
                            })()}
                            alt={car.ModelName || car.modelName || "Car"}
                            className="w-32 h-24 rounded-xl object-cover bg-neutral-100"
                            onError={(e) => {
                                e.target.src = "https://placehold.co/200x150?text=Car";
                                e.target.onerror = null;
                            }}
                        />

                        <div className="text-sm space-y-1">
                            <p><strong>Xe:</strong> {car.ModelName || car.modelName || car.CarName || car.carName || "N/A"}</p>
                            <p><strong>Hãng:</strong> {car.Brand || car.brand || "N/A"}</p>
                            <p><strong>Biển số:</strong> {car.PlateNumber || car.plateNumber || "N/A"}</p>
                            <p><strong>Giá:</strong> {formatUSD(car.DailyRate || car.dailyRate || car.DailyRate || 0)}/ngày</p>
                        </div>
                    </div>
                </div>
            )}

            {/* BOOKING DETAILS */}
            <div className="mt-8 border rounded-xl p-6 bg-white">
                <h2 className="text-xl font-bold mb-4">Chi Tiết Đặt Xe</h2>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <p className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
                        <div>
                            <strong>Pickup Date & Time:</strong>
                            <div className="text-neutral-700 mt-1">
                                {formatDateTime(booking.pickupDate, booking.pickupTime)}
                            </div>
                        </div>
                    </p>

                    <p className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
                        <div>
                            <strong>Dropoff Date & Time:</strong>
                            <div className="text-neutral-700 mt-1">
                                {formatDateTime(booking.dropoffDate, booking.dropoffTime)}
                            </div>
                        </div>
                    </p>

                    <p className="flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-primary-600" />
                        <strong>Nhận xe:</strong> {booking.pickupLocation}
                    </p>

                    <p className="flex items-center gap-2">
                        <MapPinIcon className="w-5 h-5 text-primary-600" />
                        <strong>Trả xe:</strong> {booking.dropoffLocation}
                    </p>
                </div>
            </div>

            {/* CUSTOMER INFO */}
            <div className="mt-8 border rounded-xl p-6 bg-neutral-50">
                <h2 className="text-xl font-bold mb-4">Thông Tin Khách Hàng</h2>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <p className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-primary-600" />
                        <strong>Họ tên:</strong> {booking.fullName}
                    </p>

                    <p className="flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-primary-600" />
                        <strong>SĐT:</strong> {booking.phone}
                    </p>

                    <p className="flex items-center gap-2">
                        <EnvelopeIcon className="w-5 h-5 text-primary-600" />
                        <strong>Email:</strong> {booking.email}
                    </p>

                    <p>
                        <strong>CMND/CCCD:</strong> {booking.citizenId || "—"}
                    </p>
                </div>
            </div>

            {/* PAYMENT SUMMARY */}
            <div className="mt-8 border rounded-xl p-6 bg-white">
                <h2 className="text-xl font-bold mb-4">Thanh Toán</h2>

                <div className="text-sm space-y-2">
                    <p>
                        <strong>Phương thức:</strong>{" "}
                        <span className="text-primary-700 font-semibold">
                            {paymentMethodLabel}
                        </span>
                    </p>

                    <p>
                        <strong>Total Amount:</strong>{" "}
                        <span className="text-primary-700 text-lg font-bold">
                            {formatUSD(booking.TotalAmount || 0)}
                        </span>
                    </p>
                </div>

                {booking.paymentMethod === "OFFICE" && (
                    <div className="mt-5 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                        <h3 className="text-yellow-700 font-semibold flex items-center gap-2">
                            <ClockIcon className="w-6 h-6" />
                            Pay at Office
                        </h3>
                        <p className="text-sm mt-1 text-neutral-700">
                            Please visit our office to complete payment within <strong>24 hours</strong>.
                        </p>
                        <p className="text-sm font-bold mt-2">
                            Payment Deadline: <span className="text-primary-700">{deadline}</span>
                        </p>
                        <p className="text-xs text-neutral-600 mt-2">
                            ⚠ Your booking will be automatically cancelled if payment is not received by the deadline.
                        </p>
                    </div>
                )}

                {booking.paymentMethod === "MOMO" && (
                    <div className="mt-5 p-4 bg-purple-50 border border-purple-300 rounded-lg">
                        <p className="text-purple-700 font-semibold">
                            Vui lòng thanh toán qua MoMo để hoàn tất đơn hàng.
                        </p>
                        <Link
                            to="/payment/momo"
                            state={{ booking, car }}
                            className="mt-3 inline-block bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold"
                        >
                            Thanh toán MoMo
                        </Link>
                    </div>
                )}

                {booking.paymentMethod === "PAYPAL" && (
                    <div className="mt-5 p-4 bg-blue-50 border border-blue-300 rounded-lg">
                        <p className="text-blue-700 font-semibold">
                            Vui lòng thanh toán qua PayPal để hoàn tất đơn hàng.
                        </p>
                        <Link
                            to="/payment/paypal"
                            state={{ booking, car }}
                            className="mt-3 inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
                        >
                            Thanh toán PayPal
                        </Link>
                    </div>
                )}
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col md:flex-row gap-4 mt-10">
                {(booking.paymentMethod === "MOMO" ||
                    booking.paymentMethod === "PAYPAL") && (
                        <Link
                            to="/payment"
                            state={{ booking, car }}
                            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 text-center rounded-xl font-semibold"
                        >
                            Tiến hành thanh toán
                        </Link>
                    )}

                <Link
                    to="/my-car-bookings"
                    className="flex-1 border border-neutral-300 hover:bg-neutral-100 py-3 text-center rounded-xl"
                >
                    Xem lịch sử đặt xe
                </Link>
            </div>
        </div>
    );
}
