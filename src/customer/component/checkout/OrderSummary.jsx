import { formatUSD } from "../../../utils/currency";

export default function OrderSummary({ tour, details, form, orderTotal }) {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
                <div className="flex gap-4">
                    <img
                        src={tour.TourImg}
                        alt={tour.TourName}
                        className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2">{tour.TourName}</p>
                        <p className="text-gray-500 text-xs mt-1">{tour.Duration}</p>
                    </div>
                </div>

                <div className="border-t pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-600">Adults ({form.CapacityAdult})</span>
                        <span className="font-medium">{formatUSD(form.CapacityAdult * details.UnitPrice)}</span>
                    </div>
                    {form.CapacityKid > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Children ({form.CapacityKid})</span>
                            <span className="font-medium">{formatUSD(form.CapacityKid * details.UnitPrice * 0.7)}</span>
                        </div>
                    )}
                    {form.CapacityBaby > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-600">Infants ({form.CapacityBaby})</span>
                            <span className="font-medium">{formatUSD(form.CapacityBaby * details.UnitPrice * 0.3)}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Total</span>
                    <span className="text-2xl font-bold text-primary-600">
                        {formatUSD(orderTotal)}
                    </span>
                </div>
                <p className="text-xs text-gray-500">Including taxes and service fees</p>
            </div>
        </div>
    );
}

