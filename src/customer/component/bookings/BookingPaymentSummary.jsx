export default function BookingPaymentSummary({ booking }) {
    const priceAdult = booking.UnitPrice || 0;
    const priceChild = Math.round(priceAdult * 0.7);
    const priceInfant = Math.round(priceAdult * 0.3);

    const subAdult = priceAdult * booking.CapacityAdult;
    const subChild = priceChild * booking.CapacityKid;
    const subInfant = priceInfant * booking.CapacityBaby;

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Summary</h3>

            <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-700">
                        <tr>
                            <th className="p-3 text-left">Passenger Type</th>
                            <th className="p-3 text-right">Unit Price</th>
                            <th className="p-3 text-right">Quantity</th>
                            <th className="p-3 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t">
                            <td className="p-3">Adult</td>
                            <td className="p-3 text-right">${priceAdult.toLocaleString()}</td>
                            <td className="p-3 text-right">{booking.CapacityAdult}</td>
                            <td className="p-3 text-right font-semibold">${subAdult.toLocaleString()}</td>
                        </tr>

                        {booking.CapacityKid > 0 && (
                            <tr className="border-t">
                                <td className="p-3">Child (70%)</td>
                                <td className="p-3 text-right">${priceChild.toLocaleString()}</td>
                                <td className="p-3 text-right">{booking.CapacityKid}</td>
                                <td className="p-3 text-right font-semibold">${subChild.toLocaleString()}</td>
                            </tr>
                        )}

                        {booking.CapacityBaby > 0 && (
                            <tr className="border-t">
                                <td className="p-3">Infant (30%)</td>
                                <td className="p-3 text-right">${priceInfant.toLocaleString()}</td>
                                <td className="p-3 text-right">{booking.CapacityBaby}</td>
                                <td className="p-3 text-right font-semibold">${subInfant.toLocaleString()}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-right">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="font-bold text-primary-700 text-2xl">
                    ${booking.OrderTotal.toLocaleString()}
                </p>
            </div>
        </div>
    );
}

