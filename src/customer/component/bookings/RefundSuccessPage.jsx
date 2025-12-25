import { useLocation, Link } from "react-router-dom";
import { CheckCircleIcon, ClockIcon, InformationCircleIcon } from "@heroicons/react/24/solid";
import { formatUSD } from "../../../utils/currency";

export default function RefundSuccessPage() {
    const { state } = useLocation();

    const refund = state?.refund;
    const booking = state?.booking;

    if (!refund || !booking) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 pb-12">
                <div className="max-w-2xl mx-auto px-4 lg:px-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                        <p className="text-gray-600">No refund information found.</p>
                        <Link
                            to="/my-tour-bookings"
                            className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Back to My Bookings
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-3xl mx-auto px-4 lg:px-6">
                {/* Success Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-6">
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <img src="/src/assets/img/logo.png" alt="Success" className="w-10 h-10" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Refund Request Submitted Successfully!
                        </h1>
                        <p className="text-gray-600">
                            Your refund request has been received and is pending staff review.
                        </p>
                    </div>
                </div>

                {/* Refund Information */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <InformationCircleIcon className="w-6 h-6 text-primary-600" />
                        Refund Details
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Booking Code</p>
                                <p className="font-semibold text-gray-900">{booking.OrderCode}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Tour Name</p>
                                <p className="font-semibold text-gray-900">{booking.TourName}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Refund Percentage</p>
                                <p className="font-semibold text-gray-900">
                                    {refund.refundPercentage || refund.RefundPercentage}%
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Refund Amount</p>
                                <p className="font-semibold text-green-700 text-lg">
                                    {formatUSD(refund.refundAmount || refund.RefundAmount || 0)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Request Date</p>
                                <p className="font-semibold text-gray-900">
                                    {formatDateTime(refund.cancelDate || refund.CancelDate)}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Status</p>
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                    <ClockIcon className="w-4 h-4" />
                                    Pending Review
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Processing Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <ClockIcon className="w-5 h-5" />
                        What Happens Next?
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Your refund request is being reviewed by our staff.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Processing time: 5-7 business days.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>Once approved, the refund will be transferred to your provided bank account.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span>You will receive a notification when the refund is processed.</span>
                        </li>
                    </ul>
                </div>

                {/* Bank Information */}
                {refund.bankInfo && (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-3">Bank Information</h3>
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="text-gray-500">Bank:</span>{" "}
                                <span className="font-medium">{refund.bankInfo.bankName}</span>
                            </p>
                            <p>
                                <span className="text-gray-500">Account Number:</span>{" "}
                                <span className="font-medium">{refund.bankInfo.bankAccount}</span>
                            </p>
                            <p>
                                <span className="text-gray-500">Account Holder:</span>{" "}
                                <span className="font-medium">{refund.bankInfo.accountHolder}</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        to="/my-tour-bookings"
                        className="flex-1 text-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                    >
                        View My Bookings
                    </Link>
                    <Link
                        to="/"
                        className="flex-1 text-center px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

