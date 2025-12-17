import { useNavigate } from "react-router-dom";
import { 
    UserGroupIcon, 
    CogIcon, 
    CheckCircleIcon 
} from "@heroicons/react/24/outline";
import api from "../../../services/api";
import { formatUSD } from "../../../utils/currency";

// Convert relative URL to absolute URL - same logic as CarDetailWrapper
const toAbsoluteUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    
    // Already absolute URL
    if (/^https?:\/\//.test(url)) return url;
    
    // If it's already a full path starting with /, add base URL
    if (url.startsWith('/')) {
        const base = (api.defaults.baseURL || window.location.origin).replace(/\/$/, "");
        return `${base}${url}`;
    }
    
    // Relative path - need to add base URL
    const base = (api.defaults.baseURL || window.location.origin).replace(/\/$/, "");
    const cleanUrl = url.replace(/^\/+/, "");
    return `${base}/${cleanUrl}`;
};

// Get main image URL from car object - same logic as CarDetailWrapper
const getCarImageUrl = (car) => {
    if (!car) return "https://placehold.co/600x400?text=Car+Image";
    
    // First, try to get images from car.images array
    if (car.images && car.images.length > 0) {
        const firstImg = car.images[0];
        const imageUrl = firstImg.imageUrl || firstImg.ImageUrl || firstImg.image || firstImg.url;
        if (imageUrl) {
            const absoluteUrl = toAbsoluteUrl(imageUrl);
            if (absoluteUrl) return absoluteUrl;
        }
    }
    
    // If no images from array, try main image from car object
    const mainImageUrl = car.image || car.imageUrl || car.ImageUrl || car.Image || car.MainImage;
    if (mainImageUrl) {
        const absoluteUrl = toAbsoluteUrl(mainImageUrl);
        if (absoluteUrl) return absoluteUrl;
    }
    
    // Fallback to placeholder
    return "https://placehold.co/600x400?text=Car+Image";
};

const handleImageError = (e) => {
    if (e && e.target) {
        e.target.src = "https://placehold.co/600x400?text=Car+Image";
        e.target.onerror = null; // Prevent infinite loop
    }
};

export default function CarCard({ car }) {
    const navigate = useNavigate();
    const carId = car.CarID ?? car.carID;
    const dailyRate = Number(car.DailyRate ?? car.dailyRate ?? 0);
    const seats = car.SeatingCapacity ?? car.seatingCapacity ?? 0;
    const hasAC = car.HasAirConditioner ?? car.hasAirConditioner ?? false;
    const hasDriver = car.HasDriverOption ?? car.hasDriverOption ?? false;
    const transmission = car.Transmission || car.transmission || "";
    const status = car.Status ?? car.status ?? 1;
    const isAvailable = status === 1;

    const imageUrl = getCarImageUrl(car);

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-xl transition-all duration-300 group">
            {/* IMAGE WITH STATUS BADGE */}
            <div className="relative w-full h-56 overflow-hidden bg-neutral-100">
                <img
                    src={imageUrl}
                    alt={car.ModelName || car.modelName || "Car"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={handleImageError}
                />
                {isAvailable && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircleIcon className="w-4 h-4" />
                        Available
                    </div>
                )}
                {!isAvailable && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Unavailable
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-5">
                <div className="mb-2">
                    <h3 className="text-lg font-bold text-neutral-900">{car.ModelName || car.modelName}</h3>
                    <p className="text-neutral-500 text-sm">{car.Brand || car.brand}</p>
                </div>

                {/* FEATURES */}
                <div className="flex flex-wrap gap-3 mt-3 mb-3">
                    <div className="flex items-center gap-1 text-neutral-600 text-sm">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{seats} seats</span>
                    </div>
                    {hasAC && (
                        <div className="flex items-center gap-1 text-blue-600 text-sm">
                            <span className="text-base">❄️</span>
                            <span>AC</span>
                        </div>
                    )}
                    {transmission && (
                        <div className="flex items-center gap-1 text-neutral-600 text-sm">
                            <CogIcon className="w-4 h-4" />
                            <span>{transmission}</span>
                        </div>
                    )}
                    {hasDriver && (
                        <div className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            Driver Available
                        </div>
                    )}
                </div>

                {/* PRICE */}
                <div className="mt-3 mb-4">
                    <div className="text-primary-600 font-bold text-2xl">
                        {formatUSD(dailyRate)}
                        <span className="text-neutral-500 text-sm font-normal"> / day</span>
                    </div>
                </div>

                {/* BUTTON */}
                <button
                    onClick={() => navigate(`/car/${carId}`)}
                    disabled={!isAvailable}
                    className={`w-full py-2.5 rounded-lg font-semibold transition ${
                        isAvailable
                            ? "bg-primary-600 hover:bg-primary-700 text-white"
                            : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                    }`}
                >
                    {isAvailable ? "View Details" : "Unavailable"}
                </button>
            </div>
        </div>
    );
}
