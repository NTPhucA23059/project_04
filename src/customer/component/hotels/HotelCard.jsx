import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import api from "../../../services/api";

// Convert relative URL to absolute URL
const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}/${url.replace(/^\/+/, "")}`;
};

export default function HotelCard({ hotel }) {
    const navigate = useNavigate();

    // Get image URL with fallback
    const imageSrc = hotel.imageUrl 
        ? toAbsoluteUrl(hotel.imageUrl)
        : (hotel.images && hotel.images.length > 0 
            ? toAbsoluteUrl(hotel.images[0].imageUrl || hotel.images[0].url)
            : "https://placehold.co/600x400?text=No+Image");

    return (
        <div
            onClick={() => navigate(`/hotels/${hotel.hotelID}`)}
            className="cursor-pointer bg-white rounded-2xl shadow-md border border-neutral-200
                       hover:shadow-2xl hover:-translate-y-1 hover:border-primary-400 
                       transition-all duration-300 overflow-hidden group"
        >
            {/* IMAGE */}
            <div className="relative w-full h-56 overflow-hidden rounded-t-2xl">
                <img
                    src={imageSrc}
                    alt={hotel.hotelName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* CONTENT */}
            <div className="p-5 space-y-3">
                {/* NAME */}
                <h3 className="text-lg font-bold text-neutral-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {hotel.hotelName}
                </h3>

                {/* RATING */}
                <div className="flex items-center gap-1 text-accent-500">
                    {Array.from({ length: hotel.rating ?? 0 }, (_, i) => (
                        <FaStar key={i} className="w-4 h-4" />
                    ))}
                    <span className="text-neutral-700 text-sm ml-1">({hotel.rating ?? 0})</span>
                </div>

                {/* PRICE */}
                <div className="pt-2 border-t border-neutral-100">
                    <p className="text-primary-600 font-bold text-xl">
                        ${(hotel.priceMin).toFixed(0)}
                        <span className="text-neutral-700 text-sm font-normal"> / night</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
