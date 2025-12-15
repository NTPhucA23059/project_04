import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/solid";

export default function TourScheduleAccordion({ schedules }) {
    const [openDay, setOpenDay] = useState(null);

    const renderItems = (items = []) =>
        items
            .slice()
            .sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0))
            .map((it) => (
                <li
                    key={it.ItemID}
                    className="text-sm text-gray-700 border-b pb-4"
                >
                    <div className="flex justify-between">
                        <span className="font-semibold text-blue-700">
                            {it.TimeInfo || "N/A"}
                        </span>
                        <span className="text-xs text-gray-500">
                            Activity #{it.SortOrder ?? "-"}
                        </span>
                    </div>

                    <p className="mt-1 leading-relaxed">
                        {it.Activity || "No description"}
                    </p>

                    {it.PlaceName && (
                        <p className="text-gray-600 mt-1">
                            📍 <span className="font-medium">{it.PlaceName}</span>
                        </p>
                    )}

                    {it.Transportation && (
                        <p className="mt-1 text-xs text-gray-500">
                            🚗 Transport:{" "}
                            <span className="font-medium text-gray-700">
                                {it.Transportation}
                            </span>
                        </p>
                    )}

                    {it.Cost > 0 && (
                        <p className="text-xs text-green-700 mt-1">
                            💲 Extra Cost:{" "}
                            <span className="font-semibold">
                                {Number(it.Cost).toLocaleString()} VND
                            </span>
                        </p>
                    )}
                </li>
            ));

    if (!schedules?.length) {
        return (
            <section className="mt-14">
                <h2 className="text-3xl font-bold text-center mb-8">
                    Tour Schedule
                </h2>
                <p className="text-center text-gray-500">Chưa có lịch trình.</p>
            </section>
        );
    }

    return (
        <section className="mt-14">
            <h2 className="text-3xl font-bold text-center mb-8">
                Tour Schedule
            </h2>

            <div className="space-y-4">
                {schedules.map((day) => {
                    const isOpen = openDay === day.ScheduleID;

                    return (
                        <div
                            key={day.ScheduleID}
                            className={`rounded-xl border shadow-sm transition 
                                overflow-hidden ${isOpen ? "bg-blue-50" : "bg-white"}`}
                        >
                            <button
                                className="w-full flex justify-between items-center px-6 py-4 text-left"
                                onClick={() => setOpenDay(isOpen ? null : day.ScheduleID)}
                            >
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Day {day.DayNumber}: {day.Title}
                                    </h3>

                                    <p className="mt-1 text-sm text-gray-600 flex items-center gap-2">
                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/1046/1046784.png"
                                            className="w-5 opacity-70"
                                        />
                                        {day.MealInfo || "No meal info"}
                                    </p>
                                </div>

                                {isOpen ? (
                                    <ChevronUpIcon className="w-6 h-6 text-gray-600" />
                                ) : (
                                    <ChevronDownIcon className="w-6 h-6 text-gray-600" />
                                )}
                            </button>

                            {isOpen && (
                                <div className="px-6 pb-4 border-t bg-white">
                                    <ul className="space-y-5 mt-4">
                                        {renderItems(day.Items)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
