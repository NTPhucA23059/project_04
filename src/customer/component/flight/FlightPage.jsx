
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FlightHero from "./FlightHero";
import FlightCard from "./FlightCard";
import { fetchFlights } from "../../../services/customer/flightService";
import { getAllCities } from "../../../services/customer/cityService";

export default function FlightsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [cities, setCities] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(9);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const fromCityID = searchParams.get("fromCityID") || "";
  const toCityID = searchParams.get("toCityID") || "";
  const keyword = searchParams.get("keyword") || "";

  useEffect(() => {
    // load city list once
    getAllCities()
      .then((list) => setCities(list))
      .catch(() => setCities([]));
  }, []);

  useEffect(() => {
    // whenever filters or page change, fetch page
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchFlights({
          page,
          size,
          keyword: keyword || undefined,
          fromCityID: fromCityID ? Number(fromCityID) : undefined,
          toCityID: toCityID ? Number(toCityID) : undefined,
        });
        const items = res.items || [];

        // join city names
        const cityMap = new Map(
          cities.map((c) => [c.cityID, c.cityName])
        );

        const mapped = items.map((f) => ({
          ...f,
          fromCityName: cityMap.get(f.fromCityID) || "—",
          toCityName: cityMap.get(f.toCityID) || "—",
        }));

        setFlights(mapped);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 0);
      } catch (err) {
        console.error("Load flights error:", err);
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, size, fromCityID, toCityID, keyword, cities]);

  // update URL when page change
  const handlePageChange = (nextPage) => {
    setPage(nextPage);
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
  };

  useEffect(() => {
    const urlPage = parseInt(searchParams.get("page") || "0", 10);
    if (!Number.isNaN(urlPage)) {
      setPage(urlPage);
    }
  }, [searchParams]);

  const fromCityLabel = useMemo(() => {
    const id = Number(fromCityID);
    const found = cities.find((c) => c.cityID === id);
    return found?.cityName;
  }, [fromCityID, cities]);

  const toCityLabel = useMemo(() => {
    const id = Number(toCityID);
    const found = cities.find((c) => c.cityID === id);
    return found?.cityName;
  }, [toCityID, cities]);

  const handleFilterChange = (field, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(field, value);
    } else {
      params.delete(field);
    }
    params.delete("page");
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("fromCityID");
    params.delete("toCityID");
    params.delete("page");
    setSearchParams(params);
  };

  return (
    <div className="pt-24">
      <FlightHero />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Flight results
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              {fromCityLabel || toCityLabel
                ? `From ${fromCityLabel || "all cities"} to ${
                    toCityLabel || "all cities"
                  }`
                : "Filter by departure and arrival cities to find matching flights."}
            </p>
          </div>

          <p className="text-xs text-neutral-500">
            Showing page {page + 1} of {Math.max(totalPages, 1)} — Total{" "}
            {total} flights
          </p>
        </div>

        {/* City filters */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
          <div className="flex-1 flex flex-wrap gap-3">
            <div>
              <p className="text-xs text-neutral-500 mb-1">From city</p>
              <select
                value={fromCityID}
                onChange={(e) =>
                  handleFilterChange("fromCityID", e.target.value)
                }
                className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm bg-white"
              >
                <option value="">All</option>
                {cities.map((c) => (
                  <option key={c.cityID} value={c.cityID}>
                    {c.cityName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs text-neutral-500 mb-1">To city</p>
              <select
                value={toCityID}
                onChange={(e) =>
                  handleFilterChange("toCityID", e.target.value)
                }
                className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm bg-white"
              >
                <option value="">All</option>
                {cities.map((c) => (
                  <option key={c.cityID} value={c.cityID}>
                    {c.cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearFilters}
            className="self-start text-xs px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 hover:bg-neutral-100"
          >
            Clear filters
          </button>
        </div>

        {loading && (
          <p className="mt-6 text-neutral-500">Loading flights...</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {flights.map((item) => (
            <FlightCard key={item.flightID} item={item} />
          ))}
        </div>

        {!loading && flights.length === 0 && (
          <p className="mt-6 text-neutral-500">
            No flights found. Try adjusting your filters or search keyword.
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => page > 0 && handlePageChange(page - 1)}
              disabled={page <= 0}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50 bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300 disabled:hover:bg-white"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-600">
              Page {page + 1} / {totalPages}
            </span>
            <button
              onClick={() =>
                page + 1 < totalPages && handlePageChange(page + 1)
              }
              disabled={page + 1 >= totalPages}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-50 bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300 disabled:hover:bg-white"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
