"use client";

import { useNavigate } from "react-router-dom";

export default function CityList({ cities }) {
    const navigate = useNavigate();

    return (
        <div className="flex gap-6 justify-center my-10 flex-wrap">
            {cities.map(city => (
                <button
                    key={city.cityID}
                    onClick={() => navigate(`/hotels?city=${city.cityID}`)}
                    className="px-6 py-3 rounded-xl border font-semibold transition
                               bg-white hover:bg-orange-50"
                >
                    {city.cityName}
                </button>
            ))}
        </div>
    );
}
