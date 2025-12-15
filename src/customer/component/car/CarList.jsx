"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import { mockCarTypes } from "../data/mockData";
import { fetchCars } from "../../../services/customer/carService";
import api from "../../../services/api";
import CarCard from "./CarCard";

const ITEMS_PER_PAGE = 6;

// ===== util: convert relative -> absolute =====
const toAbsoluteUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//.test(url)) return url;
  const base = (api.defaults.baseURL || "").replace(/\/$/, "");
  return `${base}/${url.replace(/^\/+/, "")}`;
};

export default function CarListPage() {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState(null);
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1); // UI is 1-based

  const [cars, setCars] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const brands = [...new Set(cars.map(c => c.Brand || c.brand).filter(Boolean))];
  const seats = [...new Set(cars.map(c => c.SeatingCapacity ?? c.seatingCapacity).filter(Boolean))];

  // ===== fetch cars =====
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetchCars({
          page: page - 1,
          size: ITEMS_PER_PAGE,
          keyword: selectedBrand || undefined,
          carTypeID: selectedType || undefined,
        });

        const normalizedCars = (res.items || []).map(car => ({
          ...car,
          // Normalize main image
          image: toAbsoluteUrl(car.image || car.Image || car.imageUrl || car.ImageUrl || car.MainImage),
          imageUrl: toAbsoluteUrl(car.image || car.Image || car.imageUrl || car.ImageUrl || car.MainImage),
          // Normalize images array if exists
          images: (car.images || []).map(img => ({
            ...img,
            imageUrl: toAbsoluteUrl(img.imageUrl || img.ImageUrl),
          })),
        }));

        setCars(normalizedCars);
        setTotalPages(res.totalPages || 1);
      } catch (err) {
        setError(err?.message || "Không thể tải danh sách xe");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [page, selectedType, selectedBrand]);

  // ===== client-side filter =====
  const filteredCars = cars.filter(c => {
    const seat = c.SeatingCapacity ?? c.seatingCapacity;
    const brand = c.Brand || c.brand;
    return (!selectedSeats || seat === selectedSeats)
        && (!selectedBrand || brand === selectedBrand);
  });

  // ===== client-side sort =====
  const sortedCars = [...filteredCars].sort((a, b) => {
    const priceA = Number(a.DailyRate ?? a.dailyRate ?? 0);
    const priceB = Number(b.DailyRate ?? b.dailyRate ?? 0);
    if (sort === "price_asc") return priceA - priceB;
    if (sort === "price_desc") return priceB - priceA;
    return 0;
  });

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

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-end gap-6 border-b pb-6">
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
          options={mockCarTypes.map(t => ({
            label: t.TypeName,
            value: t.CarTypeID,
          }))}
          selected={selectedType}
          onChange={(v) => { setSelectedType(v === selectedType ? null : v); setPage(1); }}
        />

        <FilterDropdown
          label="Brand"
          badge={selectedBrand ? 1 : 0}
          options={brands.map(b => ({ label: b, value: b }))}
          selected={selectedBrand}
          onChange={(v) => { setSelectedBrand(v === selectedBrand ? null : v); setPage(1); }}
        />

        <FilterDropdown
          label="Seats"
          badge={selectedSeats ? 1 : 0}
          options={seats.map(s => ({ label: `${s} seats`, value: s }))}
          selected={selectedSeats}
          onChange={(v) => { setSelectedSeats(v === selectedSeats ? null : v); setPage(1); }}
        />
      </div>

      {/* STATUS */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        {error && <div className="text-red-600 py-3">{error}</div>}
        {loading && !error && <div className="text-neutral-600 py-3">Đang tải xe...</div>}
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
            className={`px-3 py-1 rounded-lg border text-sm ${
              page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-primary-100"
            }`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => goToPage(num)}
              className={`px-3 py-1 rounded-lg border text-sm ${
                page === num ? "bg-primary-600 text-white" : "hover:bg-primary-100"
              }`}
            >
              {num}
            </button>
          ))}

          <button
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
            className={`px-3 py-1 rounded-lg border text-sm ${
              page === totalPages ? "opacity-40 cursor-not-allowed" : "hover:bg-primary-100"
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
  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="flex items-center gap-1 text-neutral-700 hover:text-black">
        {label}
        {badge > 0 && (
          <span className="px-2 py-0.5 text-xs bg-primary-600 text-white rounded-full">
            {badge}
          </span>
        )}
        <ChevronDownIcon className="h-4 w-4 text-neutral-500" />
      </MenuButton>

      <MenuItems className="absolute right-0 mt-3 w-48 bg-white shadow-xl rounded-xl p-3 z-20">
        {options.map(opt => (
          <MenuItem key={opt.value}>
            <button
              onClick={() => onChange(opt.value)}
              className="flex items-center gap-2 w-full px-2 py-2 text-sm rounded-lg hover:bg-neutral-100"
            >
              <input type="checkbox" readOnly checked={selected === opt.value} />
              {opt.label}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  );
}
