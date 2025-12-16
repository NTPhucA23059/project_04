import { CalendarIcon } from "@heroicons/react/24/outline";

export default function CheckoutHeader({ tour, details }) {
    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDateTime = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
                <img
                    src={tour.TourImg}
                    alt={tour.TourName}
                    className="w-full md:w-48 h-48 object-cover rounded-lg"
                />
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">{tour.TourName}</h1>
                    <p className="text-gray-600 mb-4">
                        {tour.TourDescription?.substring(0, 150)}...
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-blue-600 font-medium mb-1">Departure Date</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(details.DepartureDate)}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatDateTime(details.DepartureDate)}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                            <CalendarIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-green-600 font-medium mb-1">Return Date</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(details.ArrivalDate)}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatDateTime(details.ArrivalDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

