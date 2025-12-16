import { useState } from "react";
import { 
    ChevronDownIcon, 
    ChevronUpIcon,
    ClockIcon,
    MapPinIcon,
    TruckIcon
} from "@heroicons/react/24/solid";

export default function TourScheduleAccordion({ schedules }) {
    const [openDay, setOpenDay] = useState(null);

    const renderItems = (items = []) => {
        const sortedItems = items
            .slice()
            .sort((a, b) => (a.SortOrder || 0) - (b.SortOrder || 0));
        
        return sortedItems.map((it, index) => (
            <div key={it.ItemID} className="relative pl-8 pb-6">
                {/* Timeline line */}
                {index < sortedItems.length - 1 && (
                    <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gradient-to-b from-primary-400 to-primary-200"></div>
                )}
                
                {/* Timeline dot */}
                <div className="absolute left-0 top-1.5 w-6 h-6 bg-primary-500 rounded-full border-4 border-white shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg border border-neutral-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    {/* Time */}
                    {it.TimeInfo && (
                        <div className="flex items-center gap-2 mb-3">
                            <ClockIcon className="w-5 h-5 text-primary-600" />
                            <span className="font-bold text-lg text-primary-700">
                                {it.TimeInfo}
                            </span>
                        </div>
                    )}

                    {/* Activity */}
                    <div className="mb-3">
                        <p className="text-gray-800 leading-relaxed font-medium">
                            {it.Activity || "No description"}
                        </p>
                    </div>

                    {/* Attraction Info */}
                    {it.AttractionName && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="flex items-start gap-2">
                                <MapPinIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="font-semibold text-blue-900">
                                        {it.AttractionName}
                                    </p>
                                    {it.AttractionAddress && (
                                        <p className="text-sm text-blue-700 mt-1">
                                            {it.AttractionAddress}
                                        </p>
                                    )}
                                    {it.CityName && (
                                        <p className="text-xs text-blue-600 mt-1">
                                            📍 {it.CityName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transportation */}
                    {it.Transportation && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <TruckIcon className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">
                                Transportation: <span className="text-gray-800">{it.Transportation}</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        ));
    };

    if (!schedules?.length) {
        return (
            <section className="mt-14 max-w-full mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
                    Tour Schedule
                </h2>
                <div className="text-center py-12 bg-neutral-50 rounded-xl border border-neutral-200">
                    <p className="text-gray-500 text-lg">No schedule available yet.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="mt-14 max-w-full mx-auto px-4">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Daily Itinerary
                </h2>
                <p className="text-gray-600">
                    Detailed schedule for each day of your tour
                </p>
            </div>

            <div className="space-y-6">
                {schedules.map((day) => {
                    const isOpen = openDay === day.ScheduleID;

                    return (
                        <div
                            key={day.ScheduleID}
                            className={`rounded-xl border-2 shadow-lg transition-all duration-300 overflow-hidden ${
                                isOpen 
                                    ? "bg-gradient-to-br from-primary-50 to-blue-50 border-primary-300" 
                                    : "bg-white border-neutral-200 hover:border-primary-200"
                            }`}
                        >
                            <button
                                className="w-full flex justify-between items-center px-6 py-5 text-left hover:bg-primary-50/50 transition-colors"
                                onClick={() => setOpenDay(isOpen ? null : day.ScheduleID)}
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                            isOpen 
                                                ? "bg-primary-600 text-white" 
                                                : "bg-primary-100 text-primary-700"
                                        }`}>
                                            {day.DayNumber}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {day.Title || `Day ${day.DayNumber}`}
                                            </h3>
                                            {day.Summary && (
                                                <p className="mt-1 text-sm text-gray-600">
                                                    {day.Summary}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="ml-4">
                                    {isOpen ? (
                                        <ChevronUpIcon className="w-6 h-6 text-primary-600" />
                                    ) : (
                                        <ChevronDownIcon className="w-6 h-6 text-gray-400" />
                                    )}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="px-6 pb-6 border-t border-primary-200 bg-white">
                                    {day.Notes && (
                                        <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                                            <p className="text-sm text-amber-900 font-medium">
                                                <span className="font-bold">Important Note:</span> {day.Notes}
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="mt-6">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="w-1 h-6 bg-primary-500 rounded"></span>
                                            Activities
                                        </h4>
                                        <div className="space-y-0">
                                            {renderItems(day.Items)}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
