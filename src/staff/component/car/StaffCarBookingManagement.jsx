import React, { useEffect, useState } from "react";
import { MagnifyingGlassIcon, EyeIcon, BanknotesIcon, XCircleIcon, ArrowPathIcon, PlusIcon } from "@heroicons/react/24/outline";
import api from "../../../services/api";
import { toast } from "../../shared/toast/toast";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";
import { useConfirm } from "../../shared/confirm/useConfirm";
import { getCurrentUser } from "../../../services/common/authService";
import { createCustomerInfo } from "../../../services/customer/bookingService";
const getBookingStatusText = (status) => {
    switch (status) {
        case 0: return "Pending (Unpaid)";
        case 1: return "Booked (Paid)";
        case 2: return "In Progress";
        case 3: return "Completed";
        case 4: return "Auto Cancelled";
        case 5: return "Refunded";
        default: return "Unknown";
    }
};

const getBookingStatusColor = (status) => {
    switch (status) {
        case 0: return "bg-yellow-100 text-yellow-700";
        case 1: return "bg-blue-100 text-blue-700";
        case 2: return "bg-green-100 text-green-700";
        case 3: return "bg-emerald-100 text-emerald-700";
        case 4: return "bg-red-100 text-red-700";
        case 5: return "bg-purple-100 text-purple-700";
        default: return "bg-gray-100 text-gray-700";
    }
};

const getPaymentStatusText = (status) => {
    switch (status) {
        case 0: return "Unpaid";
        case 1: return "Paid";
        default: return "Unknown";
    }
};

const getPaymentStatusColor = (status) => {
    switch (status) {
        case 0: return "bg-red-100 text-red-700";
        case 1: return "bg-green-100 text-green-700";
        default: return "bg-gray-100 text-gray-700";
    }
};

export default function StaffCarBookingManagement() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedBookingForRefund, setSelectedBookingForRefund] = useState(null);
    const [refundForm, setRefundForm] = useState({
        refundPercentage: 95,
        refundAmount: 0,
        refundReason: "",
        refundStatus: 0, // 0=Pending, 1=Done, 2=Rejected
    });
    
    // Create booking modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createBookingForm, setCreateBookingForm] = useState({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        citizenCard: "",
        carID: null,
        pickupDate: "",
        pickupTime: "09:00",
        dropoffDate: "",
        dropoffTime: "17:00",
        needDriver: false,
        needAirConditioner: true,
        paymentMethod: "CASH",
        paymentStatus: 0, // 0=Unpaid, 1=Paid
    });
    const [selectedCar, setSelectedCar] = useState(null);
    const [customerSearchKeyword, setCustomerSearchKeyword] = useState("");
    const [customers, setCustomers] = useState([]);
    const [cars, setCars] = useState([]);
    const [carSearchKeyword, setCarSearchKeyword] = useState("");
    const [createBookingLoading, setCreateBookingLoading] = useState(false);
    const [priceCalculation, setPriceCalculation] = useState({ baseAmount: 0, finalTotal: 0 });
    
    const { confirm, dialog, handleConfirm, handleCancel } = useConfirm();

    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchBookings();
    }, [page, pageSize, keyword, statusFilter]);

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const params = { page, size: pageSize };
            if (keyword) params.keyword = keyword;
            if (statusFilter !== "ALL") params.status = parseInt(statusFilter);

            const res = await api.get("/staff/car-bookings/full", { params });
            setBookings(res.data.items || []);
            setTotalPages(res.data.totalPages || 0);
            setTotal(res.data.total || 0);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load car bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (booking) => {
        if (!booking?.booking?.carBookingID) return;
        try {
            const res = await api.get(`/staff/car-bookings-full/full/${booking.booking.carBookingID}`);
            setSelectedBooking(res.data);
            setShowDetail(true);
        } catch (err) {
            toast.error("Failed to load booking details");
        }
    };

    const handlePay = async (id) => {
        if (!id) return;
        const confirmed = await confirm({
            title: "Confirm Payment",
            message: "Mark this booking as paid?",
        });
        if (confirmed) {
            try {
                await api.post(`/staff/car-bookings/${id}/pay`, null, { params: { paymentMethod: "Staff Confirmed" } });
                toast.success("Payment confirmed");
                fetchBookings();
            } catch (err) {
                toast.error("Failed to process payment");
            }
        }
    };

    const handleCancelBooking = async (id) => {
        if (!id) return;
        const confirmed = await confirm({
            title: "Cancel Booking",
            message: "Are you sure you want to cancel this booking?",
        });
        if (confirmed) {
            try {
                await api.post(`/staff/car-bookings/${id}/cancel`, null, { params: { reason: "Cancelled by staff" } });
                toast.success("Booking cancelled");
                fetchBookings();
            } catch (err) {
                toast.error("Failed to cancel booking");
            }
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

    const handleOpenRefundModal = (bookingItem) => {
        const booking = bookingItem?.booking;
        if (!booking) return;

        if (booking.paymentStatus !== 1) {
            toast.error("Only paid bookings can be refunded");
            return;
        }

        if (booking.bookingStatus === 5) {
            toast.error("This booking is already refunded");
            return;
        }

        const percentage = calculateRefundPercentage(booking.pickupDate);
        const amount = (booking.finalTotal * percentage) / 100;

        setSelectedBookingForRefund(bookingItem);
        setRefundForm({
            refundPercentage: percentage,
            refundAmount: amount,
            refundReason: "",
            refundStatus: 0,
        });
        setShowRefundModal(true);
    };

    const handleRefundSubmit = async () => {
        if (!selectedBookingForRefund?.booking?.carBookingID) return;

        if (!refundForm.refundReason.trim()) {
            toast.error("Please provide a reason for the refund");
            return;
        }

        const confirmed = await confirm({
            title: "Process Refund",
            message: `Process refund of ${refundForm.refundAmount.toFixed(2)} (${refundForm.refundPercentage}%)?`,
        });

        if (!confirmed) return;

        try {
            const payload = {
                carBookingID: selectedBookingForRefund.booking.carBookingID,
                refundPercentage: refundForm.refundPercentage,
                refundAmount: refundForm.refundAmount,
                refundReason: refundForm.refundReason,
                refundStatus: refundForm.refundStatus,
                cancelDate: new Date().toISOString(),
            };

            await api.post(`/staff/car-bookings/${selectedBookingForRefund.booking.carBookingID}/refund`, payload);
            toast.success("Refund processed successfully");
            setShowRefundModal(false);
            setSelectedBookingForRefund(null);
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to process refund");
        }
    };

    // Fetch cars for selection
    const fetchCars = async (keyword = "") => {
        try {
            const res = await api.get("/staff/cars", {
                params: { page: 0, size: 50, keyword, status: 1 } // Only active cars
            });
            setCars(res.data.items || []);
        } catch (err) {
            console.error("Failed to fetch cars:", err);
        }
    };

    // Fetch customers for selection
    const fetchCustomers = async (keyword = "") => {
        try {
            const res = await api.get("/staff/customers", {
                params: { page: 0, size: 50, keyword }
            });
            setCustomers(res.data.items || []);
        } catch (err) {
            console.error("Failed to fetch customers:", err);
        }
    };

    // Calculate price based on selected car and dates
    useEffect(() => {
        if (selectedCar && createBookingForm.pickupDate && createBookingForm.dropoffDate) {
            const pickup = new Date(createBookingForm.pickupDate);
            const dropoff = new Date(createBookingForm.dropoffDate);
            if (dropoff > pickup) {
                const days = Math.ceil((dropoff - pickup) / (1000 * 60 * 60 * 24));
                const dailyRate = selectedCar.dailyRate || 0;
                let baseAmount = dailyRate * days;
                
                // Add driver fee if needed
                if (createBookingForm.needDriver) {
                    baseAmount += (days * 50); // $50 per day for driver
                }
                
                setPriceCalculation({
                    baseAmount,
                    finalTotal: baseAmount
                });
            }
        }
    }, [selectedCar, createBookingForm.pickupDate, createBookingForm.dropoffDate, createBookingForm.needDriver]);

    // Load cars when modal opens
    useEffect(() => {
        if (showCreateModal) {
            fetchCars();
            fetchCustomers();
        }
    }, [showCreateModal]);

    // Search cars
    useEffect(() => {
        if (showCreateModal) {
            const timer = setTimeout(() => {
                fetchCars(carSearchKeyword);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [carSearchKeyword, showCreateModal]);

    // Search customers
    useEffect(() => {
        if (showCreateModal) {
            const timer = setTimeout(() => {
                fetchCustomers(customerSearchKeyword);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [customerSearchKeyword, showCreateModal]);

    const handleCreateBooking = async () => {
        if (!selectedCar) {
            toast.error("Please select a car");
            return;
        }
        if (!createBookingForm.customerName.trim() || !createBookingForm.customerPhone.trim()) {
            toast.error("Please fill in customer name and phone");
            return;
        }
        if (!createBookingForm.pickupDate || !createBookingForm.dropoffDate) {
            toast.error("Please select pickup and dropoff dates");
            return;
        }

        setCreateBookingLoading(true);
        try {
            const user = getCurrentUser();
            const accountID = user?.accountID || 1;

            // Create or find customer
            let customerInfoID;
            const existingCustomer = customers.find(c => 
                c.customerPhone === createBookingForm.customerPhone.trim()
            );
            
            if (existingCustomer) {
                customerInfoID = existingCustomer.customerInfoID;
            } else {
                const customerInfo = await createCustomerInfo({
                    customerName: createBookingForm.customerName.trim(),
                    customerPhone: createBookingForm.customerPhone.trim(),
                    customerEmail: createBookingForm.customerEmail.trim() || null,
                    citizenCard: createBookingForm.citizenCard.trim() || null,
                });
                customerInfoID = customerInfo.customerInfoID;
            }

            // Generate booking code
            const bookingCode = "CR" + Date.now();
            
            // Calculate dates
            const pickupDateTime = new Date(createBookingForm.pickupDate + "T" + createBookingForm.pickupTime);
            const dropoffDateTime = new Date(createBookingForm.dropoffDate + "T" + createBookingForm.dropoffTime);
            
            // Set cancel deadline if unpaid
            const cancelDeadline = createBookingForm.paymentStatus === 0 
                ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                : null;

            const bookingData = {
                accountID,
                customerInfoID,
                carID: selectedCar.carID,
                pickupDate: pickupDateTime.toISOString(),
                dropoffDate: dropoffDateTime.toISOString(),
                needDriver: createBookingForm.needDriver || false,
                needAirConditioner: createBookingForm.needAirConditioner !== false,
                baseAmount: priceCalculation.baseAmount,
                finalTotal: priceCalculation.finalTotal,
                paymentMethod: createBookingForm.paymentMethod,
                paymentStatus: createBookingForm.paymentStatus,
                bookingCode,
                bookingStatus: createBookingForm.paymentStatus === 1 ? 1 : 0, // Paid = Booked, Unpaid = Pending
                cancelDeadline,
            };

            await api.post("/staff/car-bookings", bookingData);
            toast.success("Car booking created successfully!");
            setShowCreateModal(false);
            
            // Reset form
            setCreateBookingForm({
                customerName: "",
                customerPhone: "",
                customerEmail: "",
                citizenCard: "",
                carID: null,
                pickupDate: "",
                pickupTime: "09:00",
                dropoffDate: "",
                dropoffTime: "17:00",
                needDriver: false,
                needAirConditioner: true,
                paymentMethod: "CASH",
                paymentStatus: 0,
            });
            setSelectedCar(null);
            setPriceCalculation({ baseAmount: 0, finalTotal: 0 });
            
            // Refresh bookings list
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.error || err.message || "Failed to create booking");
        } finally {
            setCreateBookingLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Car Booking Management</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                    <PlusIcon className="w-5 h-5" />
                    Create Booking
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by booking code or customer name..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg"
                >
                    <option value="ALL">All Status</option>
                    <option value="0">Pending (Unpaid)</option>
                    <option value="1">Booked (Paid)</option>
                    <option value="2">In Progress</option>
                    <option value="3">Completed</option>
                    <option value="4">Auto Cancelled</option>
                    <option value="5">Refunded</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Booking Code</th>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-left">Car</th>
                            <th className="px-4 py-3 text-left">Pickup Date</th>
                            <th className="px-4 py-3 text-left">Payment Status</th>
                            <th className="px-4 py-3 text-left">Booking Status</th>
                            <th className="px-4 py-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center">Loading...</td>
                            </tr>
                        ) : bookings.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center">No bookings found</td>
                            </tr>
                        ) : (
                            bookings.map((item) => {
                                const b = item?.booking;
                                if (!b) return null;
                                return (
                                    <tr key={b.carBookingID} className="border-t">
                                        <td className="px-4 py-3">{b.bookingCode}</td>
                                        <td className="px-4 py-3">{item.customer?.customerName || "N/A"}</td>
                                        <td className="px-4 py-3">{item.car?.modelName || "N/A"}</td>
                                        <td className="px-4 py-3">{new Date(b.pickupDate).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-sm ${getPaymentStatusColor(b.paymentStatus)}`}>
                                                {getPaymentStatusText(b.paymentStatus)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-sm ${getBookingStatusColor(b.bookingStatus)}`}>
                                                {getBookingStatusText(b.bookingStatus)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewDetail(item)}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </button>
                                                {b.paymentStatus === 0 && b.bookingStatus === 0 && (
                                                    <button
                                                        onClick={() => handlePay(b.carBookingID)}
                                                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                        title="Mark as Paid"
                                                    >
                                                        <BanknotesIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {(b.bookingStatus === 0 || b.bookingStatus === 1) && (
                                                    <button
                                                        onClick={() => handleCancelBooking(b.carBookingID)}
                                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                        title="Cancel Booking"
                                                    >
                                                        <XCircleIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {b.paymentStatus === 1 && b.bookingStatus !== 5 && (
                                                    <button
                                                        onClick={() => handleOpenRefundModal(item)}
                                                        className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                                                        title="Process Refund"
                                                    >
                                                        <ArrowPathIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 flex-wrap gap-4">
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
                                onClick={() => setPage(Math.max(0, page - 1))}
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
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page === totalPages - 1}
                                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetail && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">Booking Details</h2>
                        <div className="space-y-4">
                            <div><strong>Booking Code:</strong> {selectedBooking.booking.bookingCode}</div>
                            <div><strong>Customer:</strong> {selectedBooking.customer?.customerName}</div>
                            <div><strong>Car:</strong> {selectedBooking.car?.brand} {selectedBooking.car?.modelName}</div>
                            <div><strong>Pickup:</strong> {new Date(selectedBooking.booking.pickupDate).toLocaleString()}</div>
                            <div><strong>Dropoff:</strong> {new Date(selectedBooking.booking.dropoffDate).toLocaleString()}</div>
                            <div><strong>Total:</strong> ${selectedBooking.booking.finalTotal}</div>
                            <div><strong>Payment Status:</strong> {getPaymentStatusText(selectedBooking.booking.paymentStatus)}</div>
                            <div><strong>Booking Status:</strong> {getBookingStatusText(selectedBooking.booking.bookingStatus)}</div>
                        </div>
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setShowDetail(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Refund Modal */}
            {showRefundModal && selectedBookingForRefund && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h2 className="text-xl font-bold mb-4">Process Refund</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Booking Code</label>
                                <p className="text-gray-700">{selectedBookingForRefund.booking.bookingCode}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Original Amount</label>
                                <p className="text-gray-700">${selectedBookingForRefund.booking.finalTotal?.toFixed(2)}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Refund Percentage (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={refundForm.refundPercentage}
                                    onChange={(e) => {
                                        const percentage = parseFloat(e.target.value) || 0;
                                        const amount = (selectedBookingForRefund.booking.finalTotal * percentage) / 100;
                                        setRefundForm({ ...refundForm, refundPercentage: percentage, refundAmount: amount });
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Refund Amount ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={refundForm.refundAmount.toFixed(2)}
                                    onChange={(e) => {
                                        const amount = parseFloat(e.target.value) || 0;
                                        const percentage = selectedBookingForRefund.booking.finalTotal > 0 
                                            ? (amount / selectedBookingForRefund.booking.finalTotal) * 100 
                                            : 0;
                                        setRefundForm({ ...refundForm, refundAmount: amount, refundPercentage: percentage });
                                    }}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Reason *</label>
                                <textarea
                                    value={refundForm.refundReason}
                                    onChange={(e) => setRefundForm({ ...refundForm, refundReason: e.target.value })}
                                    placeholder="Enter refund reason..."
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Refund Status</label>
                                <select
                                    value={refundForm.refundStatus}
                                    onChange={(e) => setRefundForm({ ...refundForm, refundStatus: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value={0}>Pending</option>
                                    <option value={1}>Done</option>
                                    <option value={2}>Rejected</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowRefundModal(false);
                                    setSelectedBookingForRefund(null);
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRefundSubmit}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Process Refund
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE BOOKING MODAL */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Create Car Booking</h2>
                        
                        <div className="grid grid-cols-2 gap-6">
                            {/* LEFT COLUMN */}
                            <div className="space-y-4">
                                {/* Customer Information */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Customer Search</label>
                                    <input
                                        type="text"
                                        placeholder="Search by name, phone, or email..."
                                        value={customerSearchKeyword}
                                        onChange={(e) => setCustomerSearchKeyword(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                    {customerSearchKeyword && customers.length > 0 && (
                                        <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                                            {customers.map((c) => (
                                                <div
                                                    key={c.customerInfoID}
                                                    onClick={() => {
                                                        setCreateBookingForm(prev => ({
                                                            ...prev,
                                                            customerName: c.customerName,
                                                            customerPhone: c.customerPhone,
                                                            customerEmail: c.customerEmail || "",
                                                            citizenCard: c.citizenCard || "",
                                                        }));
                                                        setCustomerSearchKeyword("");
                                                    }}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                                                >
                                                    <div className="font-medium">{c.customerName}</div>
                                                    <div className="text-sm text-gray-600">{c.customerPhone}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Customer Name *</label>
                                    <input
                                        type="text"
                                        value={createBookingForm.customerName}
                                        onChange={(e) => setCreateBookingForm(prev => ({ ...prev, customerName: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone *</label>
                                    <input
                                        type="text"
                                        value={createBookingForm.customerPhone}
                                        onChange={(e) => setCreateBookingForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-lg"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={createBookingForm.customerEmail}
                                        onChange={(e) => setCreateBookingForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Citizen Card</label>
                                    <input
                                        type="text"
                                        value={createBookingForm.citizenCard}
                                        onChange={(e) => setCreateBookingForm(prev => ({ ...prev, citizenCard: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* RIGHT COLUMN */}
                            <div className="space-y-4">
                                {/* Car Selection */}
                                <div>
                                    <label className="block text-sm font-medium mb-2">Select Car *</label>
                                    <input
                                        type="text"
                                        placeholder="Search cars..."
                                        value={carSearchKeyword}
                                        onChange={(e) => setCarSearchKeyword(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg mb-2"
                                    />
                                    {carSearchKeyword && cars.length > 0 && (
                                        <div className="border rounded-lg max-h-40 overflow-y-auto">
                                            {cars.map((car) => (
                                                <div
                                                    key={car.carID}
                                                    onClick={() => {
                                                        setSelectedCar(car);
                                                        setCreateBookingForm(prev => ({ ...prev, carID: car.carID }));
                                                        setCarSearchKeyword("");
                                                    }}
                                                    className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                                                >
                                                    <div className="font-medium">{car.brand} {car.modelName}</div>
                                                    <div className="text-sm text-gray-600">${car.dailyRate}/day</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {selectedCar && (
                                        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                            <div className="font-medium">{selectedCar.brand} {selectedCar.modelName}</div>
                                            <div className="text-sm text-gray-600">Daily Rate: ${selectedCar.dailyRate}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Pickup Date *</label>
                                        <input
                                            type="date"
                                            value={createBookingForm.pickupDate}
                                            onChange={(e) => setCreateBookingForm(prev => ({ ...prev, pickupDate: e.target.value }))}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Pickup Time</label>
                                        <input
                                            type="time"
                                            value={createBookingForm.pickupTime}
                                            onChange={(e) => setCreateBookingForm(prev => ({ ...prev, pickupTime: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dropoff Date *</label>
                                        <input
                                            type="date"
                                            value={createBookingForm.dropoffDate}
                                            onChange={(e) => setCreateBookingForm(prev => ({ ...prev, dropoffDate: e.target.value }))}
                                            min={createBookingForm.pickupDate || new Date().toISOString().split('T')[0]}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Dropoff Time</label>
                                        <input
                                            type="time"
                                            value={createBookingForm.dropoffTime}
                                            onChange={(e) => setCreateBookingForm(prev => ({ ...prev, dropoffTime: e.target.value }))}
                                            className="w-full px-3 py-2 border rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Options */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={createBookingForm.needDriver}
                                            onChange={(e) => setCreateBookingForm(prev => ({ ...prev, needDriver: e.target.checked }))}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Need Driver (+$50/day)</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={createBookingForm.needAirConditioner}
                                            onChange={(e) => setCreateBookingForm(prev => ({ ...prev, needAirConditioner: e.target.checked }))}
                                            className="rounded"
                                        />
                                        <span className="text-sm">Need Air Conditioner</span>
                                    </label>
                                </div>

                                {/* Payment */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Payment Method *</label>
                                    <select
                                        value={createBookingForm.paymentMethod}
                                        onChange={(e) => setCreateBookingForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="MOMO">MoMo</option>
                                        <option value="PAYPAL">PayPal</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Payment Status *</label>
                                    <select
                                        value={createBookingForm.paymentStatus}
                                        onChange={(e) => setCreateBookingForm(prev => ({ ...prev, paymentStatus: parseInt(e.target.value) }))}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value={0}>Unpaid</option>
                                        <option value={1}>Paid</option>
                                    </select>
                                </div>

                                {/* Price Summary */}
                                {(priceCalculation.baseAmount > 0) && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between text-sm">
                                            <span>Base Amount:</span>
                                            <span>${priceCalculation.baseAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between font-bold mt-2">
                                            <span>Total:</span>
                                            <span>${priceCalculation.finalTotal.toFixed(2)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setCreateBookingForm({
                                        customerName: "",
                                        customerPhone: "",
                                        customerEmail: "",
                                        citizenCard: "",
                                        carID: null,
                                        pickupDate: "",
                                        pickupTime: "09:00",
                                        dropoffDate: "",
                                        dropoffTime: "17:00",
                                        needDriver: false,
                                        needAirConditioner: true,
                                        paymentMethod: "CASH",
                                        paymentStatus: 0,
                                    });
                                    setSelectedCar(null);
                                    setPriceCalculation({ baseAmount: 0, finalTotal: 0 });
                                }}
                                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                disabled={createBookingLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateBooking}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                disabled={createBookingLoading}
                            >
                                {createBookingLoading ? "Creating..." : "Create Booking"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog {...dialog} onClose={handleCancel} onConfirm={handleConfirm} />
        </div>
    );
}