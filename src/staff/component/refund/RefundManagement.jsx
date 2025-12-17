import React, { useEffect, useMemo, useState } from "react";
import {
    searchRefunds,
    updateRefund,
    getBankInfoByRefundID,
    createBankInfo,
} from "../../../services/staff/refundStaffService";
import { getFullBookingById } from "../../../services/staff/bookingStaffService";
import { toast } from "../../shared/toast/toast";
import { getCurrentUser } from "../../../services/common/authService";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";

const statusMap = {
    0: { label: "Pending", className: "bg-amber-100 text-amber-800 border border-amber-200" },
    1: { label: "Refunded", className: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
    2: { label: "Rejected", className: "bg-red-100 text-red-700 border border-red-200" },
};

export default function RefundManagement() {
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [keyword, setKeyword] = useState("");
    const [selected, setSelected] = useState(null);
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [total, setTotal] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "warning",
        onConfirm: null,
    });

    const loadRefunds = async () => {
        try {
            setLoading(true);
            const status = statusFilter === "ALL" ? null : Number(statusFilter);
            const response = await searchRefunds({
                page,
                size: 10,
                status,
            });

            const refundsList = response.items || [];
            
            // Fetch booking details for each refund
            const refundsWithDetails = await Promise.all(
                refundsList.map(async (refund) => {
                    try {
                        let bookingData = null;
                        let bankInfoList = [];

                        if (refund.tourBookingID) {
                            bookingData = await getFullBookingById(refund.tourBookingID);
                        }

                        if (refund.refundID) {
                            try {
                                const bankResponse = await getBankInfoByRefundID(refund.refundID);
                                // Handle response - could be array directly or wrapped
                                if (Array.isArray(bankResponse)) {
                                    bankInfoList = bankResponse;
                                } else if (bankResponse && Array.isArray(bankResponse.data)) {
                                    bankInfoList = bankResponse.data;
                                } else if (bankResponse && Array.isArray(bankResponse.items)) {
                                    bankInfoList = bankResponse.items;
                                }
                                console.log(`Bank info for refund ${refund.refundID}:`, bankInfoList);
                            } catch (bankErr) {
                                console.error(`Error loading bank info for refund ${refund.refundID}:`, bankErr);
                            }
                        }

                        return {
                            ...refund,
                            booking: bookingData?.booking || null,
                            customer: bookingData?.customer || null,
                            tour: bookingData?.tour || null,
                            tourDetail: bookingData?.tourDetail || null,
                            bankInfo: bankInfoList && bankInfoList.length > 0 ? bankInfoList[0] : null,
                        };
                    } catch (err) {
                        console.error(`Error loading details for refund ${refund.refundID}:`, err);
                        return {
                            ...refund,
                            booking: null,
                            customer: null,
                            tour: null,
                            tourDetail: null,
                            bankInfo: null,
                        };
                    }
                })
            );

            setRefunds(refundsWithDetails);
            setTotalPages(response.totalPages || 0);
            setTotal(response.total || 0);
        } catch (err) {
            console.error("Error loading refunds:", err);
            toast.error("Failed to load refunds: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRefunds();
    }, [page, statusFilter]);

    const filtered = useMemo(() => {
        const kw = keyword.toLowerCase().trim();
        return refunds.filter((r) => {
            const matchKw =
                !kw ||
                String(r.refundID).includes(kw) ||
                String(r.tourBookingID).includes(kw) ||
                r.customer?.name?.toLowerCase().includes(kw) ||
                r.customer?.phone?.toLowerCase().includes(kw) ||
                r.tour?.tourCode?.toLowerCase().includes(kw) ||
                r.tour?.tourName?.toLowerCase().includes(kw);
            return matchKw;
        });
    }, [keyword, refunds]);

    const totals = useMemo(() => {
        return filtered.reduce(
            (acc, r) => {
                acc.count += 1;
                acc.amount += r.refundAmount ? Number(r.refundAmount) : 0;
                return acc;
            },
            { count: 0, amount: 0 }
        );
    }, [filtered]);

    const handleQuickApprove = async (refund) => {
        setConfirmDialog({
            isOpen: true,
            title: "Chấp nhận hoàn tiền",
            message: `Bạn có chắc chắn muốn chấp nhận yêu cầu hoàn tiền #${refund.refundID}? Bạn sẽ cần nhập thông tin ngân hàng trong form chi tiết.`,
            type: "info",
            onConfirm: () => {
                setSelected(refund);
                setConfirmDialog({ ...confirmDialog, isOpen: false });
            },
        });
    };

    const handleQuickReject = async (refund) => {
        setConfirmDialog({
            isOpen: true,
            title: "Reject Refund",
            message: `Are you sure you want to reject refund request #${refund.refundID}? This action cannot be undone.`,
            type: "danger",
            confirmText: "Reject",
            cancelText: "Cancel",
            onConfirm: async () => {
                try {
                    const currentUser = getCurrentUser();
                    const staffID = currentUser?.accountID || null;

                    await updateRefund(refund.refundID, {
                        refundPercentage: refund.refundPercentage,
                        refundAmount: refund.refundAmount,
                        refundReason: refund.refundReason,
                        refundStatus: 2, // Rejected
                        processedDate: new Date().toISOString(),
                        staffID: staffID,
                    });

                    toast.success("Refund request rejected successfully");
                    loadRefunds();
                    setConfirmDialog({ ...confirmDialog, isOpen: false });
                } catch (err) {
                    console.error("Error rejecting refund:", err);
                    toast.error("Error rejecting refund: " + (err.message || "Unknown error"));
                }
            },
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-neutral-900">Refunds</h1>
                <p className="text-sm text-neutral-600">
                    Handle customer tour cancellations and refund requests.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <p className="text-xs text-neutral-600 font-medium">Total Requests</p>
                    <p className="text-2xl font-bold mt-2 text-neutral-900">{totals.count}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <p className="text-xs text-neutral-600 font-medium">Total Amount</p>
                    <p className="text-2xl font-bold mt-2 text-primary-600">
                        {totals.amount.toLocaleString("vi-VN")} đ
                    </p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <p className="text-xs text-neutral-600 font-medium">Refunded</p>
                    <p className="text-2xl font-bold mt-2 text-neutral-900">
                        {filtered.filter((f) => f.refundStatus === 1).length}
                    </p>
                </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex flex-1 gap-2">
                    <input
                        className="border border-neutral-200 bg-white px-3 py-2 rounded-lg w-full md:w-72 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                        placeholder="Search refund ID / booking / customer / tour"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <select
                        className="border border-neutral-200 bg-white px-3 py-2 rounded-lg w-full md:w-48 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                    >
                        <option value="ALL">All statuses</option>
                        <option value="0">Pending</option>
                        <option value="1">Refunded</option>
                        <option value="2">Rejected</option>
                    </select>
                </div>
                <div className="text-sm text-neutral-600 font-medium">{filtered.length} results</div>
            </div>

            {loading ? (
                <div className="bg-white border border-neutral-200 rounded-xl p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Loading refunds...</p>
                </div>
            ) : (
                <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-primary-50 border-b border-primary-200">
                            <tr>
                                {["Refund", "Tour / Booking", "Customer", "Amount", "Status", "Action"].map((h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-700">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((r) => (
                                <tr key={r.refundID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold">#{r.refundID}</div>
                                        <div className="text-xs text-gray-500">
                                            {r.cancelDate
                                                ? `Cancelled: ${new Date(r.cancelDate).toLocaleString("en-US")}`
                                                : "No cancel date"}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {r.tour ? (
                                            <>
                                                <div className="font-semibold">{r.tour.tourCode || "N/A"}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">
                                                    {r.tour.tourName || "N/A"}
                                                </div>
                                                <div className="text-xs text-gray-500">Booking #{r.tourBookingID}</div>
                                            </>
                                        ) : (
                                            <div className="text-xs text-gray-500">Booking #{r.tourBookingID}</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {r.customer ? (
                                            <>
                                                <div className="font-semibold">{r.customer.name || "N/A"}</div>
                                                <div className="text-xs text-gray-500">{r.customer.phone || "N/A"}</div>
                                            </>
                                        ) : (
                                            <div className="text-xs text-gray-500">Loading...</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-primary-600">
                                            {r.refundAmount ? Number(r.refundAmount).toLocaleString("vi-VN") : 0} đ
                                        </div>
                                        <div className="text-xs text-neutral-500">
                                            {r.refundPercentage || 0}% of paid
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                statusMap[r.refundStatus]?.className ||
                                                "bg-neutral-100 text-neutral-700"
                                            }`}
                                        >
                                            {statusMap[r.refundStatus]?.label || "Unknown"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 items-center">
                                            <button
                                                className="px-3 py-1.5 rounded-lg bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 shadow-sm transition font-medium text-xs"
                                                onClick={() => setSelected(r)}
                                                title="View Details"
                                            >
                                                View
                                            </button>
                                            {r.refundStatus === 0 && (
                                                <>
                                                    <button
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white border border-emerald-600 hover:bg-emerald-700 shadow-sm transition font-medium text-xs"
                                                        onClick={() => handleQuickApprove(r)}
                                                        title="Chấp nhận hoàn tiền"
                                                    >
                                                        ✓ Approve
                                                    </button>
                                                    <button
                                                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white border border-red-600 hover:bg-red-700 shadow-sm transition font-medium text-xs"
                                                        onClick={() => handleQuickReject(r)}
                                                        title="Reject Refund"
                                                    >
                                                        ✕ Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                                        No refunds found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                    <button
                        className="px-3 py-2 border rounded-lg disabled:opacity-50"
                        disabled={page === 0}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        Previous
                    </button>
                    <span className="text-sm text-neutral-600">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        className="px-3 py-2 border rounded-lg disabled:opacity-50"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {selected && (
                <RefundDrawer
                    refund={selected}
                    onClose={() => setSelected(null)}
                    onSave={loadRefunds}
                />
            )}

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
                confirmText={confirmDialog.confirmText}
                cancelText={confirmDialog.cancelText}
            />
        </div>
    );
}

function RefundDrawer({ refund, onClose, onSave }) {
    const [status, setStatus] = useState(refund.refundStatus ?? 0);
    const [note, setNote] = useState("");
    const [bankInfo, setBankInfo] = useState({
        bankName: "",
        bankAccount: "",
        accountHolder: "",
    });
    const [saving, setSaving] = useState(false);
    const [loadingBankInfo, setLoadingBankInfo] = useState(true);
    const [hasBankInfo, setHasBankInfo] = useState(false);
    const [customerInfo, setCustomerInfo] = useState(refund.customer || null);
    const [loadingCustomer, setLoadingCustomer] = useState(!refund.customer);
    
    // Check if refund is already processed (cannot change status)
    const isProcessed = refund.refundStatus === 1 || refund.refundStatus === 2;

    // Load customer info when drawer opens (if not already loaded)
    useEffect(() => {
        const loadCustomerInfo = async () => {
            if (refund.customer || !refund.tourBookingID) {
                setLoadingCustomer(false);
                return;
            }

            try {
                setLoadingCustomer(true);
                const bookingData = await getFullBookingById(refund.tourBookingID);
                console.log("Booking data for customer:", bookingData);
                
                if (bookingData) {
                    const customer = bookingData.customer || null;
                    console.log("Customer info:", customer);
                    setCustomerInfo(customer);
                }
            } catch (err) {
                console.error("Error loading customer info:", err);
                console.error("Error details:", err.response?.data || err.message);
            } finally {
                setLoadingCustomer(false);
            }
        };

        loadCustomerInfo();
    }, [refund.tourBookingID, refund.customer]);

    // Load bank info when drawer opens
    useEffect(() => {
        const loadBankInfo = async () => {
            try {
                setLoadingBankInfo(true);
                console.log("Loading bank info for refund ID:", refund.refundID);
                
                const response = await getBankInfoByRefundID(refund.refundID);
                console.log("Raw bank info response:", response);
                console.log("Response type:", typeof response);
                console.log("Is array:", Array.isArray(response));
                
                // Handle different response formats
                let bankInfoList = null;
                
                if (Array.isArray(response)) {
                    // Response is already an array
                    bankInfoList = response;
                } else if (response && typeof response === 'object') {
                    // Response is an object, try to extract array
                    if (Array.isArray(response.data)) {
                        bankInfoList = response.data;
                    } else if (Array.isArray(response.items)) {
                        bankInfoList = response.items;
                    } else if (Array.isArray(response.content)) {
                        bankInfoList = response.content;
                    } else {
                        // Maybe it's a single object wrapped
                        bankInfoList = [response];
                    }
                }
                
                console.log("Processed bank info list:", bankInfoList);
                
                // Ensure we have an array with data
                if (Array.isArray(bankInfoList) && bankInfoList.length > 0) {
                    const bankData = bankInfoList[0];
                    console.log("Using bank data:", bankData);
                    console.log("BankName:", bankData.bankName);
                    console.log("BankAccount:", bankData.bankAccount);
                    console.log("AccountHolder:", bankData.accountHolder);
                    
                    setBankInfo({
                        bankName: bankData.bankName || "",
                        bankAccount: bankData.bankAccount || "",
                        accountHolder: bankData.accountHolder || "",
                    });
                    setNote(bankData.note || "");
                    setHasBankInfo(true);
                    console.log("Bank info loaded successfully");
                } else {
                    console.warn("No bank info found for refund ID:", refund.refundID);
                    console.warn("Response was:", response);
                    setBankInfo({
                        bankName: "",
                        bankAccount: "",
                        accountHolder: "",
                    });
                    setNote("");
                    setHasBankInfo(false);
                }
            } catch (err) {
                console.error("Error loading bank info:", err);
                console.error("Error response:", err.response);
                console.error("Error data:", err.response?.data);
                console.error("Error message:", err.message);
                setHasBankInfo(false);
                setBankInfo({
                    bankName: "",
                    bankAccount: "",
                    accountHolder: "",
                });
                setNote("");
            } finally {
                setLoadingBankInfo(false);
            }
        };

        if (refund.refundID) {
            loadBankInfo();
        } else {
            console.warn("No refundID provided, cannot load bank info");
            setLoadingBankInfo(false);
        }
    }, [refund.refundID]);

    const handleSave = async () => {
        try {
            setSaving(true);

            // Validate bank info if approving (status = 1)
            if (status === 1 && !hasBankInfo) {
                if (!bankInfo.bankName.trim() || !bankInfo.bankAccount.trim() || !bankInfo.accountHolder.trim()) {
                    toast.error("Please enter complete bank information to approve refund");
                    setSaving(false);
                    return;
                }
            }

            // Get current user for staffID
            const currentUser = getCurrentUser();
            const staffID = currentUser?.accountID || null;

            // Update refund - chỉ cập nhật status và processedDate
            const refundUpdateData = {
                refundPercentage: refund.refundPercentage, // Giữ nguyên
                refundAmount: refund.refundAmount, // Giữ nguyên
                refundReason: refund.refundReason, // Giữ nguyên
                refundStatus: status,
                processedDate: status === 1 ? new Date().toISOString() : (status === 2 ? new Date().toISOString() : null),
                staffID: staffID,
            };

            await updateRefund(refund.refundID, refundUpdateData);

            // Chỉ tạo bank info mới nếu chưa có và đang duyệt (status = 1)
            if (status === 1 && !hasBankInfo) {
                await createBankInfo({
                    refundID: refund.refundID,
                    bankName: bankInfo.bankName,
                    bankAccount: bankInfo.bankAccount,
                    accountHolder: bankInfo.accountHolder,
                    note: note,
                });
            }

            const statusText = status === 1 ? "approved" : status === 2 ? "rejected" : "updated";
            toast.success(`Refund ${statusText} successfully`);
            onSave();
            onClose();
        } catch (err) {
            console.error("Error saving refund:", err);
            toast.error("Error processing refund: " + (err.message || "Unknown error"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
            <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Refund #{refund.refundID}</p>
                        <h3 className="text-lg font-semibold">{refund.tour?.tourName || "N/A"}</h3>
                        <p className="text-xs text-gray-500">
                            Booking #{refund.tourBookingID}
                            {refund.tourDetail?.departureDate &&
                                ` • Departure ${new Date(refund.tourDetail.departureDate).toLocaleDateString("vi-VN")}`}
                        </p>
                    </div>
                    <button className="text-gray-500 hover:text-gray-800" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                    <section className="bg-gray-50 border rounded-xl p-4">
                        <h4 className="font-semibold text-sm mb-2">Customer Information</h4>
                        {loadingCustomer ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                <p className="text-xs text-gray-500">Loading customer information...</p>
                            </div>
                        ) : customerInfo ? (
                            <>
                                <div className="mb-2">
                                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                                    <p className="text-sm font-medium">{customerInfo.customerName || customerInfo.name || "N/A"}</p>
                                </div>
                                <div className="mb-2">
                                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                                    <p className="text-sm">{customerInfo.customerPhone || customerInfo.phone || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                    <p className="text-sm">{customerInfo.customerEmail || customerInfo.email || "N/A"}</p>
                                </div>
                                {customerInfo.citizenCard && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-1">CMND/CCCD</p>
                                        <p className="text-sm">{customerInfo.citizenCard}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                                <p className="text-xs text-amber-700">
                                    Customer information not found. Please check booking ID: {refund.tourBookingID}
                                </p>
                            </div>
                        )}
                    </section>

                    <section className="bg-gray-50 border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Paid Amount</p>
                                <p className="font-semibold">
                                    {refund.booking?.orderTotal
                                        ? Number(refund.booking.orderTotal).toLocaleString("vi-VN")
                                        : 0}{" "}
                                    đ
                                </p>
                            </div>
                            <div className="text-xs text-gray-500">
                                {refund.cancelDate
                                    ? `Cancelled ${new Date(refund.cancelDate).toLocaleString("en-US")}`
                                    : "No cancel date"}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500">Refund Percentage</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                                    value={refund.refundPercentage || 0}
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Refund Amount</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                                    value={refund.refundAmount ? Number(refund.refundAmount) : 0}
                                    readOnly
                                    disabled
                                />
                                <p className="text-xs text-gray-500 mt-1">Currency: VND</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500">Reason</label>
                            <textarea
                                rows={2}
                                className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                                value={refund.refundReason || ""}
                                readOnly
                                disabled
                            />
                        </div>
                    </section>

                    <section className="bg-gray-50 border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-sm">Bank Information</h4>
                            {loadingBankInfo ? (
                                <span className="text-xs text-gray-500">Loading...</span>
                            ) : hasBankInfo ? (
                                <span className="text-xs text-green-600 font-medium">Information Available</span>
                            ) : (
                                <span className="text-xs text-amber-600 font-medium">No Information</span>
                            )}
                        </div>
                        {loadingBankInfo ? (
                            <div className="text-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto mb-2"></div>
                                <p className="text-xs text-gray-500">Loading bank information...</p>
                            </div>
                        ) : hasBankInfo ? (
                            // Hiển thị thông tin ngân hàng đã có (read-only)
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500">Bank Name</label>
                                    <input
                                        className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                                        value={bankInfo.bankName}
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Account Number</label>
                                        <input
                                            className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                                            value={bankInfo.bankAccount}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Account Holder</label>
                                        <input
                                            className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                                            value={bankInfo.accountHolder}
                                            readOnly
                                            disabled
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Note</label>
                                    <textarea
                                        rows={2}
                                        className="mt-1 w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                                        value={note}
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>
                        ) : (
                            // Form nhập thông tin ngân hàng mới (chỉ hiện khi duyệt)
                            <div className="grid grid-cols-1 gap-3">
                                {status === 1 ? (
                                    <>
                                        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                                            Please enter bank information to approve refund
                                        </p>
                                        <div>
                                            <label className="text-xs text-gray-500">
                                                Bank Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                className="mt-1 w-full border rounded px-3 py-2"
                                                value={bankInfo.bankName}
                                                onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                                                placeholder="Bank Name"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-gray-500">
                                                    Account Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    className="mt-1 w-full border rounded px-3 py-2"
                                                    value={bankInfo.bankAccount}
                                                    onChange={(e) => setBankInfo({ ...bankInfo, bankAccount: e.target.value })}
                                                    placeholder="Account Number"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500">
                                                    Account Holder <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    className="mt-1 w-full border rounded px-3 py-2"
                                                    value={bankInfo.accountHolder}
                                                    onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
                                                    placeholder="Account Holder"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Note</label>
                                            <textarea
                                                rows={2}
                                                className="mt-1 w-full border rounded px-3 py-2"
                                                value={note}
                                                onChange={(e) => setNote(e.target.value)}
                                                placeholder="Note (optional)"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">
                                        Bank information will be required when approving refund
                                    </p>
                                )}
                            </div>
                        )}
                    </section>

                    <section className="bg-gray-50 border rounded-xl p-4 space-y-3">
                        <h4 className="font-semibold text-sm">Processing Status</h4>
                        <div className="flex gap-2 flex-wrap">
                            {[0, 1, 2].map((s) => (
                                <button
                                    key={s}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                                        status === s
                                            ? s === 1
                                                ? "bg-emerald-600 text-white border-emerald-600"
                                                : s === 2
                                                ? "bg-red-600 text-white border-red-600"
                                                : "bg-amber-600 text-white border-amber-600"
                                            : isProcessed
                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
                                    }`}
                                    onClick={() => !isProcessed && setStatus(s)}
                                    disabled={isProcessed}
                                >
                                    {statusMap[s].label}
                                </button>
                            ))}
                        </div>
                        <div className="mt-2 p-2 rounded bg-blue-50 border border-blue-200">
                            <p className="text-xs text-blue-800">
                                {status === 1 && "✓ Approved: Refund will be processed and transferred to bank account"}
                                {status === 2 && "✕ Rejected: Refund request has been rejected, customer will be notified"}
                                {status === 0 && "⏳ Pending: Waiting for staff to process refund request"}
                            </p>
                        </div>
                        {(refund.refundStatus === 1 || refund.refundStatus === 2) && (
                            <div className="mt-2 p-2 rounded bg-gray-100 border border-gray-300">
                                <p className="text-xs text-gray-600">
                                    {refund.processedDate
                                        ? `Processed: ${new Date(refund.processedDate).toLocaleString("en-US")}`
                                        : "No processing information"}
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="p-4 border-t flex gap-3 justify-end">
                    <button
                        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={onClose}
                        disabled={saving}
                    >
                        Close
                    </button>
                    {!isProcessed ? (
                        <button
                            className={`px-4 py-2 rounded text-white hover:opacity-90 disabled:opacity-50 transition ${
                                status === 1
                                    ? "bg-emerald-600"
                                    : status === 2
                                    ? "bg-red-600"
                                    : "bg-gray-600"
                            }`}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving
                                ? "Processing..."
                                : status === 1
                                ? "Approve Refund"
                                : status === 2
                                ? "Reject"
                                : "Update"}
                        </button>
                    ) : (
                        <div className="px-4 py-2 rounded bg-gray-200 text-gray-600 text-sm">
                            Processed - Cannot Change
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
