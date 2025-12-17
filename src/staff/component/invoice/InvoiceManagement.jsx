import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  searchInvoices,
  getInvoiceById,
  deleteInvoice,
  exportInvoicePdf,
} from "../../../services/staff/invoiceStaffService";
import { searchRefunds } from "../../../services/staff/refundStaffService";

// Payment status mapping: 0=Pending, 1=Paid, 2=Failed, 3=Refunded
const paymentStatusMap = {
  0: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  1: {
    label: "Paid",
    color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  2: {
    label: "Failed",
    color: "bg-red-100 text-red-700 border border-red-200",
  },
  3: {
    label: "Refunded",
    color: "bg-gray-100 text-gray-700 border border-gray-200",
  },
};

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ============================
  // LOAD INVOICES
  // ============================
  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await searchInvoices({
        page: currentPage - 1, // backend is 0-based
        size: pageSize,
        keyword: keyword.trim() || undefined,
        status: statusFilter ? Number(statusFilter) : undefined,
      });

      setInvoices(res.items || []);
      setTotalItems(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error("Failed to load invoices", err);
      if (err.response?.status === 403) {
        setError(
          "Access denied. You need STAFF role to access this page. Please login with a STAFF account."
        );
      } else {
        setError(err?.response?.data?.error || err.message || "Load failed");
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, keyword, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, statusFilter, pageSize]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // ============================
  // TOTALS CALCULATION
  // ============================
  const totals = useMemo(() => {
    return invoices.reduce(
      (acc, inv) => {
        acc.count += 1;
        const amount = Number(inv.amount || 0);
        acc.total += amount;
        if (inv.paymentStatus === 1) {
          acc.paid += amount;
        }
        return acc;
      },
      { count: 0, total: 0, paid: 0 }
    );
  }, [invoices]);

  // ============================
  // HANDLERS
  // ============================
  const handleView = async (invoice) => {
    try {
      const fullInvoice = await getInvoiceById(invoice.invoiceID);
      
      // Fetch refund info if booking exists
      let refundInfo = null;
      if (fullInvoice.tourBookingID) {
        try {
          const refundResponse = await searchRefunds({
            page: 0,
            size: 1,
            bookingID: fullInvoice.tourBookingID,
          });
          if (refundResponse.items && refundResponse.items.length > 0) {
            refundInfo = refundResponse.items[0];
          }
        } catch (refundErr) {
          // No refund found or error - ignore
          console.log("No refund found for booking:", refundErr);
        }
      }
      
      setSelected({ ...fullInvoice, refundInfo });
    } catch (err) {
      setToast({
        message: err?.response?.data?.error || "Failed to load invoice details",
        type: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await deleteInvoice(id);
      setToast({ message: "Invoice deleted successfully", type: "success" });
      loadInvoices();
    } catch (err) {
      setToast({
        message: err?.response?.data?.error || "Delete failed",
        type: "error",
      });
    }
  };

  const exportInvoice = async (inv) => {
    if (!inv) return;
    try {
      setLoading(true);
      const blob = await exportInvoicePdf(inv.invoiceID);

      // Check if blob is actually a PDF (not an error JSON)
      if (blob.type && blob.type !== "application/pdf") {
        // Try to parse as JSON error
        const text = await blob.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.error || json.message || "Failed to export PDF");
        } catch (parseError) {
          throw new Error("Invalid PDF response from server");
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${inv.invoiceID}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setToast({ message: "PDF exported successfully", type: "success" });
    } catch (err) {
      console.error("Export PDF error:", err);
      const errorMessage = err?.message || err?.response?.data?.error || "Failed to export PDF";
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // AUTO HIDE TOAST
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Invoices</h2>
            <p className="text-sm text-neutral-600 mt-1">
              Manage and track all invoices
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Invoices" value={totals.count} />
        <SummaryCard label="Total Amount" value={totals.total} accent />
        <SummaryCard label="Paid Amount" value={totals.paid} accent />
      </div>

      {/* Filters */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <input
            className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 pl-10 text-sm text-neutral-800
                 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
            placeholder="Search by transaction code, payment method, note..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-full md:w-52">
          <select
            className="w-full appearance-none rounded-lg border border-neutral-300 bg-white px-4 py-2.5 pr-10 text-sm text-neutral-800
                 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="0">Pending</option>
            <option value="1">Paid</option>
            <option value="2">Failed</option>
            <option value="3">Refunded</option>
          </select>

          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            ▼
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          <div className="font-semibold mb-1">⚠️ Error</div>
          <div>{error}</div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary-50 border-b border-primary-200">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-neutral-700">
                Invoice
              </th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-700">
                Booking
              </th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-700">
                Amount
              </th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-700">
                Status
              </th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-700">
                Transaction
              </th>
              <th className="px-4 py-2 text-left font-semibold text-neutral-700">
                Created
              </th>
              <th className="px-4 py-2 text-center font-semibold text-neutral-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-neutral-500">
                  Loading...
                </td>
              </tr>
            )}

            {!loading && invoices.length === 0 && (
              <tr>
                <td colSpan="7" className="py-5 text-center text-neutral-500">
                  No invoices found.
                </td>
              </tr>
            )}

            {!loading &&
              invoices.map((inv) => {
                const statusInfo =
                  paymentStatusMap[inv.paymentStatus] || paymentStatusMap[0];

                return (
                  <tr
                    key={inv.invoiceID}
                    className="border-b border-neutral-100 hover:bg-primary-50/30 transition"
                  >
                    {/* Invoice */}
                    <td className="px-4 py-2 font-semibold text-neutral-900">
                      #{inv.invoiceID}
                    </td>

                    {/* Booking */}
                    <td className="px-4 py-2 text-neutral-600 text-sm">
                      {inv.tourBookingID && (
                        <span className="inline-flex items-center gap-1">
                          🧳 Tour #{inv.tourBookingID}
                        </span>
                      )}
                      {inv.carBookingID && (
                        <span className="inline-flex items-center gap-1">
                          🚗 Car #{inv.carBookingID}
                        </span>
                      )}
                      {!inv.tourBookingID && !inv.carBookingID && (
                        <span className="text-neutral-400">N/A</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-2">
                      <div className="font-semibold text-primary-600">
                        {Number(inv.amount || 0).toLocaleString()} VND
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Transaction */}
                    <td className="px-4 py-2 text-neutral-600">
                      {inv.transactionCode || "-"}
                    </td>

                    {/* Created */}
                    <td className="px-4 py-2 text-neutral-600 text-xs">
                      {inv.createdAt
                        ? new Date(inv.createdAt).toLocaleString("vi-VN")
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-2 text-center space-x-1">
                      <button
                        className="px-2.5 py-1 rounded-md bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition text-xs"
                        onClick={() => handleView(inv)}
                      >
                        View
                      </button>

                      <button
                        className="px-2.5 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 shadow-sm transition text-xs"
                        onClick={() => handleDelete(inv.invoiceID)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-neutral-600">
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            invoices
          </p>

          <div className="flex gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border px-2 py-1 rounded-lg text-sm"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`px-3 py-1 rounded-lg border ${
                currentPage <= 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Previous
            </button>

            {totalPages > 0 &&
              [...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === i + 1
                      ? "bg-primary-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

            <button
              onClick={() =>
                currentPage < totalPages && setCurrentPage(currentPage + 1)
              }
              disabled={currentPage >= totalPages}
              className={`px-3 py-1 rounded-lg border ${
                currentPage >= totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "hover:bg-gray-100"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Invoice Detail Drawer */}
      {selected && (
        <InvoiceDrawer
          invoice={selected}
          onClose={() => setSelected(null)}
          paymentStatusMap={paymentStatusMap}
          onPrint={exportInvoice}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999]">
          <div
            className={`px-6 py-3 rounded-xl text-white shadow-lg ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent = false }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <p className="text-xs text-neutral-600 font-medium">{label}</p>
      <p
        className={`text-2xl font-bold mt-2 ${
          accent ? "text-primary-600" : "text-neutral-900"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
    </div>
  );
}

function InvoiceDrawer({ invoice, onClose, paymentStatusMap, onPrint }) {
  const statusInfo =
    paymentStatusMap[invoice.paymentStatus] || paymentStatusMap[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-neutral-900">
              Invoice #{invoice.invoiceID}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Basic Info */}
          <section className="bg-gray-50 border rounded-xl p-4 space-y-2 text-sm">
            <h4 className="font-semibold text-sm mb-2">Invoice Information</h4>
            <div className="flex justify-between">
              <span className="text-gray-500">Invoice ID</span>
              <span className="font-semibold">#{invoice.invoiceID}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Created At</span>
              <span className="font-semibold">
                {invoice.createdAt
                  ? new Date(invoice.createdAt).toLocaleString("vi-VN")
                  : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-semibold">
                {invoice.paymentMethod || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Status</span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
              >
                {statusInfo.label}
              </span>
            </div>
          </section>

          {/* Amount */}
          <section className="bg-gray-50 border rounded-xl p-4 space-y-2 text-sm">
            <h4 className="font-semibold text-sm mb-2">Amount</h4>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-semibold text-primary-600 text-lg">
                {Number(invoice.amount || 0).toLocaleString()} VND
              </span>
            </div>
            {invoice.paidAt && (
              <div className="flex justify-between">
                <span className="text-gray-500">Paid At</span>
                <span className="font-semibold">
                  {new Date(invoice.paidAt).toLocaleString("vi-VN")}
                </span>
              </div>
            )}
          </section>

          {/* Transaction */}
          {invoice.transactionCode && (
            <section className="bg-gray-50 border rounded-xl p-4 space-y-2 text-sm">
              <h4 className="font-semibold text-sm mb-2">Transaction</h4>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction Code</span>
                <span className="font-semibold">{invoice.transactionCode}</span>
              </div>
              {invoice.gatewayResponse && (
                <div className="mt-2">
                  <span className="text-gray-500 text-xs">
                    Gateway Response:
                  </span>
                  <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto">
                    {invoice.gatewayResponse}
                  </pre>
                </div>
              )}
            </section>
          )}

          {/* Booking Info */}
          <section className="bg-gray-50 border rounded-xl p-4 space-y-2 text-sm">
            <h4 className="font-semibold text-sm mb-2">Booking Information</h4>
            {invoice.tourBookingID && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tour Booking ID</span>
                <span className="font-semibold">#{invoice.tourBookingID}</span>
              </div>
            )}
            {invoice.carBookingID && (
              <div className="flex justify-between">
                <span className="text-gray-500">Car Booking ID</span>
                <span className="font-semibold">#{invoice.carBookingID}</span>
              </div>
            )}
            {invoice.processedBy && (
              <div className="flex justify-between">
                <span className="text-gray-500">Processed By</span>
                <span className="font-semibold">
                  Staff #{invoice.processedBy}
                </span>
              </div>
            )}
          </section>

          {/* Refund Information */}
          {invoice.refundInfo && (
            <section className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 text-sm">
              <h4 className="font-semibold text-sm mb-3 text-yellow-900">Refund Information</h4>
              {invoice.refundInfo.refundStatus === 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-yellow-800">Pending Refund</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Refund Percentage:</span>
                    <span className="font-semibold">{invoice.refundInfo.refundPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expected Refund Amount:</span>
                    <span className="font-bold text-green-700">
                      ${(invoice.refundInfo.refundAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  {invoice.refundInfo.cancelDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Request Date:</span>
                      <span className="font-medium">
                        {new Date(invoice.refundInfo.cancelDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ) : invoice.refundInfo.refundStatus === 1 ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-green-800">Refund Processed</span>
                  </div>
                  {invoice.refundInfo.refundReason && (
                    <div className="bg-white rounded-lg p-3 border border-green-200 mb-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Refund Reason:</p>
                      <p className="text-sm text-gray-800">{invoice.refundInfo.refundReason}</p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Refund Percentage:</span>
                    <span className="font-semibold">{invoice.refundInfo.refundPercentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Refund Amount:</span>
                    <span className="font-bold text-green-700 text-lg">
                      ${(invoice.refundInfo.refundAmount || 0).toLocaleString()}
                    </span>
                  </div>
                  {invoice.refundInfo.cancelDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Request Date:</span>
                      <span className="font-medium">
                        {new Date(invoice.refundInfo.cancelDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {invoice.refundInfo.processedDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed Date:</span>
                      <span className="font-medium">
                        {new Date(invoice.refundInfo.processedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                  {invoice.refundInfo.staffID && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processed By:</span>
                      <span className="font-medium">Staff #{invoice.refundInfo.staffID}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-red-800">Refund Rejected</span>
                  </div>
                  {invoice.refundInfo.refundReason && (
                    <div className="bg-white rounded-lg p-3 border border-red-200">
                      <p className="text-xs font-medium text-gray-700 mb-1">Reason:</p>
                      <p className="text-sm text-gray-800">{invoice.refundInfo.refundReason}</p>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Note */}
          {invoice.note && (
            <section className="bg-gray-50 border rounded-xl p-4 text-sm">
              <h4 className="font-semibold text-sm mb-2">Note</h4>
              <p className="text-gray-700">{invoice.note}</p>
            </section>
          )}
        </div>

        <div className="p-4 border-t flex gap-3 justify-end bg-neutral-50">
          <button
            onClick={() => onPrint(invoice)}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition text-sm"
          >
            🖨 Print Invoice
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
