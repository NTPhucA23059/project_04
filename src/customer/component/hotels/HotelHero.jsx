"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function HotelHero({ onSearch }) {
    const [searchKeyword, setSearchKeyword] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchKeyword);
        }
    };

    return (
        <div className="w-full h-[350px] relative flex items-center justify-center overflow-hidden">
            {/* Beautiful gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400"></div>
            
            {/* Pattern overlay for texture */}
            <div 
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            ></div>
            
            {/* Additional depth with darker bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/40 via-transparent to-transparent"></div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl px-6 text-white">
                <h1 className="text-4xl font-extrabold drop-shadow-lg text-center">
                    Experience an Amazing Vacation
                </h1>
                <p className="mt-2 opacity-95 text-lg drop-shadow text-center">
                    Find the perfect hotel for you
                </p>

                {/* SIMPLE SEARCH BOX */}
                <form onSubmit={handleSearch} className="mt-8">
                    <div className="flex gap-3 bg-white rounded-xl shadow-2xl p-2 border border-neutral-200">
                        <div className="flex-1 flex items-center px-4">
                            <MagnifyingGlassIcon className="w-6 h-6 text-neutral-500 mr-3" />
                            <input
                                type="text"
                                placeholder="Enter hotel name, address or city..."
                                className="w-full outline-none text-neutral-900 placeholder:text-neutral-500 text-lg py-2"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-primary-600 hover:bg-primary-700 
                                      text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl 
                                      transition-all duration-300 transform hover:scale-105"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
