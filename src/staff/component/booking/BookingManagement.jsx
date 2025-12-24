import React, { useEffect, useMemo, useState } from "react";
import { 
    MagnifyingGlassIcon, 
    FunnelIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    MapPinIcon,
    EyeIcon,
    DocumentArrowDownIcon,
    BanknotesIcon,
    ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import StaffTourBookingPage from "./StaffTourBookingPage";
import * as bookingService from "../../../services/staff/bookingStaffService";
import { toast } from "../../shared/toast/toast";
import { useConfirm } from "../../shared/confirm/useConfirm";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";
import { getCurrentUser } from "../../../services/common/authService";

// Order Status mapping
const getOrderStatusText = (status) => {
    switch (status) {
        case 0: return "Pending Processing";
        case 1: return "Confirmed";
        case 2: return "On-going";
        case 3: return "Completed";
        case 4: return "Auto Cancelled";
        case 5: return "Refunded";
        default: return "Unknown";
    }
};

const getOrderStatusColor = (status) => {
    switch (status) {
        case 0: return "bg-orange-100 text-orange-700 border-orange-300";
        case 1: return "bg-blue-100 text-blue-700 border-blue-300";
        case 2: return "bg-indigo-100 text-indigo-700 border-indigo-300";
        case 3: return "bg-green-100 text-green-700 border-green-300";
        case 4: return "bg-red-200 text-red-700 border-red-400";
        case 5: return "bg-purple-200 text-purple-700 border-purple-400";
        default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
};

const getPaymentStatusText = (status) => {
    switch (status) {
        case 0: return "Pending";
        case 1: return "Paid";
        default: return "Unknown";
    }
};

const getPaymentStatusColor = (status) => {
    switch (status) {
        case 0: return "bg-amber-100 text-amber-800 border-amber-200";
        case 1: return "bg-green-100 text-green-800 border-green-200";
        default: return "bg-gray-100 text-gray-700 border-gray-300";
    }
};

export default function BookingManagement() {
    const [keyword, setKeyword] = useState("");
    const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
    const [selected, setSelected] = useState(null);
    const [view, setView] = useState("table"); // 'table' | 'book'
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [updatingPayment, setUpdatingPayment] = useState(null);
    const { confirm, dialog, handleConfirm, handleCancel } = useConfirm();

    const [pageSize, setPageSize] = useState(10);

    // Fetch bookings from backend
    useEffect(() => {
        fetchBookings();
    }, [page, pageSize, keyword, orderStatusFilter, paymentStatusFilter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const status = orderStatusFilter === "ALL" ? null : parseInt(orderStatusFilter);
            const response = await bookingService.searchBookings({
                page,
                size: pageSize,
                keyword: keyword || undefined,
                status,
            });

            // Backend returns { total, totalPages, page, size, items }
            const items = response.items || [];
            
            // Filter by payment status on frontend if needed
            let filteredItems = items;
            if (paymentStatusFilter !== "ALL") {
                const paymentStatus = paymentStatusFilter === "PAID" ? 1 : 0;
                filteredItems = items.filter(b => b.paymentStatus === paymentStatus);
            }

            setBookings(filteredItems);
            setTotal(response.total || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error) {
            console.error("Error fetching bookings:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to load bookings";
            toast.error(errorMessage);
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const kw = keyword.toLowerCase().trim();
        return bookings.filter((b) => {
            const matchKw =
                !kw ||
                (b.orderCode && b.orderCode.toLowerCase().includes(kw)) ||
                String(b.bookingID).includes(kw);
            return matchKw;
        });
    }, [keyword, bookings]);

    const totals = useMemo(() => {
        return filtered.reduce(
            (acc, b) => {
                acc.count += 1;
                acc.total += b.orderTotal || 0;
                acc.seats += (b.adultCount || 0) + (b.childCount || 0) + (b.infantCount || 0);
                return acc;
            },
            { count: 0, total: 0, seats: 0 }
        );
    }, [filtered]);

    const handleUpdatePaymentStatus = async (bookingID, paymentStatus) => {
        const isPaid = paymentStatus === 1;
        const confirmed = await confirm({
            title: isPaid ? "Confirm Payment Received" : "Mark as Pending",
            message: isPaid 
                ? "Are you sure the customer has paid at the office? This will update the payment status to 'Paid' and the order status to 'Confirmed', and create an invoice."
                : "Are you sure you want to mark this booking as 'Pending'?",
            confirmText: isPaid ? "Yes, Mark as Paid" : "Yes, Mark as Pending",
            cancelText: "Cancel",
            type: isPaid ? "success" : "warning"
        });

        if (!confirmed) {
            return;
        }

        // Get current staff accountID for processedBy
        const currentUser = getCurrentUser();
        const processedBy = currentUser?.accountID || currentUser?.AccountID || null;

        setUpdatingPayment(bookingID);
        try {
            await bookingService.updatePaymentStatus(bookingID, paymentStatus, processedBy);
            toast.success(isPaid 
                ? "Payment status updated successfully. Booking is now confirmed and invoice has been created." 
                : "Payment status updated to Pending.");
            fetchBookings(); // Refresh list
        } catch (error) {
            console.error("Error updating payment status:", error);
            toast.error(error.response?.data?.message || "Failed to update payment status");
        } finally {
            setUpdatingPayment(null);
        }
    };

    const handleViewDetails = async (booking) => {
        try {
            const fullBooking = await bookingService.getFullBookingById(booking.bookingID);
            // Backend returns BookingTourFullDTO directly
            setSelected(fullBooking);
        } catch (error) {
            console.error("Error fetching booking details:", error);
            const errorMessage = error.response?.data?.message || error.message || "Failed to load booking details";
            toast.error(errorMessage);
        }
    };

    const handleExportInvoice = (booking) => {
        if (!booking) return;
        const content = [
            "TOUR BOOKING INVOICE",
            `Booking ID: ${booking.bookingID}`,
            `Order Code: ${booking.orderCode || "N/A"}`,
            `Tour Detail ID: ${booking.tourDetailID}`,
            `Payment Method: ${booking.paymentMethod}`,
            `Payment Status: ${getPaymentStatusText(booking.paymentStatus)}`,
            `Order Status: ${getOrderStatusText(booking.orderStatus)}`,
            `Total Amount: ${(booking.orderTotal || 0).toLocaleString()} VND`,
            `Guests: ${(booking.adultCount || 0)} Adult(s), ${(booking.childCount || 0)} Child(ren), ${(booking.infantCount || 0)} Infant(s)`,
            `Created At: ${new Date(booking.createdAt).toLocaleString()}`,
            `Expires At: ${booking.expireAt ? new Date(booking.expireAt).toLocaleString() : "N/A"}`,
        ].join("\n");

        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${booking.bookingID}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                    Tour Bookings Management
                </h1>
                <p className="text-sm text-neutral-600 mt-1">
                    Manage all tour bookings, update payment status, and export invoices.
                </p>
                <div className="mt-4 flex gap-2">
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          view === "table"
                            ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                            : "bg-white text-neutral-700 border-neutral-200 hover:bg-primary-50 hover:border-primary-300"
                        }`}
                        onClick={() => setView("table")}
                    >
                        Booking List
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          view === "book"
                            ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                            : "bg-white text-neutral-700 border-neutral-200 hover:bg-primary-50 hover:border-primary-300"
                        }`}
                        onClick={() => setView("book")}
                    >
                        Book On Behalf
                    </button>
                </div>
            </div>

            {view === "table" && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                            <p className="text-xs text-neutral-600 font-medium">Total Bookings</p>
                            <p className="text-2xl font-bold mt-2 text-neutral-900">{totals.count}</p>
                        </div>
                        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                            <p className="text-xs text-neutral-600 font-medium">Total Guests</p>
                            <p className="text-2xl font-bold mt-2 text-neutral-900">{totals.seats}</p>
                        </div>
                        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                            <p className="text-xs text-neutral-600 font-medium">Total Revenue</p>
                            <p className="text-2xl font-bold mt-2 text-primary-600">
                                ${(totals.total || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                            <p className="text-xs text-neutral-600 font-medium">Total Records</p>
                            <p className="text-2xl font-bold mt-2 text-neutral-900">{total}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                        <div className="flex flex-1 gap-2 flex-wrap">
                            <div className="relative flex-1 min-w-[200px]">
                                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    className="border border-neutral-200 bg-white pl-10 pr-3 py-2 rounded-lg w-full text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                                    placeholder="Search by booking ID, order code..."
                                    value={keyword}
                                    onChange={(e) => {
                                        setKeyword(e.target.value);
                                        setPage(0);
                                    }}
                                />
                            </div>
                            <select
                                className="border px-3 py-2 rounded-lg w-full md:w-48 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                                value={orderStatusFilter}
                                onChange={(e) => {
                                    setOrderStatusFilter(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="ALL">All Order Status</option>
                                <option value="0">Pending Processing</option>
                                <option value="1">Confirmed</option>
                                <option value="2">On-going</option>
                                <option value="3">Completed</option>
                                <option value="4">Auto Cancelled</option>
                                <option value="5">Refunded</option>
                            </select>
                            <select
                                className="border px-3 py-2 rounded-lg w-full md:w-48 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                                value={paymentStatusFilter}
                                onChange={(e) => {
                                    setPaymentStatusFilter(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="ALL">All Payment Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="PAID">Paid</option>
                            </select>
                        </div>
                        <div className="text-sm text-gray-500">
                            {filtered.length} result(s)
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">Loading bookings...</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm min-w-[1000px]">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            {[
                                                "Booking ID",
                                                "Order Code",
                                                "Payment Method",
                                                "Status",
                                                "Total Amount",
                                                "Guests",
                                                "Actions",
                                            ].map((h) => (
                                                <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((b) => (
                                            <tr key={b.bookingID} className="border-t hover:bg-gray-50 transition">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="font-semibold">#{b.bookingID}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(b.createdAt).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="font-medium">{b.orderCode || "N/A"}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="font-medium">{b.paymentMethod || "N/A"}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getPaymentStatusColor(b.paymentStatus)}`}>
                                                            Payment: {getPaymentStatusText(b.paymentStatus)}
                                                        </span>
                                                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getOrderStatusColor(b.orderStatus)}`}>
                                                            Order: {getOrderStatusText(b.orderStatus)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="font-semibold text-green-700">
                                                        ${(b.orderTotal || 0).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm">
                                                        {b.adultCount || 0}A, {b.childCount || 0}C, {b.infantCount || 0}I
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <button
                                                            className="px-3 py-1.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                                                            onClick={() => handleViewDetails(b)}
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                            View
                                                        </button>
                                                        {b.paymentMethod === "COD" && b.paymentStatus === 0 && 
                                                         b.orderStatus !== 4 && b.orderStatus !== 5 && (
                                                            <button
                                                                className="px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition text-xs font-medium flex items-center gap-1 disabled:opacity-50 whitespace-nowrap"
                                                                onClick={() => handleUpdatePaymentStatus(b.bookingID, 1)}
                                                                disabled={updatingPayment === b.bookingID}
                                                            >
                                                                {updatingPayment === b.bookingID ? (
                                                                    <>
                                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                                        Updating...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <BanknotesIcon className="w-4 h-4" />
                                                                        Mark Paid
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                        <button
                                                            className="px-3 py-1.5 rounded bg-emerald-600 text-white hover:bg-emerald-700 transition text-xs font-medium flex items-center gap-1 whitespace-nowrap"
                                                            onClick={() => handleExportInvoice(b)}
                                                        >
                                                            <DocumentArrowDownIcon className="w-4 h-4" />
                                                            Invoice
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filtered.length === 0 && !loading && (
                                            <tr>
                                                <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                                                    No bookings found matching your filters.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
                        {/* Showing info */}
                        <p className="text-sm text-neutral-600 font-medium">
                            {total === 0
                                ? "No bookings"
                                : `Showing ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} of ${total} bookings`}
                        </p>

                        <div className="flex items-center gap-4">
                            {/* Page size selector */}
                            <select
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(0);
                                }}
                                className="border border-neutral-200 bg-white px-3 py-1.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
                            >
                                <option value={5}>5 per page</option>
                                <option value={10}>10 per page</option>
                                <option value={20}>20 per page</option>
                                <option value={50}>50 per page</option>
                            </select>

                            {/* Page navigation */}
                            {totalPages > 1 && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(0, p - 1))}
                                        disabled={page === 0}
                                        className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
                                    >
                                        Previous
                                    </button>
                                    
                                    {/* Page numbers */}
                                    {totalPages > 0 && [...Array(Math.min(totalPages, 5))].map((_, i) => {
                                        let pageNum;
                                        if (totalPages <= 5) {
                                            pageNum = i;
                                        } else if (page < 2) {
                                            pageNum = i;
                                        } else if (page >= totalPages - 3) {
                                            pageNum = totalPages - 5 + i;
                                        } else {
                                            pageNum = page - 2 + i;
                                        }
                                        
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => setPage(pageNum)}
                                                className={`px-3 py-1.5 rounded-lg border transition ${
                                                    page === pageNum
                                                        ? "bg-primary-600 text-white border-primary-600"
                                                        : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
                                                }`}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        );
                                    })}
                                    
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page + 1 >= totalPages}
                                        className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Modal */}
                    {selected && (
                        <BookingDetailModal 
                            booking={selected} 
                            onClose={() => setSelected(null)}
                            onUpdatePaymentStatus={handleUpdatePaymentStatus}
                            updatingPayment={updatingPayment}
                        />
                    )}
                </>
            )}

            {view === "book" && (
                <div className="bg-white border rounded-2xl shadow-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Create booking</p>
                            <h2 className="text-lg font-semibold text-gray-900">Book a tour on behalf of customer</h2>
                        </div>
                        <button
                            className="px-3 py-2 rounded-lg text-sm border border-gray-300 text-gray-700 hover:bg-gray-100"
                            onClick={() => setView("table")}
                        >
                            ← Back to list
                        </button>
                    </div>
                    <div className="border rounded-xl overflow-hidden">
                        <StaffTourBookingPage />
                    </div>
                </div>
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={dialog.isOpen}
                onClose={handleCancel}
                onConfirm={handleConfirm}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
                confirmText={dialog.confirmText}
                cancelText={dialog.cancelText}
            />
        </div>
    );
}

// Booking Detail Modal Component
function BookingDetailModal({ booking, onClose, onUpdatePaymentStatus, updatingPayment }) {
    // Backend returns BookingTourFullDTO with structure: { booking, account, customer, tourDetail, tour }
    const bookingData = booking.booking || booking;
    const customer = booking.customer;
    const tour = booking.tour;
    const tourDetail = booking.tourDetail;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <div>
                        <p className="text-xs text-gray-500">Booking #{bookingData.bookingID}</p>
                        <h3 className="text-lg font-semibold">{tour?.tourName || "Tour Details"}</h3>
                    </div>
                    <button
                        className="text-gray-500 hover:text-gray-800 text-2xl"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Status Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs text-blue-600 font-medium mb-1">Payment Status</p>
                            <p className={`text-sm font-semibold ${getPaymentStatusColor(bookingData.paymentStatus)} px-2 py-1 rounded inline-block`}>
                                {getPaymentStatusText(bookingData.paymentStatus)}
                            </p>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <p className="text-xs text-indigo-600 font-medium mb-1">Order Status</p>
                            <p className={`text-sm font-semibold ${getOrderStatusColor(bookingData.orderStatus)} px-2 py-1 rounded inline-block`}>
                                {getOrderStatusText(bookingData.orderStatus)}
                            </p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    {customer && (
                        <div className="border rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Name</p>
                                    <p className="font-medium">{customer.customerName}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="font-medium">{customer.customerPhone}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="font-medium">{customer.customerEmail || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Citizen Card</p>
                                    <p className="font-medium">{customer.citizenCard || "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Booking Details */}
                    <div className="border rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Booking Details</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">Order Code</p>
                                <p className="font-medium">{bookingData.orderCode || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Payment Method</p>
                                <p className="font-medium">{bookingData.paymentMethod || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Guests</p>
                                <p className="font-medium">
                                    {bookingData.adultCount || 0} Adult(s), {bookingData.childCount || 0} Child(ren), {bookingData.infantCount || 0} Infant(s)
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Unit Price</p>
                                <p className="font-medium">${(bookingData.unitPrice || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Amount</p>
                                <p className="font-medium text-green-700">${(bookingData.orderTotal || 0).toLocaleString()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Created At</p>
                                <p className="font-medium">{new Date(bookingData.createdAt).toLocaleString()}</p>
                            </div>
                            {bookingData.expireAt && (
                                <div>
                                    <p className="text-xs text-gray-500">Expires At</p>
                                    <p className="font-medium">{new Date(bookingData.expireAt).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tour Details */}
                    {tourDetail && (
                        <div className="border rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-3">Tour Details</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Departure Date</p>
                                    <p className="font-medium">
                                        {tourDetail.departureDate ? new Date(tourDetail.departureDate).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Arrival Date</p>
                                    <p className="font-medium">
                                        {tourDetail.arrivalDate ? new Date(tourDetail.arrivalDate).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Available Seats</p>
                                    <p className="font-medium">
                                        {tourDetail.numberOfGuests || 0} seats
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                    {bookingData.paymentMethod === "COD" && bookingData.paymentStatus === 0 && 
                     bookingData.orderStatus !== 4 && bookingData.orderStatus !== 5 && (
                        <button
                            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                            onClick={() => {
                                onUpdatePaymentStatus(bookingData.bookingID, 1);
                            }}
                            disabled={updatingPayment === bookingData.bookingID}
                        >
                            {updatingPayment === bookingData.bookingID ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <BanknotesIcon className="w-5 h-5" />
                                    Mark as Paid
                                </>
                            )}
                        </button>
                    )}
                    <button
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
