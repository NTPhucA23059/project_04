import { useState } from "react";
import { BuildingOfficeIcon, CreditCardIcon, UserIcon } from "@heroicons/react/24/outline";

export default function CancelBookingModal({ 
    show, 
    refundInfo, 
    bookingTotal, // Original booking total amount
    onClose, 
    onSubmit,
    isSubmitting = false
}) {
    const [bankName, setBankName] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [accountHolder, setAccountHolder] = useState("");
    const [refundReason, setRefundReason] = useState("");
    const [error, setError] = useState("");

    // List of popular banks in Vietnam
    const banks = [
        "Vietcombank (VCB)",
        "BIDV",
        "Vietinbank (CTG)",
        "Agribank",
        "Techcombank (TCB)",
        "ACB (Asia Commercial Bank)",
        "MBBank (Military Bank)",
        "VPBank",
        "TPBank",
        "Sacombank (STB)",
        "HDBank",
        "SHB (Saigon Hanoi Bank)",
        "VIB (Vietnam International Bank)",
        "Eximbank",
        "MSB (Maritime Bank)",
        "Other"
    ];

    const handleSubmit = () => {
        // Validation
        if (!bankName.trim()) {
            setError("Bank name is required.");
            setTimeout(() => setError(""), 3000);
            return;
        }

        if (!accountNumber.trim()) {
            setError("Account number is required.");
            setTimeout(() => setError(""), 3000);
            return;
        }

        // Validate account number (should be numeric, 8-20 digits)
        const accountNumberRegex = /^[0-9]{8,20}$/;
        if (!accountNumberRegex.test(accountNumber.trim().replace(/\s/g, ""))) {
            setError("Account number must be 8-20 digits (numbers only).");
            setTimeout(() => setError(""), 3000);
            return;
        }

        if (!accountHolder.trim()) {
            setError("Account holder name is required.");
            setTimeout(() => setError(""), 3000);
            return;
        }

        // Validate account holder name (should be at least 2 characters, letters and spaces)
        if (accountHolder.trim().length < 2) {
            setError("Account holder name must be at least 2 characters.");
            setTimeout(() => setError(""), 3000);
            return;
        }

        onSubmit({
            bankName: bankName.trim(),
            accountNumber: accountNumber.trim().replace(/\s/g, ""),
            accountHolder: accountHolder.trim(),
            note: refundReason.trim(),
        });

        // Reset form
        setBankName("");
        setAccountNumber("");
        setAccountHolder("");
        setRefundReason("");
        setError("");
    };

    if (!show || !refundInfo) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-2xl mx-auto my-8 p-6 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white pb-4 border-b border-gray-200 mb-4">
                    <h2 className="text-2xl font-bold">Cancel Booking & Refund Request</h2>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200 mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Refund Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Days before departure:</span>
                            <span className="font-semibold text-gray-900">{refundInfo.daysBefore} day{refundInfo.daysBefore !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Refund rate:</span>
                            <span className="font-semibold text-gray-900">{(refundInfo.rate * 100).toFixed(0)}%</span>
                        </div>
                        {bookingTotal && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Original Amount:</span>
                                <span className="font-semibold text-gray-900">
                                    ${bookingTotal.toLocaleString()}
                                </span>
                            </div>
                        )}
                        <div className="pt-2 border-t border-blue-200 mt-2 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium">Refund Amount:</span>
                                <span className="font-bold text-green-700 text-xl">
                                    ${refundInfo.refundAmount.toLocaleString()}
                                </span>
                            </div>
                            {bookingTotal && (
                                <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                                    <span>You will receive:</span>
                                    <span className="font-semibold text-green-600">
                                        ${refundInfo.refundAmount.toLocaleString()}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CreditCardIcon className="w-5 h-5 text-primary-600" />
                        Bank Information for Refund
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <BuildingOfficeIcon className="w-4 h-4 text-gray-500" />
                                Bank Name <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition bg-white ${
                                    error && !bankName.trim() ? "border-red-500" : "border-gray-300"
                                }`}
                            >
                                <option value="">-- Select Bank --</option>
                                {banks.map((bank) => (
                                    <option key={bank} value={bank}>
                                        {bank}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <CreditCardIcon className="w-4 h-4 text-gray-500" />
                                Account Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={accountNumber}
                                onChange={(e) => {
                                    // Only allow numbers
                                    const value = e.target.value.replace(/\D/g, "");
                                    setAccountNumber(value);
                                }}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                                    error && !accountNumber.trim() ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Enter account number (8-20 digits)"
                                maxLength={20}
                            />
                            <p className="text-xs text-gray-500 mt-1">Numbers only, 8-20 digits</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-gray-500" />
                                Account Holder Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={accountHolder}
                                onChange={(e) => setAccountHolder(e.target.value)}
                                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
                                    error && !accountHolder.trim() ? "border-red-500" : "border-gray-300"
                                }`}
                                placeholder="Enter account holder name (as shown on bank account)"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Refund (Optional)
                            </label>
                            <textarea
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition resize-none"
                                placeholder="Please provide a reason for cancellation (e.g., change of plans, emergency, etc.)..."
                                rows={3}
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Submitting...</span>
                            </>
                        ) : (
                            "Submit Refund Request"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

