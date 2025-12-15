"use client";

import { useState, useEffect } from "react";
import { getAllHotels, getHotelsByCity, fetchHotels } from "../../../services/customer/hotelService";
import { getAllCities } from "../../../services/customer/cityService";

import HotelCard from "./HotelCard";
import HotelHero from "./HotelHero";

export default function HotelsListPage() {
    const [hotels, setHotels] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [searchKeyword, setSearchKeyword] = useState("");
    const [loading, setLoading] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 8;

    const loadHotels = async (page = 1, keyword = null, cityID = null) => {
        setLoading(true);
        try {
            const result = await fetchHotels({
                page: page - 1,
                size: itemsPerPage,
                keyword: keyword?.trim() || undefined,
                cityID: cityID || undefined
            });

            setHotels(result.items || []);
            setTotalItems(result.total || 0);
            setTotalPages(result.totalPages || 1);
            setCurrentPage(page);
        } catch (err) {
            console.error(err);
            setHotels([]);
            setTotalItems(0);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                const cityRes = await getAllCities();
                setCities(cityRes.content ?? cityRes);

                // Load first page of hotels
                await loadHotels(1);
            } catch (err) {
                console.error(err);
            }
        };
        init();
    }, []);

    // 🔍 Search by keyword
    const handleSearch = async (keyword) => {
        setSearchKeyword(keyword);
        setSelectedCity(null);
        setCurrentPage(1);
        await loadHotels(1, keyword, null);
    };

    const handleCityClick = async (city) => {
        setSelectedCity(city);
        setSearchKeyword("");
        setCurrentPage(1);
        await loadHotels(1, null, city.cityID);
    };

    const handleReset = async () => {
        setSelectedCity(null);
        setSearchKeyword("");
        setCurrentPage(1);
        await loadHotels(1, null, null);
    };

    // Handle page change
    const handlePageChange = (page) => {
        loadHotels(page, searchKeyword || null, selectedCity?.cityID || null);
    };

    return (
        <>
            {/* HERO */}
            <HotelHero onSearch={handleSearch} />

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* ================= ACTIVE FILTERS ================= */}
                {(selectedCity || searchKeyword) && (
                    <div className="mb-4 flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-neutral-600">Filters:</span>
                        {searchKeyword && (
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
                                "{searchKeyword}"
                            </span>
                        )}
                        {selectedCity && (
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium">
                                {selectedCity.cityName}
                            </span>
                        )}
                        <button
                            onClick={handleReset}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            X
                        </button>
                    </div>
                )}

                {/* ================= CITY FILTER - DROPDOWN + GRID ================= */}
                <div className="mb-6">

                    {/* Dropdown for quick selection */}
                    <div className="mb-3">
                        <select
                            value={selectedCity?.cityID || ""}
                            onChange={(e) => {
                                const cityId = parseInt(e.target.value);
                                if (cityId) {
                                    const city = cities.find(c => c.cityID === cityId);
                                    if (city) handleCityClick(city);
                                } else {
                                    handleReset();
                                }
                            }}
                            className="w-full sm:w-auto px-4 py-2.5 border-2 border-neutral-200 rounded-lg 
                                     focus:border-primary-500 focus:outline-none text-neutral-900 font-medium
                                     bg-white hover:border-primary-300 transition-colors cursor-pointer"
                        >
                            <option value="">All cities</option>
                            {cities.map(city => (
                                <option key={city.cityID} value={city.cityID}>
                                    {city.cityName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Grid layout for popular cities */}
                    {cities.length > 0 && (
                        <div>
                            <p className="text-sm text-neutral-600 mb-2">Popular cities:</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-32 overflow-y-auto 
                                          border border-neutral-200 rounded-lg p-3 bg-neutral-50
                                          [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-primary-300 [&::-webkit-scrollbar-thumb]:rounded-full">
                                {/* Tất cả button */}
                                <button
                                    onClick={handleReset}
                                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all
                                        ${!selectedCity && !searchKeyword
                                            ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                                            : "border-neutral-200 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-50"
                                        }`}
                                >
                                    All
                                </button>
                                {cities.slice(0, 8).map(city => (
                                    <button
                                        key={city.cityID}
                                        onClick={() => handleCityClick(city)}
                                        className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all
                                            ${selectedCity?.cityID === city.cityID
                                                ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm"
                                                : "border-neutral-200 bg-white text-neutral-700 hover:border-primary-300 hover:bg-primary-50"
                                            }`}
                                    >
                                        {city.cityName}
                                    </button>
                                ))}
                            </div>
                            {cities.length > 8 && (
                                <p className="text-xs text-neutral-500 mt-2">
                                    There are {cities.length} cities. Use the dropdown above to find all.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* ================= HOTEL LIST ================= */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-neutral-900">
                            {searchKeyword
                                ? `Search results for "${searchKeyword}"`
                                : selectedCity
                                    ? `Hotels in ${selectedCity.cityName}`
                                    : "All hotels"}
                        </h1>
                        {totalItems > 0 && (
                            <span className="text-neutral-600 text-sm">
                                {totalItems} hotels
                            </span>
                        )}
                    </div>

                    {loading && (
                        <div className="text-center py-16 text-neutral-700">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            <p className="mt-2">Loading hotels...</p>
                        </div>
                    )}

                    {!loading && hotels.length === 0 && (
                        <div className="text-center text-neutral-700 py-16 bg-neutral-50 rounded-xl border border-neutral-200">
                            <p className="text-lg">No hotels found.</p>
                        </div>
                    )}

                    {!loading && hotels.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {hotels.map(h => (
                                    <HotelCard key={h.hotelID} hotel={h} />
                                ))}
                            </div>

                            {/* PAGINATION */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <p className="text-sm text-neutral-600">
                                        Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} hotels
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
                                                ${currentPage === 1
                                                    ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                                                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
                                                }`}
                                        >
                                            Previous
                                        </button>

                                        {/* Page numbers */}
                                        {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 10) {
                                                pageNum = i + 1;
                                            } else if (currentPage <= 5) {
                                                pageNum = i + 1;
                                            } else if (currentPage >= totalPages - 4) {
                                                pageNum = totalPages - 9 + i;
                                            } else {
                                                pageNum = currentPage - 5 + i;
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-all
                                                        ${currentPage === pageNum
                                                            ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                                                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
                                                ${currentPage === totalPages
                                                    ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                                                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
                                                }`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
