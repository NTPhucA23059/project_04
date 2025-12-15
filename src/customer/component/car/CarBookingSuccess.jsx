import { useLocation, Link } from "react-router-dom";
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

export default function CarBookingSuccess() {
    const { state } = useLocation();

    const booking = state?.payload;
    const car = state?.car;

    if (!booking || !car) {
        return (
            <div className="max-w-xl mx-auto text-center py-20">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto" />
                <p className="text-gray-600 mt-4">Không tìm thấy thông tin đặt xe.</p>
            </div>
        );
    }

    const created = new Date();
    const expire = new Date(created.getTime() + 24 * 60 * 60 * 1000);
    const deadline = expire.toLocaleString("vi-VN");

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
                <h1 className="text-3xl font-bold mt-3">Đặt Xe Thành Công!</h1>
                <p className="text-gray-600 mt-1">
                    Cảm ơn bạn đã tin tưởng sử dụng dịch vụ thuê xe của chúng tôi.
                </p>
            </div>

            {/* CAR INFO */}
            <div className="mt-8 border rounded-xl p-6 bg-neutral-50">
                <h2 className="text-xl font-bold mb-4">Thông Tin Xe</h2>

                <div className="flex gap-4">
                    <img
                        src={car.ImageUrl}
                        className="w-32 h-24 rounded-xl object-cover"
                    />

                    <div className="text-sm space-y-1">
                        <p><strong>Xe:</strong> {car.ModelName}</p>
                        <p><strong>Hãng:</strong> {car.Brand}</p>
                        <p><strong>Biển số:</strong> {car.PlateNumber}</p>
                        <p><strong>Giá:</strong> ${car.DailyRate}/ngày</p>
                    </div>
                </div>
            </div>

            {/* BOOKING DETAILS */}
            <div className="mt-8 border rounded-xl p-6 bg-white">
                <h2 className="text-xl font-bold mb-4">Chi Tiết Đặt Xe</h2>

                <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <p className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
                        <strong>Ngày nhận xe:</strong> {booking.pickupDate} - {booking.pickupTime}
                    </p>

                    <p className="flex items-center gap-2">
                        <CalendarDaysIcon className="w-5 h-5 text-primary-600" />
                        <strong>Ngày trả xe:</strong> {booking.dropoffDate} - {booking.dropoffTime}
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
                        <strong>Tổng tiền:</strong>{" "}
                        <span className="text-primary-700 text-lg font-bold">
                            ${booking.TotalAmount.toLocaleString()}
                        </span>
                    </p>
                </div>

                {booking.paymentMethod === "OFFICE" && (
                    <div className="mt-5 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                        <h3 className="text-yellow-700 font-semibold flex items-center gap-2">
                            <ClockIcon className="w-6 h-6" />
                            Thanh Toán Tại Quầy
                        </h3>
                        <p className="text-sm mt-1 text-neutral-700">
                            Bạn cần đến trụ sở để thanh toán trong vòng <strong>24 giờ</strong>.
                        </p>
                        <p className="text-sm font-bold mt-1">
                            Hạn thanh toán: <span className="text-primary-700">{deadline}</span>
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
