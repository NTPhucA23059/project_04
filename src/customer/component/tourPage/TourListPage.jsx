import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import api from "../../../services/api";
import { fetchTourCategories, fetchTours } from "../../../services/customer/tourService";
const toAbsoluteUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const base = (api.defaults.baseURL || "").replace(/\/$/, "");
  const normalized = url.replace(/^\/+/, "");
  return base ? `${base}/${normalized}` : `/${normalized}`;
};
const normalizeCategory = (cat) => ({
  id: cat?.categoryID ?? cat?.CategoryID ?? cat?.id ?? cat?.categoryId ?? null,
  name: cat?.categoryName ?? cat?.CategoryName ?? cat?.name ?? "Unknown",
});

const normalizeTour = (tour) => {
  const detail = tour?.detail || tour?.Detail || {};
  const rawPrice = tour?.Price ?? tour?.price ?? detail?.unitPrice ?? detail?.UnitPrice;
  const price = typeof rawPrice === "number" ? rawPrice : Number(rawPrice || 0);

  return {
    id: tour?.tourID ?? tour?.TourID ?? tour?.id,
    code: tour?.tourCode ?? tour?.TourCode ?? "",
    name: tour?.tourName ?? tour?.TourName ?? "",
    img: toAbsoluteUrl(tour?.tourImg),
    duration: tour?.duration ?? tour?.Duration ?? "",
    startingLocation: tour?.startingLocation ?? tour?.StartingLocation ?? "",
    categoryId: tour?.categoryID ?? tour?.CategoryID ?? detail?.categoryID ?? detail?.CategoryID ?? null,
    price,
  };
};

export default function TourListPageVN({ tours = [] }) {
  const [showList, setShowList] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState([{ id: null, name: "All" }]);
  const [remoteTours, setRemoteTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const itemsPerPage = 6;

  // Fetch categories + tours from backend
  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [catRes, tourRes] = await Promise.all([
          fetchTourCategories(),
          fetchTours({ size: 100, status: 1 }),
        ]);

        if (ignore) return;

        const normalizedCats = Array.isArray(catRes)
          ? catRes.map(normalizeCategory).filter((c) => c.id)
          : [];

        setCategories([{ id: null, name: "All" }, ...normalizedCats]);

        const tourItems = Array.isArray(tourRes?.items)
          ? tourRes.items
          : Array.isArray(tourRes)
            ? tourRes
            : [];

        setRemoteTours(tourItems.map(normalizeTour));
      } catch (err) {
        console.error("Failed to load tours from API", err);
        if (!ignore) {
          setError("Không thể tải dữ liệu tour. Vui lòng thử lại sau.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadData();

    return () => {
      ignore = true;
    };
  }, []);

  const fallbackTours = useMemo(
    () => (Array.isArray(tours) ? tours.map(normalizeTour) : []),
    [tours]
  );

  const dataSource = remoteTours.length ? remoteTours : fallbackTours;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategoryId, dataSource.length]);

  const filteredTours = useMemo(() => {
    if (!selectedCategoryId) return dataSource;
    return dataSource.filter((t) => t.categoryId === selectedCategoryId);
  }, [dataSource, selectedCategoryId]);

  const totalPages = Math.ceil(filteredTours.length / itemsPerPage);

  const paginatedTours = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTours.slice(start, start + itemsPerPage);
  }, [filteredTours, currentPage]);

  const startIndex = filteredTours.length ? (currentPage - 1) * itemsPerPage : 0;

  const getCategoryName = (catId) => {
    return categories.find((c) => c.id === catId)?.name ?? "Uncategorized";
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* BUTTON SHOW/HIDE */}
        <button
          onClick={() => setShowList(!showList)}
          className="mb-6 px-4 py-2 flex items-center gap-2 bg-primary-400 text-white rounded-full shadow hover:bg-primary-500 transition"
        >
          {showList ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
          <span className="text-sm font-medium">
            {showList ? "Hide Domestic Tours" : "Show Domestic Tours"}
          </span>
        </button>

        {!showList && (
          <p className="text-neutral-500">Click the button above to view the tour list.</p>
        )}

        {showList && (
          <>
            <h2 className="text-3xl font-bold text-primary-700 mb-5">Domestic Tours</h2>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* CATEGORY TABS */}
            <div className="flex gap-8 mb-8 border-b pb-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id ?? "all"}
                  onClick={() => {
                    setSelectedCategoryId(cat.id);
                    setCurrentPage(1);
                  }}
                  className={`text-lg font-medium pb-1 relative
                    ${selectedCategoryId === cat.id
                      ? "text-primary-700"
                      : "text-neutral-500 hover:text-primary-400"
                    }
                  `}
                >
                  {cat.name}
                  {selectedCategoryId === cat.id && (
                    <span className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-primary-600"></span>
                  )}
                </button>
              ))}
            </div>

            {/* GRID TOURS */}
            {loading ? (
              <p className="text-neutral-500">Đang tải danh sách tour...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {paginatedTours.map((tour) => (
                  <div
                    key={tour.id || tour.code}
                    className="border rounded-xl shadow p-4 hover:shadow-lg transition"
                  >
                    <img
                      src={tour.img || "/placeholder-tour.jpg"}
                      alt={tour.name}
                      className="w-full h-56 object-cover rounded-md"
                    />

                    <p className="mt-3 inline-block px-3 py-1 bg-neutral-100 rounded-md text-primary-600 text-sm font-semibold">
                      {getCategoryName(tour.categoryId)}
                    </p>

                    <div className="mt-3">
                      <p className="text-sm text-neutral-500">
                        Duration: {tour.duration || "N/A"}
                      </p>
                      <h3 className="text-lg font-bold mt-1">{tour.name || "Unnamed tour"}</h3>

                      <p className="text-sm mt-2">
                        <strong>Tour code: </strong> {tour.code || "Updating"}
                      </p>
                      <p className="text-sm">
                        <strong>Departure from: </strong>{" "}
                        {tour.startingLocation || "Updating"}
                      </p>

                      <div className="mt-4 flex justify-between items-center">
                        <p className="text-xl font-bold text-red-600">
                          {tour.price
                            ? `$${Number(tour.price).toLocaleString()}`
                            : "Contact for price"}
                        </p>

                        <Link
                          to={`/tours/${tour.id ?? tour.code ?? ""}`}
                          className="px-3 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {paginatedTours.length === 0 && !loading && (
                  <p className="col-span-full text-center text-neutral-500">
                    Không tìm thấy tour phù hợp.
                  </p>
                )}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-between items-center">
                <p className="text-sm text-neutral-600">
                  Showing {filteredTours.length ? startIndex + 1 : 0} -{" "}
                  {Math.min(startIndex + itemsPerPage, filteredTours.length)} of{" "}
                  {filteredTours.length} tours
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 border rounded-md ${currentPage === 1 ? "opacity-40" : "hover:bg-neutral-200"
                      }`}
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 border rounded-md ${currentPage === i + 1
                        ? "bg-primary-600 text-white"
                        : "hover:bg-neutral-200"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 border rounded-md ${currentPage === totalPages ? "opacity-40" : "hover:bg-neutral-200"
                      }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
