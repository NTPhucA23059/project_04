"use client";

import { useEffect, useMemo, useState } from "react";
import TourCard from "../../component/tour/TourCard";
import SearchBox from "../../component/tour/SearchBox";
import TourFilters from "../../component/tour/TourFilters";
import { fetchTours } from "../../../services/customer/tourService";

import api from "../../../services/api";
export default function Tours() {
    const ITEMS_PER_PAGE = 6;

    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({});
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

const toAbsoluteUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  const base = (api.defaults.baseURL || "").replace(/\/$/, "");
  return `${base}/${url.replace(/^\/+/, "")}`;
};

    // Map backend tour response to UI shape
    const mapTour = (t) => {
        // Get first detail for price preview
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

        // Get minimum price from all details
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
            PriceFrom: minPrice, // For compatibility
            Schedules: schedules,
            TourCities: (t.tourCities || []).map(tc => ({
                CityID: tc.cityID,
                CityName: tc.cityName,
                CityOrder: tc.cityOrder,
                StayDays: tc.stayDays,
            })),
        };
    };

    const [totalTours, setTotalTours] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchTours({
                    page: page - 1, // Backend uses 0-based index
                    size: ITEMS_PER_PAGE,
                    keyword: filters.destination || undefined,
                    categoryId: filters.category || undefined,
                });
                
                // Handle paginated response
                if (res.items) {
                    const items = res.items || [];
                    setTours(items.map(mapTour));
                    setTotalTours(res.total || items.length);
                    setTotalPages(res.totalPages || 1);
                } else {
                    // Fallback for non-paginated response
                    const items = Array.isArray(res) ? res : [];
                    setTours(items.map(mapTour));
                    setTotalTours(items.length);
                    setTotalPages(Math.ceil(items.length / ITEMS_PER_PAGE) || 1);
                }
            } catch (e) {
                console.error("Error loading tours:", e);
                setError("Failed to load tours. Please try again.");
                setTours([]);
                setTotalTours(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [page, filters.destination, filters.category]);

    // ---------------------------------------
    // FILTER LOGIC (client side for startDate/duration/season/budget/rating)
    // Note: Server-side pagination is used for destination and category
    // Client-side filters are applied after receiving data
    // ---------------------------------------
    const filteredTours = useMemo(() => {
        return tours.filter((tour) => {
            // DURATION - parse from "X days Y nights" format
            if (filters.duration && filters.duration !== "Any") {
                const durationStr = tour.Duration || "";
                const daysMatch = durationStr.match(/(\d+)\s*days?/i);
                const days = daysMatch ? parseInt(daysMatch[1]) : 0;
                
                if (filters.duration === "1–3 days" && (days < 1 || days > 3)) return false;
                if (filters.duration === "4–7 days" && (days < 4 || days > 7)) return false;
                if (filters.duration === "8–14 days" && (days < 8 || days > 14)) return false;
                if (filters.duration === "15+ days" && days < 15) return false;
            }

            // BUDGET
            if (filters.budget) {
                const price = tour.Price || tour.PriceFrom || 0;
                if (price < filters.budget.min || price > filters.budget.max) {
                    return false;
                }
            }

            // RATING - skip for now as reviews are not loaded in list
            // if (filters.rating) { ... }

            return true;
        });
    }, [tours, filters]);

    // Current tours to display (already paginated from server, but may be filtered)
    const currentTours = filteredTours;

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages) {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
    }, [filters.destination, filters.category]);

    return (
        <div className="flex flex-col min-h-screen bg-neutral-50">

            {/* Search Bar */}
            <div className="max-w-7xl mx-auto w-full px-4">
                <SearchBox
                    onSearch={(data) => {
                        setFilters(prev => ({ ...prev, ...data }));
                        setPage(1);
                    }}
                />
            </div>

            <div className="flex max-w-7xl mx-auto w-full px-4 mt-6">

                {/* Sidebar Filters */}
                <TourFilters
                    onChange={(data) => {
                        setFilters(prev => ({ ...prev, ...data }));
                        setPage(1);
                    }}
                />

                {/* Tour List */}
                <div className="flex-1 ml-6 space-y-5 pb-10">

                    {loading && (
                        <div className="text-center text-neutral-500 py-10">
                            Đang tải tour...
                        </div>
                    )}

                    {error && !loading && (
                        <div className="text-center text-red-600 py-10">
                            {error}
                        </div>
                    )}

                    {!loading && !error && currentTours.map(tour => (
                        <TourCard
                            key={tour.TourID}
                            tour={tour}
                            schedule={tour.Schedules || []}
                        />
                    ))}

                    {!loading && !error && currentTours.length === 0 && (
                        <div className="text-center text-neutral-500 py-10">
                            <p className="text-lg mb-2">No tours found</p>
                            <p className="text-sm">Try adjusting your filters</p>
                        </div>
                    )}

                    {/* Results count */}
                    {!loading && !error && currentTours.length > 0 && (
                        <div className="text-sm text-gray-600 mb-4">
                            Showing {currentTours.length} of {totalTours} tours
                        </div>
                    )}

                    {/* PAGINATION */}
                    {!loading && !error && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                disabled={page === 1}
                                onClick={() => goToPage(page - 1)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition
                                    ${page === 1 
                                        ? "opacity-40 cursor-not-allowed bg-gray-100" 
                                        : "hover:bg-gray-100 border-gray-300"
                                    }`}
                            >
                                Previous
                            </button>

                            {/* Page numbers - show max 7 pages */}
                            {(() => {
                                const maxVisible = 7;
                                let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                                let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                                if (endPage - startPage < maxVisible - 1) {
                                    startPage = Math.max(1, endPage - maxVisible + 1);
                                }

                                const pages = [];
                                if (startPage > 1) {
                                    pages.push(
                                        <button
                                            key={1}
                                            onClick={() => goToPage(1)}
                                            className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-100"
                                        >
                                            1
                                        </button>
                                    );
                                    if (startPage > 2) {
                                        pages.push(<span key="ellipsis1" className="px-2">...</span>);
                                    }
                                }

                                for (let num = startPage; num <= endPage; num++) {
                                    pages.push(
                                        <button
                                            key={num}
                                            onClick={() => goToPage(num)}
                                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition
                                                ${page === num
                                                    ? "bg-gray-800 text-white border-gray-800"
                                                    : "hover:bg-gray-100 border-gray-300"
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    );
                                }

                                if (endPage < totalPages) {
                                    if (endPage < totalPages - 1) {
                                        pages.push(<span key="ellipsis2" className="px-2">...</span>);
                                    }
                                    pages.push(
                                        <button
                                            key={totalPages}
                                            onClick={() => goToPage(totalPages)}
                                            className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-100"
                                        >
                                            {totalPages}
                                        </button>
                                    );
                                }

                                return pages;
                            })()}

                            <button
                                disabled={page === totalPages}
                                onClick={() => goToPage(page + 1)}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium transition
                                    ${page === totalPages 
                                        ? "opacity-40 cursor-not-allowed bg-gray-100" 
                                        : "hover:bg-gray-100 border-gray-300"
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    )}

                </div>

            </div>

        </div>
    );
}
