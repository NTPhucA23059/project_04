import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { fetchCars } from "../../../services/customer/carService";
import api from "../../../services/api";

/* ===============================
   UTIL: relative -> absolute URL
================================ */
const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//.test(url)) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    return `${base}/${url.replace(/^\/+/, "")}`;
};

export default function CarListPage({ cars = [] }) {
    const [showList, setShowList] = useState(false);
    const [category, setCategory] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const hasFetched = useRef(false);
    const itemsPerPage = 6;

    const toUSD = (vnd) => Math.round((Number(vnd) || 0) / 24000);

    /* ===============================
       LOAD DATA
    ================================ */
    useEffect(() => {
        // Nếu có cars từ props → normalize luôn
        if (cars && cars.length > 0) {
            const normalized = cars.map(car => ({
                ...car,
                imageUrl: toAbsoluteUrl(
                    car.CarImg ||
                    car.Image ||
                    car.image ||
                    car.ImageUrl
                ),
            }));
            setData(normalized);
            return;
        }

        if (hasFetched.current) return;
        hasFetched.current = true;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetchCars({ page: 0, size: 200 });
                const items = res.items || res || [];

                const normalized = items.map(car => ({
                    ...car,
                    imageUrl: toAbsoluteUrl(
                        car.CarImg ||
                        car.Image ||
                        car.image ||
                        car.ImageUrl
                    ),
                }));

                setData(normalized);
            } catch (e) {
                console.error(e);
                setError("Không tải được danh sách xe");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [cars]);

    /* ===============================
       CATEGORY (BRAND)
    ================================ */
    const categories = useMemo(() => {
        return [
            "All",
            ...new Set(
                data.map(car => car.Brand || car.brand).filter(Boolean)
            ),
        ];
    }, [data]);

    const filteredCars =
        category === "All"
            ? data
            : data.filter(
                car => (car.Brand || car.brand) === category
            );

    /* ===============================
       PAGINATION
    ================================ */
    const totalPages = Math.ceil(filteredCars.length / itemsPerPage);

    const paginatedCars = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCars.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCars, currentPage]);

    const startIndex = (currentPage - 1) * itemsPerPage;

    /* ===============================
       RENDER
    ================================ */
    return (
        <div className="bg-white w-full">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                {/* SHOW / HIDE */}
                <button
                    onClick={() => setShowList(!showList)}
                    className="mb-6 px-4 py-2 flex items-center gap-2 bg-primary-600 text-white rounded-full shadow hover:bg-primary-700 transition"
                >
                    {showList ? <FaEyeSlash /> : <FaEye />}
                    <span className="text-sm font-medium">
                        {showList ? "Hide Car Rental" : "Show Car Rental"}
                    </span>
                </button>

                {!showList && (
                    <p className="text-neutral-500">
                        Click the button above to view car rental services.
                    </p>
                )}

                {showList && (
                    <>
                        <h2 className="text-3xl font-bold text-primary-700 mb-5">
                            Car Rental Services
                        </h2>

                        {/* CATEGORY */}
                        <div className="flex gap-8 mb-8 border-b pb-2">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        setCategory(cat);
                                        setCurrentPage(1);
                                    }}
                                    className={`text-lg font-medium pb-1 relative ${category === cat
                                            ? "text-primary-700"
                                            : "text-neutral-500 hover:text-primary-500"
                                        }`}
                                >
                                    {cat}
                                    {category === cat && (
                                        <span className="absolute left-0 right-0 -bottom-[2px] h-[2px] bg-primary-600" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* STATUS */}
                        {loading && (
                            <div className="text-neutral-500 py-10">
                                Đang tải xe...
                            </div>
                        )}

                        {error && !loading && (
                            <div className="text-red-600 py-10">
                                {error}
                            </div>
                        )}

                        {/* GRID */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                {paginatedCars.map(car => {
                                    const id = car.CarID || car.carID;
                                    const brand = car.Brand || car.brand;
                                    const model = car.ModelName || car.modelName;
                                    const seats = car.SeatingCapacity ?? car.seatingCapacity;
                                    const hasDriver = car.HasDriverOption ?? car.hasDriverOption;
                                    const daily = car.DailyRate ?? car.dailyRate ?? 0;

                                    return (
                                        <div
                                            key={id}
                                            className="border rounded-xl p-4 shadow hover:shadow-lg transition"
                                        >
                                            <img
                                                src={
                                                    car.imageUrl ||
                                                    "https://placehold.co/400x300"
                                                }
                                                alt={model}
                                                className="w-full h-56 object-cover rounded-md"
                                            />

                                            <p className="mt-3 text-xl font-bold">
                                                {brand} {model}
                                            </p>

                                            <p className="text-neutral-600 mt-1">
                                                Seats: <strong>{seats}</strong>
                                            </p>

                                            <p className="text-neutral-600">
                                                Driver Included:{" "}
                                                <strong>
                                                    {hasDriver ? "Yes" : "No"}
                                                </strong>
                                            </p>

                                            <p className="text-xl font-bold text-green-600 mt-3">
                                                $
                                                {toUSD(daily).toLocaleString()}{" "}
                                                / day
                                            </p>

                                            <Link
                                                to={`/car/${id}`}
                                                className="inline-block mt-3 px-3 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50"
                                            >
                                                View Details
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-between items-center">
                                <p className="text-sm text-neutral-600">
                                    Showing {startIndex + 1} –{" "}
                                    {Math.min(
                                        startIndex + itemsPerPage,
                                        filteredCars.length
                                    )}{" "}
                                    of {filteredCars.length} cars
                                </p>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() =>
                                            setCurrentPage(p =>
                                                Math.max(1, p - 1)
                                            )
                                        }
                                        disabled={currentPage === 1}
                                        className={`px-3 py-1 border rounded-md ${currentPage === 1
                                                ? "opacity-40"
                                                : "hover:bg-neutral-200"
                                            }`}
                                    >
                                        Previous
                                    </button>

                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1
                                    ).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setCurrentPage(p)}
                                            className={`w-9 h-9 border rounded-md ${currentPage === p
                                                    ? "bg-primary-600 text-white"
                                                    : "hover:bg-neutral-200"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}

                                    <button
                                        onClick={() =>
                                            setCurrentPage(p =>
                                                Math.min(totalPages, p + 1)
                                            )
                                        }
                                        disabled={currentPage === totalPages}
                                        className={`px-3 py-1 border rounded-md ${currentPage === totalPages
                                                ? "opacity-40"
                                                : "hover:bg-neutral-200"
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
