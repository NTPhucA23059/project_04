
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function FlightHero() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(
    searchParams.get("keyword") || ""
  );

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    const trimmed = keyword.trim();
    if (trimmed) {
      params.set("keyword", trimmed);
    } else {
      params.delete("keyword");
    }
    params.delete("page");
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <div
      className="w-full h-[380px] bg-gradient-to-r from-primary-600 to-accent-500 relative flex items-center justify-center"
    >
      <div className="relative z-10 w-full max-w-5xl px-6">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg">
          Find the best flights from any city
        </h1>
        <p className="mt-2 text-orange-100">
          Search by airline, flight code or route. City filters are applied on
          the results below.
        </p>

        <div className="bg-white/95 mt-6 rounded-2xl shadow-2xl p-4 backdrop-blur">
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            <div className="flex-1">
              <p className="text-xs text-neutral-500 uppercase font-semibold mb-1">
                Search flights
              </p>
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter airline, flight code or city..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary-300"
              />
            </div>
            <button
              onClick={handleSearch}
              className="mt-2 md:mt-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition self-start"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
