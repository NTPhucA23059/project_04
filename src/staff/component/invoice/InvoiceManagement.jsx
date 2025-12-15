import React, { useMemo, useState } from "react";
import { bookings as sampleBookings, invoices as sampleInvoices, refunds as sampleRefunds } from "../shared/mockBookingFinanceData";

const statusColor = {
    PAID: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    PARTIAL_REFUND: "bg-amber-100 text-amber-800 border border-amber-200",
    REFUNDED: "bg-red-100 text-red-700 border border-red-200",
};

export default function InvoiceManagement() {
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("ALL");
    const [selected, setSelected] = useState(null);

    const enriched = useMemo(() => {
        return sampleInvoices.map((inv) => {
            const booking = sampleBookings.find((b) => b.bookingId === inv.bookingId);
            const refunds = sampleRefunds.filter((r) => r.bookingId === inv.bookingId);
            const grossAmount = booking?.paidAmount || 0;
            const refundAmount = refunds.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
            const netAmount = Math.max(grossAmount - refundAmount, 0);
            let derivedStatus = "PAID";
            if (refundAmount > 0 && refundAmount < grossAmount) derivedStatus = "PARTIAL_REFUND";
            if (refundAmount >= grossAmount) derivedStatus = "REFUNDED";
            return {
                ...inv,
                booking,
                refunds,
                grossAmount,
                refundAmount,
                netAmount,
                status: derivedStatus,
                customer: booking?.customer || {},
                tourCode: booking?.tourCode,
                tourName: booking?.tourName,
            };
        });
    }, []);

    const filtered = useMemo(() => {
        const kw = keyword.toLowerCase().trim();
        return enriched.filter((inv) => {
            const matchKw =
                !kw ||
                inv.invoiceId.toLowerCase().includes(kw) ||
                String(inv.bookingId).includes(kw) ||
                inv.tourCode.toLowerCase().includes(kw) ||
                inv.tourName.toLowerCase().includes(kw) ||
                inv.customer.name.toLowerCase().includes(kw) ||
                inv.customer.phone.toLowerCase().includes(kw);
            const matchStatus = status === "ALL" || inv.status === status;
            return matchKw && matchStatus;
        });
    }, [keyword, status, enriched]);

    const totals = useMemo(() => {
        return filtered.reduce(
            (acc, inv) => {
                acc.count += 1;
                acc.gross += inv.grossAmount || 0;
                acc.refund += inv.refundAmount || 0;
                acc.net += inv.netAmount || 0;
                return acc;
            },
            { count: 0, gross: 0, refund: 0, net: 0 }
        );
    }, [filtered]);

    const exportInvoice = (inv) => {
        if (!inv) return;
        const content = [
            `Invoice: ${inv.invoiceId}`,
            `Booking: #${inv.bookingId}`,
            `Customer: ${inv.customer.name} (${inv.customer.phone})`,
            `Tour: ${inv.tourCode} - ${inv.tourName}`,
            `Issue Date: ${new Date(inv.issueDate).toLocaleString("vi-VN")}`,
            `Payment: ${inv.paymentMethod}`,
            `Gross: ${inv.grossAmount.toLocaleString()} VND`,
            `Refund: ${inv.refundAmount.toLocaleString()} VND`,
            `Net: ${inv.netAmount.toLocaleString()} VND`,
            `Status: ${inv.status}`,
        ].join("\n");
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${inv.invoiceId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-neutral-900">Invoices</h1>
                <p className="text-sm text-neutral-600">
                    Track invoices per booking; net = gross – refund/credit notes (mock data).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <SummaryCard label="Total invoices" value={totals.count} />
                <SummaryCard label="Gross amount" value={totals.gross} accent />
                <SummaryCard label="Refund/credit" value={totals.refund} />
                <SummaryCard label="Net revenue" value={totals.net} accent />
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex flex-1 gap-2">
                    <input
                        className="border border-neutral-200 bg-white px-3 py-2 rounded-lg w-full md:w-72 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                        placeholder="Search invoice / booking / tour / customer"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <select
                        className="border border-neutral-200 bg-white px-3 py-2 rounded-lg w-full md:w-48 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ALL">All statuses</option>
                        <option value="PAID">Paid</option>
                        <option value="PARTIAL_REFUND">Partial refund</option>
                        <option value="REFUNDED">Refunded</option>
                    </select>
                </div>
                <div className="text-sm text-neutral-600 font-medium">{filtered.length} results</div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-primary-50 border-b border-primary-200">
                        <tr>
                            {["Invoice", "Booking / Tour", "Customer", "Amounts", "Status", "Action"].map((h) => (
                                <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-700">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((inv) => (
                            <tr key={inv.invoiceId} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                                <td className="px-4 py-3">
                                    <div className="font-semibold">{inv.invoiceId}</div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(inv.issueDate).toLocaleString("vi-VN")}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold">Booking #{inv.bookingId}</div>
                                    <div className="text-xs text-gray-500">{inv.tourCode} • {inv.tourName}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold">{inv.customer.name}</div>
                                    <div className="text-xs text-gray-500">{inv.customer.phone}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="text-sm">
                                        <span className="text-gray-500 text-xs">Gross:</span>{" "}
                                        <span className="font-semibold">{inv.grossAmount.toLocaleString()} đ</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-500 text-xs">Refund:</span>{" "}
                                        <span className="text-red-600 font-semibold">-{inv.refundAmount.toLocaleString()} đ</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-500 text-xs">Net:</span>{" "}
                                        <span className="text-primary-600 font-bold">{inv.netAmount.toLocaleString()} đ</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[inv.status] || "bg-neutral-100 text-neutral-700"}`}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 space-x-2">
                                    <button
                                        className="px-3 py-1.5 rounded-lg bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 shadow-sm transition font-medium text-xs"
                                        onClick={() => setSelected(inv)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="px-3 py-1.5 rounded-lg bg-accent-500 text-white hover:bg-accent-600 shadow-sm transition font-medium text-xs"
                                        onClick={() => exportInvoice(inv)}
                                    >
                                        Export
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                                    No invoices found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selected && (
                <InvoiceDrawer invoice={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
}

function SummaryCard({ label, value, accent = false }) {
    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
            <p className="text-xs text-neutral-600 font-medium">{label}</p>
            <p className={`text-2xl font-bold mt-2 ${accent ? "text-primary-600" : "text-neutral-900"}`}>
                {typeof value === "number" ? value.toLocaleString() : value}
            </p>
        </div>
    );
}

function InvoiceDrawer({ invoice, onClose }) {
    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
            <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Invoice</p>
                        <h3 className="text-lg font-semibold">{invoice.invoiceId}</h3>
                        <p className="text-xs text-gray-500">
                            Booking #{invoice.bookingId} • {invoice.tourCode}
                        </p>
                    </div>
                    <button className="text-gray-500 hover:text-gray-800" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    <section className="bg-gray-50 border rounded-xl p-4 space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Issue date</span>
                            <span className="font-semibold">{new Date(invoice.issueDate).toLocaleString("vi-VN")}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Payment method</span>
                            <span className="font-semibold">{invoice.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${statusColor[invoice.status] || "bg-gray-100 text-gray-700"}`}>
                                {invoice.status}
                            </span>
                        </div>
                    </section>

                    <section className="bg-gray-50 border rounded-xl p-4 space-y-1 text-sm">
                        <h4 className="font-semibold text-sm mb-2">Amounts</h4>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Gross</span>
                            <span className="font-semibold">{invoice.grossAmount.toLocaleString()} đ</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                            <span className="text-gray-500">Refund / Credit</span>
                            <span className="font-semibold">-{invoice.refundAmount.toLocaleString()} đ</span>
                        </div>
                        <div className="flex justify-between text-emerald-700">
                            <span className="text-gray-500">Net</span>
                            <span className="font-semibold">{invoice.netAmount.toLocaleString()} đ</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Net = Gross – Refund (credit notes). In real flow, link to refund records by bookingId.
                        </p>
                    </section>

                    <section className="bg-gray-50 border rounded-xl p-4 text-sm space-y-1">
                        <h4 className="font-semibold text-sm mb-2">Customer</h4>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Name</span>
                            <span className="font-semibold">{invoice.customer.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Phone</span>
                            <span className="font-semibold">{invoice.customer.phone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Email</span>
                            <span className="font-semibold">{invoice.customer.email}</span>
                        </div>
                    </section>

                    <section className="bg-gray-50 border rounded-xl p-4 text-sm space-y-1">
                        <h4 className="font-semibold text-sm mb-2">Tour / Booking</h4>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tour</span>
                            <span className="font-semibold">{invoice.tourCode} – {invoice.tourName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Booking ID</span>
                            <span className="font-semibold">#{invoice.bookingId}</span>
                        </div>
                    </section>

                    <section className="bg-gray-50 border rounded-xl p-4 text-sm space-y-2">
                        <h4 className="font-semibold text-sm">Refunds linked to this booking</h4>
                        {invoice.refunds?.length === 0 && (
                            <p className="text-xs text-gray-500">No refund records.</p>
                        )}
                        {invoice.refunds?.map((r) => (
                            <div key={r.refundId} className="border rounded-lg p-3 bg-white">
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Refund #{r.refundId}</span>
                                    <span>Status: {["Pending", "Completed", "Rejected"][r.status]}</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span>Amount</span>
                                    <span className="font-semibold text-red-600">
                                        -{r.refundAmount.toLocaleString()} đ
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    Reason: {r.reason}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Bank: {r.bankInfo.bankName} • {r.bankInfo.bankAccount} • {r.bankInfo.accountHolder}
                                </div>
                            </div>
                        ))}
                    </section>
                </div>

                <div className="p-4 border-t flex gap-3 justify-end">
                    <button
                        className="px-4 py-2 rounded border border-gray-300 text-gray-700"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    <button
                        className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                        onClick={() => {
                            onClose();
                            // mock export
                        }}
                    >
                        Mark as sent (mock)
                    </button>
                </div>
            </div>
        </div>
    );
}

