import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchTours } from "../../../services/customer/tourService";
import { fetchCars } from "../../../services/customer/carService";
import TourCard from "../tour/TourCard";
import CarCard from "../car/CarCard";
import api from "../../../services/api";

export default function SearchPage() {
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();
    const q = params.get("q") || "";
    const [query, setQuery] = useState(q);
    const inputRef = useRef(null);
    const [activeTab, setActiveTab] = useState("all"); // "all", "tours", "cars"
    const [tours, setTours] = useState([]);
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const popularSearches = [
        "Vietnam Tour",
        "Hanoi",
        "Ho Chi Minh City",
        "Luxury Car",
        "SUV Rental",
        "Beach Tour",
    ];

    const suggestions = [
        "Adventure Tour",
        "Cultural Tour",
        "Family Tour",
        "Sedan Car",
        "7 Seater Car",
        "Airport Transfer",
    ];

    const [recent, setRecent] = useState(() => {
        return JSON.parse(localStorage.getItem("recentSearches")) || [];
    });

    // Convert relative URL to absolute URL
    const toAbsoluteUrl = (url) => {
        if (!url) return "";
        if (/^https?:\/\//.test(url)) return url;
        const base = (api.defaults.baseURL || "").replace(/\/$/, "");
        return `${base}/${url.replace(/^\/+/, "")}`;
    };

    // Map tour response to UI shape
    const mapTour = (t) => {
        const firstDetail = t.details && t.details.length > 0 ? t.details[0] : t.detail;
        const schedules = (firstDetail?.schedules || []).map((s) => ({
            ScheduleID: s.scheduleID,
            DayNumber: s.dayNumber,
            Title: s.title,
            Summary: s.summary,
            Notes: s.notes,
            Items: (s.items || []).map((it) => ({
                ItemID: it.itemID,
                TimeInfo: it.timeInfo,
                Activity: it.activity,
                Transportation: it.transportation,
                SortOrder: it.sortOrder,
                AttractionName: it.attractionName,
            })),
        }));

        let minPrice = undefined;
        if (t.details && t.details.length > 0) {
            const prices = t.details
                .filter(d => d.unitPrice)
                .map(d => Number(d.unitPrice));
            if (prices.length > 0) {
                minPrice = Math.min(...prices);
            }
        } else if (firstDetail?.unitPrice) {
            minPrice = Number(firstDetail.unitPrice);
        }

        return {
            TourID: t.tourID,
            TourCode: t.tourCode,
            TourName: t.tourName,
            TourImg: t.tourImg ? toAbsoluteUrl(t.tourImg) : null,
            Images: (t.images || []).map(img => ({
                ImageID: img.imageID,
                ImageUrl: toAbsoluteUrl(img.imageUrl),
            })),
            TourDescription: t.tourDescription,
            Nation: t.nation,
            StartingLocation: t.startingLocation,
            Duration: t.duration,
            CategoryID: t.categoryID,
            CategoryName: t.categoryName,
            Price: minPrice,
            PriceFrom: minPrice,
            Schedules: schedules,
            TourCities: (t.tourCities || []).map(tc => ({
                CityID: tc.cityID,
                CityName: tc.cityName,
                CityOrder: tc.cityOrder,
                StayDays: tc.stayDays,
            })),
        };
    };

    // Sync query state with URL params
    useEffect(() => {
        setQuery(q);
    }, [q]);

    // Search tours and cars
    useEffect(() => {
        if (!q.trim()) {
            setTours([]);
            setCars([]);
            return;
        }

        const search = async () => {
            setLoading(true);
            setError("");
            try {
                // Search tours
                const toursRes = await fetchTours({
                    page: 0,
                    size: 20,
                    keyword: q,
                });
                const mappedTours = (toursRes.items || []).map(mapTour);
                setTours(mappedTours);

                // Search cars
                const carsRes = await fetchCars({
                    page: 0,
                    size: 20,
                    keyword: q,
                });
                setCars(carsRes.items || []);
            } catch (err) {
                console.error("Search error:", err);
                setError(err.message || "Failed to search. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        search();
    }, [q]);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const handleSearch = (term) => {
        if (!term.trim()) return;
        const updated = [term, ...recent.filter((x) => x !== term)].slice(0, 6);
        setRecent(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));

        // Update URL params
        setParams({ q: term });
        setQuery(term);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col px-6 py-16 relative">

            {/* ⬅ BUTTON RETURN HOME */}
            <button
                onClick={() => (window.location.href = "/")}
                className="w-10 h-10 flex items-center justify-center bg-black 
               rounded-full text-white absolute top-6 right-6
               hover:bg-neutral-800 transition"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>


            <div className="w-full max-w-2xl mx-auto mt-16">
                {/* Search */}
                <div className="flex items-center border-b border-gray-300 pb-3 mt-10">
                    <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search here..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                        className="ml-3 flex-1 bg-transparent text-3xl placeholder-gray-400 
                                   text-gray-700 focus:outline-none"
                    />
                </div>

                {/* SUGGESTIONS */}
                {query && (
                    <div className="mt-8">
                        <p className="text-sm text-neutral-500 mb-3">Suggestions</p>
                        <div className="flex flex-col gap-3">
                            {suggestions
                                .filter((item) =>
                                    item.toLowerCase().includes(query.toLowerCase())
                                )
                                .map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => handleSearch(item)}
                                        className="text-lg text-gray-700 hover:text-black flex items-center justify-between group"
                                    >
                                        {item}
                                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 group-hover:text-black" />
                                    </button>
                                ))}
                        </div>
                    </div>
                )}

                {/* Recent */}
                {!query && recent.length > 0 && (
                    <div className="mt-10">
                        <p className="text-sm text-neutral-500 mb-3">Recent Searches</p>
                        <div className="flex flex-wrap gap-2">
                            {recent.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => handleSearch(item)}
                                    className="px-4 py-1.5 border rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Popular */}
                {!query && (
                    <div className="mt-10">
                        <p className="text-sm text-neutral-500 mb-3">Popular Searches</p>
                        <div className="flex flex-wrap gap-2">
                            {popularSearches.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => handleSearch(item)}
                                    className="px-4 py-1.5 border rounded-full text-gray-700 bg-white hover:bg-black hover:text-white transition"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {query && (
                    <div className="mt-10">
                        {/* Tabs */}
                        <div className="flex gap-4 border-b mb-6">
                            <button
                                onClick={() => setActiveTab("all")}
                                className={`pb-3 px-4 font-semibold transition ${
                                    activeTab === "all"
                                        ? "text-primary-600 border-b-2 border-primary-600"
                                        : "text-neutral-500 hover:text-neutral-700"
                                }`}
                            >
                                All ({tours.length + cars.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("tours")}
                                className={`pb-3 px-4 font-semibold transition ${
                                    activeTab === "tours"
                                        ? "text-primary-600 border-b-2 border-primary-600"
                                        : "text-neutral-500 hover:text-neutral-700"
                                }`}
                            >
                                Tours ({tours.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("cars")}
                                className={`pb-3 px-4 font-semibold transition ${
                                    activeTab === "cars"
                                        ? "text-primary-600 border-b-2 border-primary-600"
                                        : "text-neutral-500 hover:text-neutral-700"
                                }`}
                            >
                                Cars ({cars.length})
                            </button>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                                <p className="text-neutral-500">Searching...</p>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {/* Results */}
                        {!loading && !error && (
                            <>
                                {/* All Results */}
                                {activeTab === "all" && (
                                    <div className="space-y-8">
                                        {/* Tours Section */}
                                        {tours.length > 0 && (
                                            <div>
                                                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                                    Tours ({tours.length})
                                                </h3>
                                                <div className="space-y-4">
                                                    {tours.map((tour) => (
                                                        <TourCard key={tour.TourID} tour={tour} schedule={tour.Schedules} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Cars Section */}
                                        {cars.length > 0 && (
                                            <div>
                                                <h3 className="text-xl font-bold text-neutral-900 mb-4">
                                                    Cars ({cars.length})
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {cars.map((car) => (
                                                        <CarCard key={car.CarID || car.carID} car={car} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* No Results */}
                                        {tours.length === 0 && cars.length === 0 && (
                                            <div className="text-center py-12">
                                                <p className="text-neutral-500 text-lg">No results found for "{query}"</p>
                                                <p className="text-neutral-400 text-sm mt-2">Try different keywords</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Tours Only */}
                                {activeTab === "tours" && (
                                    <div>
                                        {tours.length > 0 ? (
                                            <div className="space-y-4">
                                                {tours.map((tour) => (
                                                    <TourCard key={tour.TourID} tour={tour} schedule={tour.Schedules} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <p className="text-neutral-500 text-lg">No tours found for "{query}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Cars Only */}
                                {activeTab === "cars" && (
                                    <div>
                                        {cars.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {cars.map((car) => (
                                                    <CarCard key={car.CarID || car.carID} car={car} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <p className="text-neutral-500 text-lg">No cars found for "{query}"</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
