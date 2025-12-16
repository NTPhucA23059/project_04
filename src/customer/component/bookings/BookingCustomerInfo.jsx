import { UserIcon, PhoneIcon, EnvelopeIcon, IdentificationIcon } from "@heroicons/react/24/outline";

export default function BookingCustomerInfo({ booking }) {
    return (
        <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-primary-600" />
                    <span><strong>Name:</strong> {booking.CustomerName || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2">
                    <PhoneIcon className="w-5 h-5 text-primary-600" />
                    <span><strong>Phone:</strong> {booking.CustomerPhone || "N/A"}</span>
                </div>

                <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-5 h-5 text-primary-600" />
                    <span><strong>Email:</strong> {booking.CustomerEmail || "N/A"}</span>
                </div>

                {booking.CustomerCitizenCard && (
                    <div className="flex items-center gap-2">
                        <IdentificationIcon className="w-5 h-5 text-primary-600" />
                        <span><strong>Citizen ID:</strong> {booking.CustomerCitizenCard}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

