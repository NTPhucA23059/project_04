import { useState } from "react";
import { FaGlobeAsia, FaCar } from "react-icons/fa";
import TourListPageVN from "../tourPage/TourListPage.jsx";
import CarListPage from "../carRentalPage/CarListPage.jsx";

export default function HeroTabs() {
    const [activeTab, setActiveTab] = useState("tour");

    return (
        <div className="w-full bg-white mt-6">

            {/* ------------------ TAB HEADER ------------------ */}
            <div className="flex justify-center gap-10 border-b pb-3">

                {/* TOUR TAB */}
                <button
                    onClick={() => setActiveTab("tour")}
                    className={`flex items-center gap-2 text-lg font-semibold pb-2 
                        ${activeTab === "tour"
                            ? "text-primary-600 border-b-2 border-primary-600"
                            : "text-gray-500 hover:text-primary-400"
                        }`}
                >
                    <FaGlobeAsia className="text-xl" />
                    Tours
                </button>

                {/* CAR TAB */}
                <button
                    onClick={() => setActiveTab("car")}
                    className={`flex items-center gap-2 text-lg font-semibold pb-2 
                        ${activeTab === "car"
                            ? "text-primary-600 border-b-2 border-primary-600"
                            : "text-gray-500 hover:text-primary-400"
                        }`}
                >
                    <FaCar className="text-xl" />
                    Car Rental
                </button>

            </div>

            {/* ------------------ TAB CONTENT ------------------ */}
            <div className="mt-6">

                {/* ------------------ TOUR CONTENT ------------------ */}
                {activeTab === "tour" && (
                    <div className="rounded-xl relative">
                        <TourListPageVN />
                        <hr
                            className="my-14 h-[3px] w-[1200px] mx-auto bg-gradient-to-r from-primary-500 to-accent-400 border-0 rounded-full mt-[-30px]"
                        />

                    </div>
                )}


                {/* ------------------ CAR CONTENT ------------------ */}
                {activeTab === "car" && (
                    <div className="h-auto rounded-xl overflow-hidden relative flex items-center">
                        <CarListPage />
                    </div>
                )}

            </div>
        </div>
    );
}
