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
        const schedules = (t.detail?.schedules || []).map((s) => ({
            ScheduleID: s.scheduleID,
            DayNumber: s.dayNumber,
            Title: s.title,
            MealInfo: s.mealInfo,
            Summary: s.summary,
            Items: (s.items || []).map((it) => ({
                ItemID: it.itemID,
                TimeInfo: it.timeInfo,
                Activity: it.activity,
                PlaceName: it.placeName,
                Transportation: it.transportation,
                Cost: it.cost,
                SortOrder: it.sortOrder,
            })),
        }));

        return {
            TourID: t.tourID,
            TourCode: t.tourCode,
            TourName: t.tourName,
            TourImg: toAbsoluteUrl(t.tourImg),
            TourDescription: t.tourDescription,
            Nation: t.nation,
            StartingLocation: t.startingLocation,
            Duration: t.duration,
            CategoryID: t.categoryID,
            Price: t.detail?.unitPrice ? Number(t.detail.unitPrice) : undefined,
            Schedules: schedules,
        };
    };

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchTours({
                    page: 0,
                    size: 200, 
                    keyword: filters.destination || undefined,
                    categoryId: filters.category || undefined,
                });
                const items = res.items || res; 
                setTours((items || []).map(mapTour));
                setPage(1);
            } catch (e) {
                setError("Không tải được danh sách tour",e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [filters.destination, filters.category]);

    // ---------------------------------------
    // FILTER LOGIC (client side for startDate/duration/season/budget/rating)
    // ---------------------------------------
    const filteredTours = useMemo(() => {
        return tours.filter((tour) => {
            // START DATE: check tour detail departure?
            if (filters.startDate) {
                const hasStart = (tour.Schedules || []).some(
                    (s) => filters.startDate && filters.startDate <= new Date()
                );
                // schedules không có ngày cụ thể -> bỏ qua filter này
                if ((tour.Schedules || []).length && !hasStart) return false;
            }

            // DURATION
            if (filters.duration && filters.duration !== "Any") {
                const d = parseInt(tour.Duration);
                if (filters.duration === "1–3 days" && (d < 1 || d > 3)) return false;
                if (filters.duration === "4–7 days" && (d < 4 || d > 7)) return false;
                if (filters.duration === "8–14 days" && (d < 8 || d > 14)) return false;
                if (filters.duration === "15+ days" && d < 15) return false;
            }

            // SEASON (backend chưa trả season, bỏ qua nếu không có)
            if (filters.season) {
                const hasSeason = (tour.Schedules || []).some(
                    (s) => s.SeasonID === filters.season
                );
                if ((tour.Schedules || []).length && !hasSeason) return false;
            }

            // BUDGET
            if (filters.budget) {
                const price = tour.Price || tour.PriceFrom || 0;
                if (price < filters.budget.min || price > filters.budget.max) {
                    return false;
                }
            }

            return true;
        });
    }, [tours, filters]);

    // ---------------------------------------
    // PAGINATION (client)
    // ---------------------------------------
    const totalPages = Math.ceil(filteredTours.length / ITEMS_PER_PAGE) || 1;
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const currentTours = filteredTours.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const goToPage = (p) => {
        if (p >= 1 && p <= totalPages) {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

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
                            No tours match your filter.
                        </div>
                    )}

                    {/* PAGINATION */}
                    {!loading && !error && totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-6">
                            <button
                                disabled={page === 1}
                                onClick={() => goToPage(page - 1)}
                                className={`px-3 py-1 rounded-lg border text-sm 
                                    ${page === 1 ? "opacity-40" : "hover:bg-primary-100"}`}
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .map(num => (
                                    <button
                                        key={num}
                                        onClick={() => goToPage(num)}
                                        className={`px-3 py-1 rounded-lg border text-sm
                                            ${page === num
                                                ? "bg-primary-500 text-white"
                                                : "hover:bg-primary-100"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}

                            <button
                                disabled={page === totalPages}
                                onClick={() => goToPage(page + 1)}
                                className={`px-3 py-1 rounded-lg border text-sm
                                    ${page === totalPages ? "opacity-40" : "hover:bg-primary-100"}`}
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
