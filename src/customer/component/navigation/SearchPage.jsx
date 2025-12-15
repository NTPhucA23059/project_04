import { useEffect, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useSearchParams } from "react-router-dom";

export default function SearchPage() {
    const [params] = useSearchParams();
    const q = params.get("q") || "";
    const [query, setQuery] = useState(q);
    const inputRef = useRef(null);

    const popularSearches = [
        "T-shirt",
        "Streetwear",
        "Oversize Hoodie",
        "Black Joggers",
        "Minimalist Shirt",
    ];

    const suggestions = [
        "White Tee",
        "Black Tee",
        "Basic Hoodie",
        "Zipper Jacket",
        "Sweatpants",
        "Unisex Polo",
    ];

    const [recent, setRecent] = useState(() => {
        return JSON.parse(localStorage.getItem("recentSearches")) || [];
    });

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
    }, []);

    const handleSearch = (term) => {
        if (!term.trim()) return;
        const updated = [term, ...recent.filter((x) => x !== term)].slice(0, 6);
        setRecent(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));

        window.location.href = `/search?q=${encodeURIComponent(term)}`;
    };

    return (
        <div className="min-h-screen bg-white flex flex-col px-6 py-16 relative">

            {/* ⬅ BUTTON RETURN HOME */}
            <button
                onClick={() => (window.location.href = "/")}
                className="w-10 h-10 flex items-center justify-center bg-black 
               rounded-full text-white absolute top-6 right-6
               hover:bg-neutral-800 transition"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>


            <div className="w-full max-w-2xl mx-auto mt-16">
                {/* Search */}
                <div className="flex items-center border-b border-gray-300 pb-3 mt-10">
                    <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search here..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                        className="ml-3 flex-1 bg-transparent text-3xl placeholder-gray-400 
                                   text-gray-700 focus:outline-none"
                    />
                </div>

                {/* SUGGESTIONS */}
                {query && (
                    <div className="mt-8">
                        <p className="text-sm text-neutral-500 mb-3">Suggestions</p>
                        <div className="flex flex-col gap-3">
                            {suggestions
                                .filter((item) =>
                                    item.toLowerCase().includes(query.toLowerCase())
                                )
                                .map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => handleSearch(item)}
                                        className="text-lg text-gray-700 hover:text-black flex items-center justify-between group"
                                    >
                                        {item}
                                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 group-hover:text-black" />
                                    </button>
                                ))}
                        </div>
                    </div>
                )}

                {/* Recent */}
                {!query && recent.length > 0 && (
                    <div className="mt-10">
                        <p className="text-sm text-neutral-500 mb-3">Recent Searches</p>
                        <div className="flex flex-wrap gap-2">
                            {recent.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => handleSearch(item)}
                                    className="px-4 py-1.5 border rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Popular */}
                {!query && (
                    <div className="mt-10">
                        <p className="text-sm text-neutral-500 mb-3">Popular Now</p>
                        <div className="flex flex-wrap gap-2">
                            {popularSearches.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => handleSearch(item)}
                                    className="px-4 py-1.5 border rounded-full text-gray-700 bg-white hover:bg-black hover:text-white transition"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
