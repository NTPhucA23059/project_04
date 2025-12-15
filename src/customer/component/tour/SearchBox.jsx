"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import "react-datepicker/dist/react-datepicker.css";

export default function SearchBox({ onSearch }) {
    const [destination, setDestination] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [duration, setDuration] = useState("Any");

    const handleSearch = (e) => {
        e.preventDefault();
        onSearch({
            destination,
            startDate,
            duration
        });
    };

    return (
        <div className="w-full bg-white rounded-xl border border-neutral-200 p-5 mt-[100px] max-w-5xl mx-auto shadow-sm">
            <form className="grid grid-cols-1 md:grid-cols-5 gap-4" onSubmit={handleSearch}>

                {/* Destination */}
                <div className="flex flex-col">
                    <label className="text-sm text-neutral-600 mb-1">Destination</label>
                    <input
                        type="text"
                        placeholder="Where to go?"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 
                        focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition"
                    />
                </div>

                {/* Start Date */}
                <div className="flex flex-col">
                    <label className="text-sm text-neutral-600 mb-1">Start Date</label>
                    <div className="relative">
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="yyyy-mm-dd"
                            minDate={new Date()}
                            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 
                            focus:border-primary-500 focus:ring-2 focus:ring-primary-200 pr-10"
                        />
                        <CalendarDaysIcon className="w-5 h-5 text-neutral-400 absolute right-3 top-2.5" />
                    </div>
                </div>

                {/* Duration */}
                <div className="flex flex-col">
                    <label className="text-sm text-neutral-600 mb-1">Duration</label>
                    <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:border-primary-500"
                    >
                        <option>Any</option>
                        <option>1–3 days</option>
                        <option>4–7 days</option>
                        <option>8–14 days</option>
                        <option>15+ days</option>
                    </select>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                    <button
                        className="w-full py-3 rounded-lg bg-primary-500 hover:bg-primary-600 
                        text-white font-semibold transition"
                    >
                        Search
                    </button>
                </div>
            </form>
        </div>
    );
}
