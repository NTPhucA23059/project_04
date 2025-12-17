import { useEffect, useState, useMemo } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

import { fetchCars } from "../../../services/customer/carService";
import api from "../../../services/api";
import CarCard from "./CarCard";

const ITEMS_PER_PAGE = 6;

export default function CarListPage() {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(null);
  const [sort, setSort] = useState("default");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1); // UI is 1-based

  const [cars, setCars] = useState([]);
  const [allCars, setAllCars] = useState([]); // Store all cars for client-side filtering
  const [carTypes, setCarTypes] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Extract brands and seats from all available cars
  const { brands, seats } = useMemo(() => {
    const allBrands = [...new Set(allCars.map(c => c.Brand || c.brand).filter(Boolean))].sort();
    const allSeats = [...new Set(allCars.map(c => c.SeatingCapacity ?? c.seatingCapacity).filter(Boolean))].sort((a, b) => a - b);
    return { brands: allBrands, seats: allSeats };
  }, [allCars]);

  // Debounce search keyword
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKeyword.trim());
      setPage(1); // Reset to first page when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // ===== fetch cars =====
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {
          page: page - 1,
          size: ITEMS_PER_PAGE,
        };

        // Use debounced search for keyword
        if (debouncedSearch) params.keyword = debouncedSearch;
        // Use selectedType for carTypeID (server-side filter)
        if (selectedType) params.carTypeID = selectedType;
        // Note: We don't send brand to server, we filter client-side for flexibility

        const res = await fetchCars(params);

        // Fetch more cars for client-side filtering of brands/seats
        // Only fetch all cars on first page and when no search is active
        if (page === 1 && !debouncedSearch) {
          try {
            const allRes = await fetchCars({ page: 0, size: 200, carTypeID: selectedType || undefined });
            setAllCars(allRes.items || []);
          } catch (err) {
            // Ignore error
          }
        } else if (debouncedSearch) {
          // When searching, update allCars from search results
          setAllCars(res.items || []);
        }

        setCars(res.items || []);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        setError(err?.message || "Unable to load car list");
        console.error("Error loading cars:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, selectedType, debouncedSearch]);

  // ===== client-side filter =====
  const filteredCars = useMemo(() => {
    return cars.filter(c => {
      const seat = c.SeatingCapacity ?? c.seatingCapacity;
      const brand = c.Brand || c.brand;
      return (!selectedSeats || seat === selectedSeats)
        && (!selectedBrand || brand === selectedBrand);
    });
  }, [cars, selectedSeats, selectedBrand]);

  // ===== client-side sort =====
  const sortedCars = useMemo(() => {
    return [...filteredCars].sort((a, b) => {
      const priceA = Number(a.DailyRate ?? a.dailyRate ?? 0);
      const priceB = Number(b.DailyRate ?? b.dailyRate ?? 0);
      if (sort === "price_asc") return priceA - priceB;
      if (sort === "price_desc") return priceB - priceA;
      return 0;
    });
  }, [filteredCars, sort]);

  const goToPage = (p) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="bg-neutral-50 py-12 mt-[100px]">

      {/* HEADER */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-neutral-900">Car Rentals</h1>
        <p className="text-neutral-500 mt-2">
          Premium cars for travel, business, and family trips.
        </p>
      </div>

      {/* SEARCH BAR */}
      <div className="px-6 mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by car name..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-end gap-4 border-b pb-6">
        <FilterDropdown
          label="Sort"
          options={[
            { label: "Default", value: "default" },
            { label: "Price: Low to High", value: "price_asc" },
            { label: "Price: High to Low", value: "price_desc" },
          ]}
          selected={sort}
          onChange={(v) => { setSort(v); setPage(1); }}
        />

        <FilterDropdown
          label="Category"
          badge={selectedType ? 1 : 0}
          options={[
            { label: "All Categories", value: null },
            ...carTypes.map(t => ({
              label: t.typeName || t.TypeName || "Unknown",
              value: t.carTypeID || t.CarTypeID,
            }))
          ]}
          selected={selectedType}
          onChange={(v) => { setSelectedType(v === selectedType ? null : v); setPage(1); }}
        />

        <FilterDropdown
          label="Brand"
          badge={selectedBrand ? 1 : 0}
          options={[
            { label: "All Brands", value: null },
            ...brands.map(b => ({ label: b, value: b }))
          ]}
          selected={selectedBrand}
          onChange={(v) => { setSelectedBrand(v === selectedBrand ? null : v); setPage(1); }}
        />

        <FilterDropdown
          label="Seats"
          badge={selectedSeats ? 1 : 0}
          options={[
            { label: "All Seats", value: null },
            ...seats.map(s => ({ label: `${s} seats`, value: s }))
          ]}
          selected={selectedSeats}
          onChange={(v) => { setSelectedSeats(v === selectedSeats ? null : v); setPage(1); }}
        />

        {/* Clear all filters button */}
        {(selectedType || selectedBrand || selectedSeats) && (
          <button
            onClick={() => {
              setSelectedType(null);
              setSelectedBrand(null);
              setSelectedSeats(null);
              setPage(1);
            }}
            className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* STATUS */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 py-3 px-4 rounded-lg">
            {error}
          </div>
        )}
        {loading && !error && (
          <div className="text-neutral-600 py-3 flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            Loading cars...
          </div>
        )}
        {!loading && !error && sortedCars.length > 0 && (
          <div className="text-neutral-600 text-sm">
            Showing {sortedCars.length} car{sortedCars.length !== 1 ? 's' : ''}
            {(selectedType || selectedBrand || selectedSeats || debouncedSearch) && ' (filtered)'}
          </div>
        )}
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedCars.map(car => (
          <CarCard key={car.CarID ?? car.carID} car={car} />
        ))}

        {!loading && sortedCars.length === 0 && (
          <div className="col-span-full text-center text-neutral-500 py-16">
            No cars found. Try adjusting filters.
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2">
          <button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            className={`px-3 py-1 rounded-lg border text-sm ${page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-primary-100"
              }`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => goToPage(num)}
              className={`px-3 py-1 rounded-lg border text-sm ${page === num ? "bg-primary-600 text-white" : "hover:bg-primary-100"
                }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-lg border text-sm ${page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-primary-100"
              }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* ===============================
   FILTER DROPDOWN
================================ */
function FilterDropdown({ label, options, selected, onChange, badge }) {
  const isSelected = selected !== null && selected !== undefined;

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="flex items-center gap-1 text-neutral-700 hover:text-black px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition">
        {label}
        {badge > 0 && (
          <span className="px-2 py-0.5 text-xs bg-primary-600 text-white rounded-full">
            {badge}
          </span>
        )}
        <ChevronDownIcon className="h-4 w-4 text-neutral-500" />
      </MenuButton>

      <MenuItems className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl p-2 z-20 max-h-64 overflow-y-auto">
        {options.map(opt => {
          const isChecked = selected === opt.value || (opt.value === null && !isSelected);
          return (
            <MenuItem key={opt.value ?? 'all'}>
              <button
                onClick={() => onChange(opt.value === null ? null : (opt.value === selected ? null : opt.value))}
                className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-neutral-100 transition ${isChecked ? 'bg-primary-50 text-primary-700 font-medium' : ''
                  }`}
              >
                <input
                  type="checkbox"
                  readOnly
                  checked={isChecked}
                  className="cursor-pointer"
                />
                <span>{opt.label}</span>
              </button>
            </MenuItem>
          );
        })}
      </MenuItems>
    </Menu>
  );
}
