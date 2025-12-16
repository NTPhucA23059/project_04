export default function BookingPassengers({ booking }) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Passengers</h3>
            <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                    <span>Adult: <strong>{booking.CapacityAdult}</strong></span>
                </li>
                {booking.CapacityKid > 0 && (
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        <span>Child: <strong>{booking.CapacityKid}</strong></span>
                    </li>
                )}
                {booking.CapacityBaby > 0 && (
                    <li className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                        <span>Infant: <strong>{booking.CapacityBaby}</strong></span>
                    </li>
                )}
            </ul>
            <p className="mt-3 text-sm text-gray-600">
                <strong>Total Guests:</strong> {booking.CapacityAdult + booking.CapacityKid + booking.CapacityBaby}
            </p>
        </div>
    );
}

