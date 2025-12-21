export default function PaymentMethodSelector({ form, errors, onUpdate }) {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
                Payment Method
            </h2>

            <div className="space-y-3">
                {/* COD */}
                <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${form.PaymentMethod === "COD"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="COD"
                        checked={form.PaymentMethod === "COD"}
                        onChange={(e) => onUpdate("PaymentMethod", e.target.value)}
                        className="mt-1 w-4 h-4 text-primary-600"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">Cash on Delivery (COD)</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                            Pay directly at the office when receiving tickets
                        </p>
                        {form.PaymentMethod === "COD" && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800 font-medium">
                                    ⚠️ <strong>Important Notice:</strong> You must come to the office to pay within <strong>24 hours</strong> from booking time.
                                    If payment is not made within this time, the order will be automatically cancelled.
                                </p>
                            </div>
                        )}
                    </div>
                </label>

                {/* MOMO */}
                <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${form.PaymentMethod === "MOMO"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="MOMO"
                        checked={form.PaymentMethod === "MOMO"}
                        onChange={(e) => onUpdate("PaymentMethod", e.target.value)}
                        className="mt-1 w-4 h-4 text-primary-600"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">MoMo</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Fast and secure payment via MoMo e-wallet
                        </p>
                    </div>
                </label>

                {/* PAYPAL */}
                <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${form.PaymentMethod === "PAYPAL"
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}>
                    <input
                        type="radio"
                        name="paymentMethod"
                        value="PAYPAL"
                        checked={form.PaymentMethod === "PAYPAL"}
                        onChange={(e) => onUpdate("PaymentMethod", e.target.value)}
                        className="mt-1 w-4 h-4 text-primary-600"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">PayPal</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Secure international payment via PayPal
                        </p>
                    </div>
                </label>
            </div>

            {errors.PaymentMethod && (
                <p className="text-red-600 text-sm mt-2">{errors.PaymentMethod}</p>
            )}
        </section>
    );
}

