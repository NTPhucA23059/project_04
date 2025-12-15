import React, { useMemo, useState } from "react";
import StaffTourBookingPage from "./StaffTourBookingPage";
import { bookings as sharedBookings, refunds as sharedRefunds } from "../shared/mockBookingFinanceData";

const deriveBookings = () => {
    return sharedBookings.map((b) => {
        const refunds = sharedRefunds.filter((r) => r.bookingId === b.bookingId);
        const refundAmount = refunds.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
        const netAmount = Math.max((b.grossAmount || 0) - refundAmount, 0);
        let status = "PAID";
        if (refundAmount > 0 && refundAmount < (b.grossAmount || 0)) status = "PARTIAL_REFUND";
        if (refundAmount >= (b.grossAmount || 0)) status = "REFUNDED";
        if (b.bookingStatus === "CANCELLED") status = "CANCELLED";
        return {
            bookingID: b.bookingId,
            tourCode: b.tourCode,
            tourName: b.tourName,
            customerName: b.customer.name,
            customerPhone: b.customer.phone,
            status,
            paymentMethod: b.paymentMethod,
            totalPrice: b.grossAmount,
            refundAmount,
            netAmount,
            createdAt: b.createdAt,
            departureDate: b.departureDate,
            seats: b.seats,
        };
    });
};

const statusColors = {
    PENDING: "bg-amber-100 text-amber-800 border border-amber-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border border-blue-200",
    PAID: "bg-green-100 text-green-800 border border-green-200",
    CANCELLED: "bg-red-100 text-red-700 border border-red-200",
};

export default function BookingManagement() {
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("ALL");
    const [selected, setSelected] = useState(null);
    const [view, setView] = useState("table"); // 'table' | 'book'

    const bookings = useMemo(deriveBookings, []);

    const filtered = useMemo(() => {
        const kw = keyword.toLowerCase().trim();
        return bookings.filter((b) => {
            const matchKw =
                !kw ||
                b.tourCode.toLowerCase().includes(kw) ||
                b.tourName.toLowerCase().includes(kw) ||
                b.customerName.toLowerCase().includes(kw) ||
                b.customerPhone.toLowerCase().includes(kw) ||
                String(b.bookingID).includes(kw);
            const matchStatus = status === "ALL" || b.status === status;
            return matchKw && matchStatus;
        });
    }, [keyword, status, bookings]);

    const totals = useMemo(() => {
        return filtered.reduce(
            (acc, b) => {
                acc.count += 1;
                acc.total += b.netAmount || b.totalPrice || 0;
                acc.seats += b.seats || 0;
                acc.refund += b.refundAmount || 0;
                return acc;
            },
            { count: 0, total: 0, seats: 0, refund: 0 }
        );
    }, [filtered]);

    const handleExportInvoice = (booking) => {
        if (!booking) return;
        const content = [
            "HOA DON DAT TOUR",
            `Ma booking: ${booking.bookingID}`,
            `Tour: ${booking.tourCode} - ${booking.tourName}`,
            `Khach hang: ${booking.customerName} (${booking.customerPhone})`,
            `Ngay khoi hanh: ${booking.departureDate}`,
            `So khach: ${booking.seats}`,
            `Thanh toan: ${booking.paymentMethod}`,
            `Tong tien: ${booking.totalPrice.toLocaleString()} VND`,
            `Trang thai: ${booking.status}`,
            `Ngay tao: ${new Date(booking.createdAt).toLocaleString("vi-VN")}`,
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
                    Tour Bookings
                </h1>
                <p className="text-sm text-neutral-600 mt-1">
                    Track all tour bookings, filter by status, and export invoices.
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <p className="text-xs text-neutral-600 font-medium">Total Bookings</p>
                    <p className="text-2xl font-bold mt-2 text-neutral-900">{totals.count}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <p className="text-xs text-neutral-600 font-medium">Total Guests</p>
                    <p className="text-2xl font-bold mt-2 text-neutral-900">{totals.seats}</p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <p className="text-xs text-neutral-600 font-medium">Revenue (mock)</p>
                    <p className="text-2xl font-bold mt-2 text-primary-600">
                        {totals.total.toLocaleString()} đ
                    </p>
                </div>
                <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
                    <p className="text-xs text-neutral-600 font-medium">Refunds (mock)</p>
                    <p className="text-2xl font-bold mt-2 text-red-600">
                        {totals.refund.toLocaleString()} đ
                    </p>
                </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                <div className="flex flex-1 gap-2">
                    <input
                        className="border border-neutral-200 bg-white px-3 py-2 rounded-lg w-full md:w-72 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                        placeholder="Tìm mã booking, tour, khách..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                    <select
                        className="border px-3 py-2 rounded-lg w-full md:w-48"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="PENDING">Chờ xác nhận</option>
                        <option value="CONFIRMED">Đã xác nhận</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="CANCELLED">Đã hủy</option>
                    </select>
                </div>
                <div className="text-sm text-gray-500">
                    {filtered.length} kết quả
                </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            {[
                                "Booking",
                                "Tour",
                                "Khách",
                                "Khởi hành",
                                "Tổng tiền",
                                "TT",
                                "Hành động",
                            ].map((h) => (
                                <th key={h} className="px-4 py-3 text-left">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((b) => (
                            <tr key={b.bookingID} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    <div className="font-semibold">#{b.bookingID}</div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(b.createdAt).toLocaleString("vi-VN")}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold">{b.tourCode}</div>
                                    <div className="text-xs text-gray-500 line-clamp-1">
                                        {b.tourName}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold">{b.customerName}</div>
                                    <div className="text-xs text-gray-500">
                                        {b.customerPhone}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div>{b.departureDate}</div>
                                    <div className="text-xs text-gray-500">
                                        {b.seats} khách • {b.paymentMethod}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold text-green-700">
                                        {b.netAmount.toLocaleString()} đ
                                    </div>
                                    {b.refundAmount > 0 && (
                                        <div className="text-xs text-red-600">
                                            Refund: -{b.refundAmount.toLocaleString()} đ
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[b.status] || "bg-gray-100 text-gray-700"}`}>
                                        {b.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 space-x-2">
                                    <button
                                        className="px-3 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200"
                                        onClick={() => setSelected(b)}
                                    >
                                        Xem
                                    </button>
                                    <button
                                        className="px-3 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                        onClick={() => handleExportInvoice(b)}
                                    >
                                        Xuất hóa đơn
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td className="px-4 py-6 text-center text-gray-500" colSpan={7}>
                                    Không có booking nào khớp bộ lọc.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <div>
                                <p className="text-xs text-gray-500">Booking #{selected.bookingID}</p>
                                <h3 className="text-lg font-semibold">{selected.tourName}</h3>
                            </div>
                            <button
                                className="text-gray-500 hover:text-gray-800"
                                onClick={() => setSelected(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Khách hàng</p>
                                    <p className="font-semibold">{selected.customerName}</p>
                                    <p className="text-gray-600">{selected.customerPhone}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Ngày tạo</p>
                                    <p className="font-semibold">
                                        {new Date(selected.createdAt).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Khởi hành</p>
                                    <p className="font-semibold">{selected.departureDate}</p>
                                    <p className="text-gray-600">{selected.seats} khách</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Thanh toán</p>
                                    <p className="font-semibold">{selected.paymentMethod}</p>
                                    <p className="text-gray-600">Trạng thái: {selected.status}</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 border text-sm">
                                <div className="flex justify-between mb-2">
                                    <span>Tạm tính</span>
                                    <span className="font-semibold">
                                        {selected.totalPrice.toLocaleString()} đ
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-xs">
                                    <span>Thuế & phí (mock)</span>
                                    <span>Đã bao gồm</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    className="px-4 py-2 rounded border border-gray-300 text-gray-700"
                                    onClick={() => setSelected(null)}
                                >
                                    Đóng
                                </button>
                                <button
                                    className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                                    onClick={() => handleExportInvoice(selected)}
                                >
                                    Xuất hóa đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
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
        </div>
    );
}

