"use client";

import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

// Convert relative URL to absolute URL
const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}/${url.replace(/^\/+/, "")}`;
};

export default function CarCard({ car }) {
    const navigate = useNavigate();
    const carId = car.CarID ?? car.carID;
    const dailyRate = Number(car.DailyRate ?? car.dailyRate ?? 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-xl transition">
            {/* IMAGE */}
            <div className="w-full h-56 overflow-hidden">
                <img
                    src={toAbsoluteUrl(car.imageUrl || car.image || car.ImageUrl || car.MainImage) || "https://placehold.co/600x400"}
                    alt={car.ModelName || car.modelName}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* CONTENT */}
            <div className="p-5">
                <h3 className="text-lg font-semibold">{car.ModelName || car.modelName}</h3>
                <p className="text-neutral-500 text-sm">{car.Brand || car.brand}</p>

                <div className="mt-3 text-primary-600 font-bold text-xl">
                    {dailyRate.toLocaleString("en-US", { style: "currency", currency: "USD" })} / day
                </div>

                <div className="text-sm mt-2">
                    Seats: <strong>{car.SeatingCapacity ?? car.seatingCapacity}</strong>
                </div>

                <button
                    onClick={() => navigate(`/car/${carId}`)}
                    className="mt-4 bg-primary-600 hover:bg-primary-700 text-white py-2 w-full rounded-lg"
                >
                    View Details
                </button>
            </div>
        </div>
    );
}
