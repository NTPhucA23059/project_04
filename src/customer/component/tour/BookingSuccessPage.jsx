import { useLocation, Link } from "react-router-dom";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    EnvelopeIcon,
    UserIcon,
    PhoneIcon,
} from "@heroicons/react/24/solid";

export default function BookingSuccessPage() {
    const { state } = useLocation();

    const booking = state?.payload;
    const tour = state?.tour;
    const details = state?.details;

    if (!booking) {
        return (
            <div className="max-w-xl mx-auto text-center py-20">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto" />
                <p className="text-gray-600 mt-4">No booking information found.</p>
            </div>
        );
    }

    const unitPrice = details?.UnitPrice ?? 0;

    const created = new Date();
    const expire = new Date(created.getTime() + 24 * 60 * 60 * 1000);
    const deadline = expire.toLocaleString("en-US");

    // const totalGuests =
    //     booking.CapacityAdult + booking.CapacityKid + booking.CapacityBaby;

    return (
        <div className="max-w-4xl mx-auto mt-16 px-6 py-10 bg-white border rounded-2xl shadow-xl">

            {/* SUCCESS HEADER */}
            <div className="text-center">
                <img
                    src="/public/logo1.png"
                    alt="Booking Success"
                    className="w-32 h-32 mx-auto mt-4"
                />
                <h1 className="text-3xl font-bold mt-3">Booking Successfully Created!</h1>
                <p className="text-gray-600 mt-1">Thank you for choosing our tour.</p>
            </div>

            {/* TOUR INFO */}
            {tour && details && (
                <div className="mt-8 border rounded-xl p-6 bg-gray-50">
                    <h2 className="text-xl font-bold mb-3">Tour Information</h2>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <p><strong>Tour:</strong> {tour.TourName}</p>
                        <p><strong>Tour Code:</strong> {tour.TourCode}</p>
                        <p><strong>Departure:</strong> {new Date(details.DepartureDate).toLocaleDateString()}</p>
                        <p><strong>From:</strong> {details.FromLocation}</p>
                        <p><strong>To:</strong> {details.ToLocation}</p>
                        <p><strong>Duration:</strong> {tour.Duration}</p>
                    </div>
                </div>
            )}

            {/* CUSTOMER INFO */}
            <div className="mt-8 border rounded-xl p-6 bg-neutral-50">
                <h2 className="text-xl font-bold mb-4">Customer Information</h2>

                <div className="grid md:grid-cols-2 gap-4 text-sm text-neutral-800">
                    <p className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-primary-600" />
                        <strong>Name:</strong> {booking.CustomerName}
                    </p>

                    <p className="flex items-center gap-2">
                        <PhoneIcon className="w-5 h-5 text-primary-600" />
                        <strong>Phone:</strong> {booking.CustomerPhone}
                    </p>

                    <p className="flex items-center gap-2">
                        <EnvelopeIcon className="w-5 h-5 text-primary-600" />
                        <strong>Email:</strong> {booking.CustomerEmail}
                    </p>

                    <p className="flex items-center gap-2">
                        <strong>Payment:</strong>{" "}
                        {booking.PaymentMethod === 1
                            ? "Credit Card"
                            : booking.PaymentMethod === 2
                                ? "Cash"
                                : "Bank Transfer"}
                    </p>
                </div>
            </div>

            {/* PASSENGER TABLE */}
            <div className="mt-8 border rounded-xl p-6 bg-white shadow-sm">
                <h2 className="text-xl font-bold">Passenger Breakdown</h2>

                <div className="overflow-x-auto">
                    <table className="w-full border text-sm">
                        <thead className="bg-neutral-100 text-neutral-700">
                            <tr>
                                <th className="p-2 border w-12">#</th>
                                <th className="p-2 border text-left">Passenger Type</th>
                                <th className="p-2 border">Qty</th>
                                <th className="p-2 border">Unit Price</th>
                                <th className="p-2 border">Subtotal</th>
                            </tr>
                        </thead>

                        <tbody>
                            {/* Adult */}
                            <tr>
                                <td className="border p-2 text-center">1</td>
                                <td className="border p-2">Adult</td>
                                <td className="border p-2 text-center">{booking.CapacityAdult}</td>
                                <td className="border p-2 text-center">${unitPrice.toLocaleString()}</td>
                                <td className="border p-2 text-right font-semibold">
                                    ${(booking.CapacityAdult * unitPrice).toLocaleString()}
                                </td>
                            </tr>

                            {/* Kid */}
                            {booking.CapacityKid > 0 && (
                                <tr>
                                    <td className="border p-2 text-center">2</td>
                                    <td className="border p-2">Child (70%)</td>
                                    <td className="border p-2 text-center">{booking.CapacityKid}</td>
                                    <td className="border p-2 text-center">${(unitPrice * 0.7).toFixed(0)}</td>
                                    <td className="border p-2 text-right font-semibold">
                                        ${(booking.CapacityKid * unitPrice * 0.7).toLocaleString()}
                                    </td>
                                </tr>
                            )}

                            {/* Baby */}
                            {booking.CapacityBaby > 0 && (
                                <tr>
                                    <td className="border p-2 text-center">3</td>
                                    <td className="border p-2">Infant (30%)</td>
                                    <td className="border p-2 text-center">{booking.CapacityBaby}</td>
                                    <td className="border p-2 text-center">${(unitPrice * 0.3).toFixed(0)}</td>
                                    <td className="border p-2 text-right font-semibold">
                                        ${(booking.CapacityBaby * unitPrice * 0.3).toLocaleString()}
                                    </td>
                                </tr>
                            )}
                        </tbody>

                        <tfoot>
                            <tr className="bg-primary-50 font-bold">
                                <td colSpan={4} className="p-2 border text-right">Total Amount</td>
                                <td className="p-2 border text-right text-primary-700 text-lg">
                                    ${booking.OrderTotal.toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* PAYMENT DEADLINE */}
            <div className="mt-8 p-6 bg-accent-50 border border-accent-300 rounded-xl">
                <h3 className="text-lg font-semibold text-accent-700 flex items-center gap-2">
                    <ClockIcon className="w-6 h-6 text-accent-500" />
                    Payment Required
                </h3>

                <p className="text-sm mt-2 text-neutral-800">
                    Please complete payment within <strong>24 hours</strong>.
                    If not, booking will be automatically cancelled.
                </p>

                <p className="mt-3 font-bold text-neutral-900 text-sm">
                    Payment Deadline:{" "}
                    <span className="text-primary-700">{deadline}</span>
                </p>
            </div>

            {/* BUTTONS */}
            <div className="flex flex-col md:flex-row gap-4 mt-10">
                <Link
                    to="/payment"
                    state={{ booking, tour, details }}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 text-center rounded-xl"
                >
                    Pay Now
                </Link>

                <Link
                    to="/my-tour-bookings"
                    className="flex-1 border border-neutral-200 hover:bg-neutral-50 py-3 text-center rounded-xl"
                >
                    View My Bookings
                </Link>
            </div>
        </div>
    );
}
