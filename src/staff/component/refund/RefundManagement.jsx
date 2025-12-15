import React, { useMemo, useState } from "react";
import { bookings as sharedBookings, refunds as sharedRefunds } from "../shared/mockBookingFinanceData";

const statusMap = {
    0: { label: "Pending", className: "bg-amber-100 text-amber-800 border border-amber-200" },
    1: { label: "Completed", className: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
    2: { label: "Rejected", className: "bg-red-100 text-red-700 border border-red-200" },
};

export default function RefundManagement() {
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [keyword, setKeyword] = useState("");
    const [selected, setSelected] = useState(null);

    const data = useMemo(() => {
        return sharedRefunds.map((r) => {
            const booking = sharedBookings.find((b) => b.bookingId === r.bookingId);
            return {
                refundID: r.refundId,
                tourBookingID: r.bookingId,
                refundPercentage: r.refundPercentage,
                refundAmount: r.refundAmount,
                refundReason: r.reason,
                refundStatus: r.status,
                cancelDate: r.cancelDate,
                processedDate: r.processedDate,
                staffID: r.staffId || null,
                bankInfo: r.bankInfo,
                customer: booking?.customer || {},
                tour: {
                    code: booking?.tourCode,
                    name: booking?.tourName,
                    departureDate: booking?.departureDate,
                    totalPaid: booking?.grossAmount,
                },
            };
        });
    }, []);

    const filtered = useMemo(() => {
        const kw = keyword.toLowerCase().trim();
        return data.filter((r) => {
            const matchKw =
                !kw ||
                String(r.refundID).includes(kw) ||
                String(r.tourBookingID).includes(kw) ||
                r.customer.name.toLowerCase().includes(kw) ||
                r.customer.phone.toLowerCase().includes(kw) ||
                r.tour.code.toLowerCase().includes(kw) ||
                r.tour.name.toLowerCase().includes(kw);
            const matchStatus = statusFilter === "ALL" || r.refundStatus === Number(statusFilter);
            return matchKw && matchStatus;
        });
    }, [keyword, statusFilter, data]);

    const totals = useMemo(() => {
        return filtered.reduce(
            (acc, r) => {
                acc.count += 1;
                acc.amount += r.refundAmount || 0;
                return acc;
            },
            { count: 0, amount: 0 }
        );
    }, [filtered]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold text-neutral-900">Refunds</h1>
                <p className="text-sm text-neutral-600">
                    Handle customer tour cancellations and refund requests. (UI mock only)
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <p className="text-xs text-neutral-600 font-medium">Total Requests</p>
                    <p className="text-2xl font-bold mt-2 text-neutral-900">{totals.count}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <p className="text-xs text-neutral-600 font-medium">Amount (mock)</p>
                    <p className="text-2xl font-bold mt-2 text-primary-600">
                        {totals.amount.toLocaleString()} đ
                    </p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <p className="text-xs text-neutral-600 font-medium">Completed</p>
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
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="ALL">All statuses</option>
                        <option value="0">Pending</option>
                        <option value="1">Completed</option>
                        <option value="2">Rejected</option>
                    </select>
                </div>
                <div className="text-sm text-neutral-600 font-medium">{filtered.length} results</div>
            </div>

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
                                        Cancelled: {new Date(r.cancelDate).toLocaleString("vi-VN")}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold">{r.tour.code}</div>
                                    <div className="text-xs text-gray-500 line-clamp-1">{r.tour.name}</div>
                                    <div className="text-xs text-gray-500">Booking #{r.tourBookingID}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold">{r.customer.name}</div>
                                    <div className="text-xs text-gray-500">{r.customer.phone}</div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-bold text-primary-600">
                                        {r.refundAmount.toLocaleString()} đ
                                    </div>
                                    <div className="text-xs text-neutral-500">{r.refundPercentage}% of paid</div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[r.refundStatus]?.className || "bg-neutral-100 text-neutral-700"}`}>
                                        {statusMap[r.refundStatus]?.label || "Unknown"}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        className="px-3 py-1.5 rounded-lg bg-primary-600 text-white border border-primary-600 hover:bg-primary-700 shadow-sm transition font-medium text-xs"
                                        onClick={() => setSelected(r)}
                                    >
                                        View / Process
                                    </button>
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

            {selected && (
                <RefundDrawer refund={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
}

function RefundDrawer({ refund, onClose }) {
    const [percentage, setPercentage] = useState(refund.refundPercentage || 0);
    const [amount, setAmount] = useState(refund.refundAmount || 0);
    const [status, setStatus] = useState(refund.refundStatus ?? 0);
    const [reason, setReason] = useState(refund.refundReason || "");
    const [note, setNote] = useState(refund.bankInfo?.note || "");
    const [bankInfo, setBankInfo] = useState({
        bankName: refund.bankInfo?.bankName || "",
        bankAccount: refund.bankInfo?.bankAccount || "",
        accountHolder: refund.bankInfo?.accountHolder || "",
    });

    const quickCompute = (percent) => {
        setPercentage(percent);
        const base = refund.tour.totalPaid || 0;
        const computed = Math.round((base * percent) / 100);
        setAmount(computed);
    };

    const handleSave = () => {
        // Mock only; just close
        alert("Mock save: refund processed (UI only).");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-end z-50">
            <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Refund #{refund.refundID}</p>
                        <h3 className="text-lg font-semibold">{refund.tour.name}</h3>
                        <p className="text-xs text-gray-500">
                            Booking #{refund.tourBookingID} • Departure {refund.tour.departureDate}
                        </p>
                    </div>
                    <button className="text-gray-500 hover:text-gray-800" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
                    <section className="bg-gray-50 border rounded-xl p-4">
                        <h4 className="font-semibold text-sm mb-2">Customer</h4>
                        <p className="text-sm">{refund.customer.name}</p>
                        <p className="text-xs text-gray-500">{refund.customer.phone}</p>
                        <p className="text-xs text-gray-500">{refund.customer.email}</p>
                    </section>

                    <section className="bg-gray-50 border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">Paid amount</p>
                                <p className="font-semibold">{refund.tour.totalPaid.toLocaleString()} đ</p>
                            </div>
                            <div className="text-xs text-gray-500">
                                Cancelled {new Date(refund.cancelDate).toLocaleString("vi-VN")}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500">Refund %</label>
                                <input
                                    type="number"
                                    className="mt-1 w-full border rounded px-3 py-2"
                                    value={percentage}
                                    onChange={(e) => setPercentage(Number(e.target.value) || 0)}
                                />
                                <div className="flex gap-2 mt-2">
                                    {[100, 80, 50, 0].map((p) => (
                                        <button
                                            key={p}
                                            className="px-2 py-1 text-xs border rounded hover:bg-gray-100"
                                            onClick={() => quickCompute(p)}
                                        >
                                            {p}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">Refund amount</label>
                                <input
                                    type="number"
                                    className="mt-1 w-full border rounded px-3 py-2"
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                                />
                                <p className="text-xs text-gray-500 mt-1">Currency: VND (mock)</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500">Reason</label>
                            <textarea
                                rows={2}
                                className="mt-1 w-full border rounded px-3 py-2"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </section>

                    <section className="bg-gray-50 border rounded-xl p-4 space-y-3">
                        <h4 className="font-semibold text-sm">Bank info</h4>
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-xs text-gray-500">Bank name</label>
                                <input
                                    className="mt-1 w-full border rounded px-3 py-2"
                                    value={bankInfo.bankName}
                                    onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs text-gray-500">Account number</label>
                                    <input
                                        className="mt-1 w-full border rounded px-3 py-2"
                                        value={bankInfo.bankAccount}
                                        onChange={(e) => setBankInfo({ ...bankInfo, bankAccount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Account holder</label>
                                    <input
                                        className="mt-1 w-full border rounded px-3 py-2"
                                        value={bankInfo.accountHolder}
                                        onChange={(e) => setBankInfo({ ...bankInfo, accountHolder: e.target.value })}
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
                                />
                            </div>
                        </div>
                    </section>

                    <section className="bg-gray-50 border rounded-xl p-4 space-y-3">
                        <h4 className="font-semibold text-sm">Status</h4>
                        <div className="flex gap-2">
                            {[0, 1, 2].map((s) => (
                                <button
                                    key={s}
                                    className={`px-3 py-2 rounded text-sm border ${status === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 hover:bg-gray-100"}`}
                                    onClick={() => setStatus(s)}
                                >
                                    {statusMap[s].label}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500">
                            Processing date and staff assignment are mocked; hook to backend in real flow.
                        </p>
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
                        onClick={handleSave}
                    >
                        Save (mock)
                    </button>
                </div>
            </div>
        </div>
    );
}

