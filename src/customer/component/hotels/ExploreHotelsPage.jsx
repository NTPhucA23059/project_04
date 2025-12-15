"use client";

import { useParams } from "react-router-dom";
import { hotels, mockHotelTypes } from "../data/mockData";
import { FaStar } from "react-icons/fa";

// ⭐ IMPORT HOTEL HERO
import HotelHero from "./HotelHero";

export default function ExploreHotelsPage() {
    const { filterType, filterValue } = useParams();

    let title = "Hotel List";
    let filtered = hotels;

    // ============================
    // 🔎 LỌC THEO LOẠI CHỖ NGHỈ
    // ============================
    if (filterType === "type") {
        const typeId = Number(filterValue);
        const typeInfo = mockHotelTypes.find(t => t.HotelTypeID === typeId);

        title = `Accommodation Type: ${typeInfo?.TypeName || ""}`;
        filtered = hotels.filter(h => h.HotelTypeID === typeId);
    }

    // ============================
    // 📍 LỌC THEO THÀNH PHỐ
    // ============================
    if (filterType === "city") {
        const city = decodeURIComponent(filterValue);
        title = `Area: ${city}`;
        filtered = hotels.filter(h => h.City === city);
    }

    return (
        <div className="w-full">

            {/* ⭐ HIỂN THỊ HOTEL HERO UI TRÊN CÙNG ⭐ */}
            <HotelHero />

            <div className="max-w-7xl mx-auto px-6 py-10">

                {/* PAGE TITLE */}
                <h1 className="text-3xl font-bold mb-8">{title}</h1>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* ========================
                        SIDEBAR FILTER
                    ========================= */}
                    <div className="border rounded-xl p-4 h-fit bg-white shadow">
                        <h3 className="font-bold text-lg mb-3">Filter by</h3>

                        <p className="font-medium mt-4 mb-2">Star Rating</p>
                        {[5, 4, 3, 2, 1].map(star => (
                            <label key={star} className="flex gap-2 items-center mb-1">
                                <input type="checkbox" />
                                <span>{star} stars</span>
                            </label>
                        ))}
                    </div>

                    {/* ========================
                        HOTEL LIST
                    ========================= */}
                    <div className="col-span-3 space-y-6">
                        {filtered.map(h => (
                            <div
                                key={h.HotelID}
                                className="border rounded-xl shadow bg-white p-5 flex gap-5 hover:shadow-lg transition cursor-pointer"
                            >
                                <img
                                    src={h.MainImage}
                                    alt={h.Name}
                                    className="w-48 h-32 object-cover rounded-lg"
                                />

                                <div className="flex-1">
                                    <h2 className="text-lg font-bold">{h.Name}</h2>

                                    <div className="flex items-center gap-1 text-yellow-500 my-1">
                                        {Array(h.Rating).fill(0).map((_, i) => <FaStar key={i} />)}
                                    </div>

                                    <p className="text-sm text-gray-600">{h.City}</p>

                                    <p className="text-primary-600 font-bold mt-2">
                                        ${h.PricePerNight.toLocaleString()} / night
                                    </p>
                                </div>

                                <button className="bg-blue-600 text-white px-4 py-2 rounded-md h-fit">
                                    View Rooms
                                </button>
                            </div>
                        ))}

                        {filtered.length === 0 && (
                            <p className="text-neutral-500 text-center">
                                No matching hotels found.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
