"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import {
    mockHotelTypes,
    vietnamCitiesShowcase
} from "../data/mockData"; // ⚡ Import đúng mock data

export default function HotelShowcase() {

    const navigate = useNavigate();

    return (
        <div className="max-w-7xl mx-auto px-6 py-10">

            {/* ==========================
                TÌM THEO LOẠI CHỖ NGHỈ
            =========================== */}
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
                Find by accommodation type
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                {mockHotelTypes.map(t => (
                    <div
                        key={t.HotelTypeID}
                        className="cursor-pointer group"
                        onClick={() => navigate(`/explore/type/${t.HotelTypeID}`)}
                    >
                        <div className="relative overflow-hidden rounded-xl shadow-md group-hover:shadow-xl transition-all duration-300">
                            <img
                                src={t.image}
                                alt={t.TypeName}
                                className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <p className="text-center font-semibold mt-2 text-neutral-900 group-hover:text-primary-600 transition-colors">
                            {t.TypeName}
                        </p>
                    </div>
                ))}
            </div>

            {/* ==========================
                KHÁM PHÁ VIỆT NAM
            =========================== */}
            <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mt-12">
                Explore Vietnam
            </h2>

            <p className="text-neutral-700 mt-1">
                These popular destinations have many things waiting for you.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                {vietnamCitiesShowcase.map(c => (
                    <div
                        key={c.city}
                        className="cursor-pointer group"
                        onClick={() => navigate(`/explore/city/${encodeURIComponent(c.city)}`)}
                    >
                        <div className="relative overflow-hidden rounded-lg shadow-md group-hover:shadow-xl transition-all duration-300">
                            <img
                                src={c.image}
                                alt={c.city}
                                className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-600/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>

                        <p className="font-semibold mt-2 text-neutral-900 group-hover:text-primary-600 transition-colors">
                            {c.city}
                        </p>

                        <p className="text-neutral-700 text-sm">
                            {c.stays.toLocaleString()} accommodations
                        </p>
                    </div>
                ))}
            </div>

        </div>
    );
}
