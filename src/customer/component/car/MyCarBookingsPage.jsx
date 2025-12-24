import { useEffect, useState, useMemo } from "react";
import { formatUSD } from "../../../utils/currency";
import { Link } from "react-router-dom";
import StatusBadge from "../bookings/StatusBadge";
import { getCurrentUser } from "../../../services/common/authService";
import { fetchCarBookingsByAccount, fetchCarBookingFull } from "../../../services/customer/carBookingService";
import { requestCarBookingRefund, getCarBookingRefund } from "../../../services/customer/refundService";
import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

import {
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import CarReview from "./CarReview";
import { submitCarReview } from "../../../services/customer/reviewService";
const ITEMS_PER_PAGE = 5;

export default function MyCarBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Search and filter state
    const [searchKeyword, setSearchKeyword] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Refund modal state
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedBookingForRefund, setSelectedBookingForRefund] = useState(null);
    const [refundForm, setRefundForm] = useState({
        bankName: "",
        bankAccount: "",
        accountHolder: "",
        note: "",
    });
    const [refundLoading, setRefundLoading] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const now = Date.now();

    // Debounce search keyword
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchKeyword.trim());
            setPage(1); // Reset to first page when search changes
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    useEffect(() => {
        const load = async () => {
            const user = getCurrentUser();
            const accountID = user?.accountID || user?.AccountID;
            if (!accountID) {
                setError("Please log in to view your car bookings.");
                return;
            }
            setLoading(true);
            setError("");
            try {
                const res = await fetchCarBookingsByAccount({
                    page: page - 1,
                    size: ITEMS_PER_PAGE,
                    accountID,
                    keyword: debouncedSearch || undefined,
                    status: selectedStatus || undefined
                });

                const items = res.items || [];

                // Get full info for each booking to have car details
                const fullList = await Promise.all(
                    items.map(async (b) => {
                        try {
                            const full = await fetchCarBookingFull(b.carBookingID);
                            return mapFullToUI(full);
                        } catch {
                            return mapBasicToUI(b);
                        }
                    })
                );

                setBookings(fullList);
                setTotalPages(res.totalPages || 1);
                setTotal(res.total || 0);
            } catch (err) {
                setError(err.message || "Unable to load car bookings.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, debouncedSearch, selectedStatus]);

    const mapBasicToUI = (b) => ({
        CarBookingID: b.carBookingID || b.CarBookingID,
        carBookingID: b.carBookingID || b.CarBookingID,
        BookingCode: b.bookingCode || b.BookingCode,
        PaymentStatus: b.paymentStatus === 1 ? "Paid" : "Pending",
        BookingStatus: b.bookingStatus || b.BookingStatus,
        CancelDeadline: b.cancelDeadline || b.CancelDeadline,
        PickupDate: b.pickupDate || b.PickupDate,
        DropoffDate: b.dropoffDate || b.DropoffDate,
        PickupTime: "",
        DropoffTime: "",
        CarName: "Car",
        CarImageUrl: "/car.png",
        FinalTotal: Number(b.finalTotal ?? b.FinalTotal ?? 0),
    });

    const mapFullToUI = (full) => {
        const b = full.booking;
        const car = full.car;
        return {
            CarBookingID: b.carBookingID || b.CarBookingID,
            carBookingID: b.carBookingID || b.CarBookingID,
            BookingCode: b.bookingCode || b.BookingCode,
            PaymentStatus: b.paymentStatus === 1 ? "Paid" : "Pending",
            BookingStatus: b.bookingStatus || b.BookingStatus,
            CancelDeadline: b.cancelDeadline || b.CancelDeadline,
            PickupDate: b.pickupDate || b.PickupDate,
            DropoffDate: b.dropoffDate || b.DropoffDate,
            PickupTime: "",
            DropoffTime: "",
            CarName: car?.modelName || car?.ModelName || "Car",
            CarImageUrl: car?.image || car?.Image || car?.carImg || "/car.png",
            FinalTotal: Number(b.finalTotal ?? b.FinalTotal ?? 0),
        };
    };

    const getStatus = (b) => {
        const pickup = b.PickupDate ? new Date(b.PickupDate).getTime() : 0;
        const drop = b.DropoffDate ? new Date(b.DropoffDate).getTime() : 0;

        if (b.PaymentStatus === "Paid") {
            return now > drop ? "Completed" : "Paid";
        }

        if (b.PaymentStatus === "Pending") {
            const expire = b.CancelDeadline ? new Date(b.CancelDeadline).getTime() : 0;
            return now > expire ? "Expired" : "Pending";
        }

        if (b.BookingStatus === 3) return "Cancelled";
        return "Pending";
    };

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages) {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const calculateRefundPercentage = (pickupDate) => {
        if (!pickupDate) return 95;
        const now = new Date();
        const pickup = new Date(pickupDate);
        const diffInMillis = pickup.getTime() - now.getTime();
        const daysBefore = Math.ceil(diffInMillis / (1000 * 60 * 60 * 24));

        if (daysBefore >= 5) return 95;
        if (daysBefore === 4) return 90;
        if (daysBefore === 3) return 85;
        if (daysBefore === 2) return 80;
        if (daysBefore === 1) return 75;
        return 0;
    };

    const handleOpenRefundModal = async (booking) => {
        if (booking.PaymentStatus !== "Paid") {
            setToastMessage("Only paid bookings can request refund");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }

        if (booking.BookingStatus === 5) {
            setToastMessage("This booking is already refunded");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }

        // Check if already has refund request
        try {
            const existingRefund = await getCarBookingRefund(booking.carBookingID);
            if (existingRefund) {
                setToastMessage("Refund request already exists for this booking");
                setTimeout(() => setToastMessage(""), 3000);
                return;
            }
        } catch (err) {
            // No refund exists, continue
        }

        const percentage = calculateRefundPercentage(booking.PickupDate);
        if (percentage === 0) {
            setToastMessage("Cannot request refund less than 1 day before pickup date");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }

        const amount = (booking.FinalTotal * percentage) / 100;

        setSelectedBookingForRefund(booking);
        setRefundForm({
            bankName: "",
            bankAccount: "",
            accountHolder: "",
            note: "",
        });
        setShowRefundModal(true);
    };

    const handleRefundSubmit = async () => {
        if (!selectedBookingForRefund) return;

        if (!refundForm.bankName.trim() || !refundForm.bankAccount.trim() || !refundForm.accountHolder.trim()) {
            setToastMessage("Please fill in all bank details");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }

        setRefundLoading(true);
        try {
            const percentage = calculateRefundPercentage(selectedBookingForRefund.PickupDate);
            const amount = (selectedBookingForRefund.FinalTotal * percentage) / 100;

            await requestCarBookingRefund({
                bookingID: selectedBookingForRefund.carBookingID,
                bankName: refundForm.bankName,
                bankAccount: refundForm.bankAccount,
                accountHolder: refundForm.accountHolder,
                note: refundForm.note || "",
            });

            setToastMessage("Refund request submitted successfully!");
            setTimeout(() => setToastMessage(""), 3000);
            setShowRefundModal(false);
            setSelectedBookingForRefund(null);

            // Reload bookings
            const user = getCurrentUser();
            const accountID = user?.accountID || user?.AccountID;
            if (accountID) {
                const res = await fetchCarBookingsByAccount({
                    page: page - 1,
                    size: ITEMS_PER_PAGE,
                    accountID,
                    keyword: debouncedSearch || undefined,
                    status: selectedStatus || undefined
                });
                const items = res.items || [];
                const fullList = await Promise.all(
                    items.map(async (b) => {
                        try {
                            const full = await fetchCarBookingFull(b.carBookingID);
                            return mapFullToUI(full);
                        } catch {
                            return mapBasicToUI(b);
                        }
                    })
                );
                setBookings(fullList);
                setTotalPages(res.totalPages || 1);
                setTotal(res.total || 0);
            }
        } catch (err) {
            setToastMessage(err.message || "Failed to submit refund request");
            setTimeout(() => setToastMessage(""), 3000);
        } finally {
            setRefundLoading(false);
        }
    };

    const statusOptions = [
        { label: "All Status", value: null },
        { label: "Pending (Unpaid)", value: 0 },
        { label: "Booked (Paid)", value: 1 },
        { label: "In Progress", value: 2 },
        { label: "Completed", value: 3 },
        { label: "Cancelled", value: 3 },
    ];

    return (
        <div className="px-4 py-12 mt-20 max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-neutral-800">My Car Bookings</h1>

            {/* SEARCH BAR */}
            <div className="mb-6">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by booking code..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* FILTER BAR */}
            <div className="mb-6 flex flex-wrap items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    <FilterDropdown
                        label="Status"
                        badge={selectedStatus !== null ? 1 : 0}
                        options={statusOptions}
                        selected={selectedStatus}
                        onChange={(v) => { setSelectedStatus(v); setPage(1); }}
                    />
                </div>

                {/* Results count */}
                {!loading && (
                    <div className="text-sm text-neutral-600">
                        Showing {bookings.length} of {total} booking{total !== 1 ? 's' : ''}
                        {(debouncedSearch || selectedStatus !== null) && ' (filtered)'}
                    </div>
                )}

                {/* Clear filters */}
                {(selectedStatus !== null || debouncedSearch) && (
                    <button
                        onClick={() => {
                            setSelectedStatus(null);
                            setSearchKeyword("");
                            setPage(1);
                        }}
                        className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 py-3 px-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {loading && (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading bookings...</p>
                </div>
            )}

            {!loading && !error && bookings.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">No bookings found.</p>
                    {(debouncedSearch || selectedStatus !== null) && (
                        <p className="text-gray-400 text-sm mt-2">Try adjusting your filters.</p>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookings.map((b) => {
                    const status = getStatus(b);

                    return (
                        <div
                            key={b.CarBookingID || b.carBookingID}
                            className="bg-white rounded-2xl border shadow hover:shadow-lg transition flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center px-6 py-4 bg-neutral-50 border-b">
                                <div>
                                    <p className="text-xs text-gray-400">Booking Code</p>
                                    <p className="font-bold text-xl">{b.BookingCode}</p>
                                </div>
                                <StatusBadge status={status} />
                            </div>

                            {/* Body */}
                            <div className="p-6 flex flex-col gap-4 flex-1">
                                <img
                                    src={b.CarImageUrl || "/car.png"}
                                    className="w-full h-48 rounded-xl object-cover border shadow"
                                    onError={(e) => {
                                        e.target.src = "https://placehold.co/400x300?text=Car";
                                        e.target.onerror = null;
                                    }}
                                />

                                <div className="flex-1 text-sm space-y-2">
                                    <p className="text-xl font-bold">{b.CarName}</p>

                                    <p>
                                        <strong>Pickup:</strong>{" "}
                                        {new Date(b.PickupDate).toLocaleDateString()}{" "}
                                        {b.PickupTime}
                                    </p>

                                    <p>
                                        <strong>Dropoff:</strong>{" "}
                                        {new Date(b.DropoffDate).toLocaleDateString()}{" "}
                                        {b.DropoffTime}
                                    </p>

                                    <p>
                                        <strong>Total:</strong>{" "}
                                        <span className="font-bold text-primary-700 text-lg">
                                            {formatUSD(b.FinalTotal)}
                                        </span>
                                    </p>

                                    {status === "Pending" && b.CancelDeadline && (
                                        <p className="text-sm text-red-600">
                                            Pay before:{" "}
                                            {new Date(b.CancelDeadline).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 px-6 pb-6 mt-auto">
                                {status === "Pending" && (
                                    <Link
                                        to="/car-payment"
                                        state={{ booking: b }}
                                        className="w-full text-center px-5 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                                    >
                                        Pay Now
                                    </Link>
                                )}

                                {status === "Paid" && b.BookingStatus !== 5 && (
                                    <button
                                        onClick={() => handleOpenRefundModal(b)}
                                        className="w-full px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
                                    >
                                        <ArrowPathIcon className="w-5 h-5" />
                                        Request Refund
                                    </button>
                                )}

                                <Link
                                    to="/car-booking-detail"
                                    state={{ booking: b }}
                                    className="w-full text-center px-5 py-2 border rounded-lg hover:bg-neutral-100 transition"
                                >
                                    View Details
                                </Link>
                            </div>

                            {status === "Completed" && (
                                <div className="px-6 pb-6">
                                    <CarReview
                                        carBookingID={b.carBookingID}
                                        onSubmit={submitCarReview}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* REFUND MODAL */}
            {showRefundModal && selectedBookingForRefund && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Request Refund</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Booking Code</label>
                                <p className="text-gray-700">{selectedBookingForRefund.BookingCode}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Total Amount</label>
                                <p className="text-gray-700 font-semibold">{formatUSD(selectedBookingForRefund.FinalTotal)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Pickup Date</label>
                                <p className="text-gray-700">{new Date(selectedBookingForRefund.PickupDate).toLocaleDateString()}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Refund Percentage</label>
                                <p className="text-gray-700 font-semibold">{calculateRefundPercentage(selectedBookingForRefund.PickupDate)}%</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Based on {Math.ceil((new Date(selectedBookingForRefund.PickupDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days before pickup
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Estimated Refund Amount</label>
                                <p className="text-gray-700 font-semibold text-lg">
                                    {formatUSD((selectedBookingForRefund.FinalTotal * calculateRefundPercentage(selectedBookingForRefund.PickupDate)) / 100)}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Bank Name *</label>
                                <input
                                    type="text"
                                    value={refundForm.bankName}
                                    onChange={(e) => setRefundForm({ ...refundForm, bankName: e.target.value })}
                                    placeholder="Enter bank name"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Bank Account Number *</label>
                                <input
                                    type="text"
                                    value={refundForm.bankAccount}
                                    onChange={(e) => setRefundForm({ ...refundForm, bankAccount: e.target.value })}
                                    placeholder="Enter account number"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Account Holder Name *</label>
                                <input
                                    type="text"
                                    value={refundForm.accountHolder}
                                    onChange={(e) => setRefundForm({ ...refundForm, accountHolder: e.target.value })}
                                    placeholder="Enter account holder name"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Reason (Optional)</label>
                                <textarea
                                    value={refundForm.note}
                                    onChange={(e) => setRefundForm({ ...refundForm, note: e.target.value })}
                                    placeholder="Enter reason for refund..."
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRefundModal(false);
                                    setSelectedBookingForRefund(null);
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                disabled={refundLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRefundSubmit}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                disabled={refundLoading}
                            >
                                {refundLoading ? "Submitting..." : "Submit Request"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TOAST */}
            {toastMessage && (
                <div className="fixed top-6 right-6 z-[9999] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-in">
                    {toastMessage}
                </div>
            )}

            {/* PAGINATION */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-center mt-10 gap-2">
                    <button
                        onClick={() => goToPage(page - 1)}
                        disabled={page === 1}
                        className={`px-3 py-1 rounded-lg border text-sm ${page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-primary-100"
                            }`}
                    >
                        Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                            pageNum = i + 1;
                        } else if (page <= 3) {
                            pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                        } else {
                            pageNum = page - 2 + i;
                        }
                        return pageNum;
                    }).map(num => (
                        <button
                            key={num}
                            onClick={() => goToPage(num)}
                            className={`px-3 py-1 rounded-lg border text-sm ${page === num ? "bg-primary-600 text-white" : "hover:bg-primary-100"
                                }`}
                        >
                            {num}
                        </button>
                    ))}

                    <button
                        onClick={() => goToPage(page + 1)}
                        disabled={page === totalPages}
                        className={`px-3 py-1 rounded-lg border text-sm ${page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-primary-100"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}

/* ===============================
   FILTER DROPDOWN COMPONENT
================================ */
function FilterDropdown({ label, options, selected, onChange, badge }) {
    const isSelected = selected !== null && selected !== undefined;

    const selectedLabel = options.find(opt => opt.value === selected)?.label || label;

    return (
        <Menu as="div" className="relative inline-block text-left">
            <MenuButton className="flex items-center gap-1 text-neutral-700 hover:text-black px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition">
                {selectedLabel}
                {badge > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-primary-600 text-white rounded-full">
                        {badge}
                    </span>
                )}
                <ChevronDownIcon className="h-4 w-4 text-neutral-500" />
            </MenuButton>

            <MenuItems className="absolute left-0 mt-2 w-56 bg-white shadow-xl rounded-xl p-2 z-20 max-h-64 overflow-y-auto">
                {options.map(opt => {
                    const isChecked = selected === opt.value || (opt.value === null && !isSelected);
                    return (
                        <MenuItem key={opt.value ?? 'all'}>
                            <button
                                onClick={() => onChange(opt.value === null ? null : (opt.value === selected ? null : opt.value))}
                                className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 transition ${isChecked ? 'bg-primary-50 text-primary-700 font-medium' : ''
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={isChecked}
                                    className="cursor-pointer"
                                />
                                <span>{opt.label}</span>
                            </button>
                        </MenuItem>
                    );
                })}
            </MenuItems>
        </Menu>
    );
}
