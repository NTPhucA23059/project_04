import {
    MapPinIcon,
    ClockIcon,
    TagIcon,
    PaperAirplaneIcon
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function TourCard({ tour, schedule }) {

    // Convert to USD format
    const formatUSD = (value) =>
        value?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }) || "$0";

    // Fallbacks
    const imageSrc =
        tour.Images?.[0] ||
        tour.TourImg ||
        "https://placehold.co/600x400?text=No+Image";

    const price = tour.PriceFrom || tour.Price || 0;
    const startingCity = tour.StartingCity || tour.StartingLocation || "Unknown";

    const schedulePreview = (schedule || []).slice(0, 3);

    return (
        <div className="relative bg-white rounded-xl border border-neutral-200 shadow-sm p-4 flex gap-5 hover:shadow-xl transition">

            {/* ==== IMAGE ==== */}
            <div className="w-56 h-40 shrink-0 rounded-lg overflow-hidden">
                <img
                    src={imageSrc}
                    alt={tour.TourName}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* ==== CONTENT ==== */}
            <div className="flex flex-col flex-1">

                {/* Title */}
                <h2 className="text-lg font-semibold text-neutral-900 mb-1 line-clamp-2">
                    {tour.TourName}
                </h2>

                {/* Info line */}
                <div className="grid grid-cols-2 gap-1 text-sm text-neutral-700 mb-2">

                    <div className="flex items-center gap-2">
                        <TagIcon className="w-4 h-4 text-primary-500" />
                        <span>Tour code:</span>
                        <span className="font-medium">{tour.TourCode}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-primary-500" />
                        <span>Duration:</span>
                        <span className="font-medium">{tour.Duration}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-primary-500" />
                        <span>Departure:</span>
                        <span className="font-medium text-primary-600">
                            {startingCity}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <PaperAirplaneIcon className="w-4 h-4 text-primary-500" />
                        <span>Transport:</span>
                        <span className="font-medium">
                            {tour.Transportation || "N/A"}
                        </span>
                    </div>
                </div>

                {/* Schedule preview */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm text-neutral-700">Schedule:</span>

                    {schedulePreview.length === 0 && (
                        <span className="text-sm text-neutral-500">Updating...</span>
                    )}

                    {schedulePreview.map((item, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-0.5 border border-primary-500 rounded-md text-primary-600 font-medium text-sm"
                        >
                            Day {item.DayNumber}: {item.Title || "N/A"}
                        </span>
                    ))}
                </div>

                {/* Bottom price + button */}
                <div className="flex items-end justify-between mt-auto">

                    {/* Price */}
                    <div>
                        <div className="text-neutral-600 text-sm">Price from:</div>
                        <div className="text-primary-600 text-2xl font-bold">
                            {formatUSD(price)}
                        </div>
                    </div>

                    <Link
                        to={`/tours/${tour.TourID}`}
                        className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-2 rounded-lg transition block text-center"
                    >
                        View details
                    </Link>

                </div>
            </div>

            {/* ==== Best Price Badge ==== */}
            {tour.IsBestPrice && (
                <div className="absolute top-3 left-3 bg-accent-500 text-white text-xs px-3 py-1 rounded-full shadow-md">
                    ⭐ Best Price
                </div>
            )}
        </div>
    );
}
