import { useLocation, Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ClockIcon,
    EnvelopeIcon,
    UserIcon,
    PhoneIcon,
    MapPinIcon,
    BuildingOfficeIcon,
} from "@heroicons/react/24/solid";
import { fetchBookingFullByOrderCode } from "../../../services/customer/bookingService";

export default function BookingSuccessPage() {
    const { state } = useLocation();
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [booking, setBooking] = useState(state?.payload || null);
    const [tour, setTour] = useState(state?.tour || null);
    const [details, setDetails] = useState(state?.details || null);

    // If not in state, try to fetch from API using orderCode from URL
    const orderCode = searchParams.get("orderCode");
    const paymentMethodFromUrl = searchParams.get("paymentMethod");

    useEffect(() => {
        const loadBooking = async () => {
            // If we have orderCode but no booking data, fetch it
            if (orderCode && !booking) {
                setLoading(true);
                try {
                    const bookingData = await fetchBookingFullByOrderCode(orderCode);
                    // Map the data to match the expected format
                    const mappedBooking = {
                        ...bookingData.booking,
                        OrderCode: bookingData.booking.orderCode,
                        OrderTotal: bookingData.booking.orderTotal,
                        CapacityAdult: bookingData.booking.adultCount,
                        CapacityKid: bookingData.booking.childCount || 0,
                        CapacityBaby: bookingData.booking.infantCount || 0,
                        PaymentMethod: paymentMethodFromUrl || bookingData.booking.paymentMethod || "PAYPAL",
                        CustomerName: bookingData.customer?.customerName || "",
                        CustomerPhone: bookingData.customer?.customerPhone || "",
                        CustomerEmail: bookingData.customer?.customerEmail || "",
                    };
                    setBooking(mappedBooking);
                    setTour(bookingData.tour);
                    setDetails(bookingData.tourDetail);
                } catch (error) {
                    console.error("Error loading booking:", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        loadBooking();
    }, [orderCode, booking, paymentMethodFromUrl]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading booking information...</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="max-w-xl mx-auto text-center py-20">
                <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto" />
                <p className="text-gray-600 mt-4">No booking information found.</p>
            </div>
        );
    }

    // Override payment method if provided in URL (for PayPal/MoMo returns)
    const finalPaymentMethod = paymentMethodFromUrl || booking?.PaymentMethod;

    const unitPrice = details?.unitPrice ?? details?.UnitPrice ?? 0;

    const created = new Date();
    const expire = new Date(created.getTime() + 24 * 60 * 60 * 1000);
    const deadline = expire.toLocaleString("en-US");

    // Payment method mapping
    const getPaymentMethodLabel = (method) => {
        if (typeof method === "string") {
            const map = {
                "COD": "Cash on Delivery (COD)",
                "MOMO": "MoMo Wallet",
                "PAYPAL": "PayPal"
            };
            return map[method] || method;
        }
        // Legacy numeric mapping
        const map = {
            1: "Credit Card",
            2: "Cash",
            3: "Bank Transfer"
        };
        return map[method] || "Unknown";
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4 lg:px-6">
                <div className="bg-white border rounded-2xl shadow-xl p-6 lg:p-10">

                    {/* SUCCESS HEADER */}
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon className="w-12 h-12 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Booking Successfully Created!</h1>
                        <p className="text-gray-600 mt-2">Thank you for choosing our tour service.</p>
                    </div>

                    {/* TOUR INFO */}
                    {tour && details && (
                        <div className="mt-8 border rounded-xl p-6 bg-gray-50">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <BuildingOfficeIcon className="w-6 h-6 text-primary-600" />
                                Tour Information
                            </h2>

                            <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                                <p><strong>Tour:</strong> {tour.tourName || tour.TourName}</p>
                                <p><strong>Tour Code:</strong> {tour.tourCode || tour.TourCode}</p>
                                <p><strong>Departure Date:</strong> {new Date(details.departureDate || details.DepartureDate).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}</p>
                                <p><strong>Return Date:</strong> {new Date(details.arrivalDate || details.ArrivalDate).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}</p>
                                {(tour.startingLocation || tour.StartingLocation) && (
                                    <p className="flex items-center gap-2">
                                        <MapPinIcon className="w-4 h-4 text-primary-600" />
                                        <strong>Starting Location:</strong> {tour.startingLocation || tour.StartingLocation}
                                    </p>
                                )}
                                {(tour.duration || tour.Duration) && (
                                    <p><strong>Duration:</strong> {tour.duration || tour.Duration}</p>
                                )}
                            </div>

                            {/* Tour Route Cities */}
                            {(tour.tourCities || tour.TourCities) && (tour.tourCities || tour.TourCities).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-300">
                                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                        <MapPinIcon className="w-5 h-5 text-primary-600" />
                                        Tour Route:
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {(tour.tourCities || tour.TourCities || [])
                                            .sort((a, b) => (a.cityOrder || a.CityOrder || 0) - (b.cityOrder || b.CityOrder || 0))
                                            .map((city, index) => (
                                                <span key={city.cityID || city.CityID || index} className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm">
                                                    <span className="text-primary-600 font-medium">{city.cityName || city.CityName}</span>
                                                    {(city.stayDays || city.StayDays) > 0 && (
                                                        <span className="text-gray-500 text-xs">({city.stayDays || city.StayDays} {(city.stayDays || city.StayDays) === 1 ? 'day' : 'days'})</span>
                                                    )}
                                                    {index < (tour.tourCities || tour.TourCities || []).length - 1 && (
                                                        <span className="text-gray-400 mx-1">→</span>
                                                    )}
                                                </span>
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Attractions from Schedules */}
                            {(details.schedules || details.Schedules) && (details.schedules || details.Schedules).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-300">
                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                                        Attractions to Visit:
                                    </h3>
                                    <div className="space-y-2">
                                        {(details.schedules || details.Schedules)
                                            .flatMap(schedule => schedule.items || schedule.Items || [])
                                            .filter(item => item.attractionName || item.AttractionName)
                                            .map((item, index) => (
                                                <div key={item.itemID || item.ItemID || index} className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200">
                                                    <MapPinIcon className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{item.attractionName || item.AttractionName}</p>
                                                        {(item.cityName || item.CityName) && (
                                                            <p className="text-xs text-gray-600">📍 {item.cityName || item.CityName}</p>
                                                        )}
                                                        {(item.attractionAddress || item.AttractionAddress) && (
                                                            <p className="text-xs text-gray-500 mt-0.5">{item.attractionAddress || item.AttractionAddress}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        {(details.schedules || details.Schedules)
                                            .flatMap(schedule => schedule.items || schedule.Items || [])
                                            .filter(item => item.attractionName || item.AttractionName).length === 0 && (
                                            <p className="text-sm text-gray-500 italic">No specific attractions listed in the schedule.</p>
                                        )}
                                    </div>
                                </div>
                            )}
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
                                <strong>Payment Method:</strong> {getPaymentMethodLabel(finalPaymentMethod)}
                            </p>
                        </div>
                    </div>

                    {/* PASSENGER TABLE */}
                    <div className="mt-8 border rounded-xl p-6 bg-white shadow-sm">
                        <h2 className="text-xl font-bold mb-4">Passenger Breakdown</h2>

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

                    {/* PAYMENT STATUS */}
                    {(finalPaymentMethod === "PAYPAL" || finalPaymentMethod === "MOMO") ? (
                        <div className="mt-8 p-6 bg-green-50 border border-green-300 rounded-xl">
                            <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                                <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                Payment Completed
                            </h3>
                            <p className="text-sm mt-2 text-gray-800">
                                Your {getPaymentMethodLabel(finalPaymentMethod)} payment has been successfully processed. 
                                Your booking is now confirmed.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-300 rounded-xl">
                            <h3 className="text-lg font-semibold text-yellow-800 flex items-center gap-2">
                                <ClockIcon className="w-6 h-6 text-yellow-600" />
                                Payment Required
                            </h3>
                            <p className="text-sm mt-2 text-gray-800">
                                Please complete payment within <strong>24 hours</strong>.
                                If not, booking will be automatically cancelled.
                            </p>
                            <p className="mt-3 font-bold text-gray-900 text-sm">
                                Payment Deadline:{" "}
                                <span className="text-primary-700">{deadline}</span>
                            </p>
                        </div>
                    )}

                    {/* BUTTONS */}
                    <div className="flex flex-col md:flex-row gap-4 mt-10">
                        {(finalPaymentMethod === "COD" || !finalPaymentMethod) && (
                            <Link
                                to="/payment"
                                state={{ booking, tour, details }}
                                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 text-center rounded-xl font-medium transition"
                            >
                                Pay Now
                            </Link>
                        )}

                        <Link
                            to="/my-tour-bookings"
                            className={`flex-1 border border-neutral-200 hover:bg-neutral-50 py-3 text-center rounded-xl font-medium transition ${
                                (finalPaymentMethod === "COD" || !finalPaymentMethod) ? "" : "md:flex-1"
                            }`}
                        >
                            View My Bookings
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

