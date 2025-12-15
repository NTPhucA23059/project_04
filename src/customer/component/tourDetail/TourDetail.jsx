import { useState } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";
import TourScheduleAccordion from "./TourScheduleAccordion";
import ReviewModal from "./ReviewModal";
import TourImportantNotes from "./TourImportantNotes";

export default function TourDetail({ tour, details, images, category, season, reviews }) {

    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const schedules = details?.Schedules || [];
    const safeImages = images || [];
    const safeReviews = reviews || [];

    const [selectedImage, setSelectedImage] = useState(tour?.TourImg);
    // useEffect(() => {
    //     setSelectedImage(tour?.TourImg);
    // }, [tour]);
    const avgRating = safeReviews.length
        ? (
            safeReviews.reduce((sum, r) => sum + r.Rating, 0) / safeReviews.length
        ).toFixed(1)
        : "0.0";

    const unitPrice = details?.UnitPrice ?? 0;
    // ===== BOOKING RULE: must book 24h before departure =====
    const canBook = (() => {
        if (!details?.DepartureDate) return false;

        const now = new Date();
        const departure = new Date(details.DepartureDate);

        const diffMs = departure.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        return diffHours >= 24;
    })();


    const formatDateTimeEN = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };


    function handleBooking() {
        if (!details?.TourDetailID) return;
        navigate(`/checkout/${details.TourDetailID}`, {
            state: {
                tour,
                details,
                images,
                category,
                season
            }
        });
    }

    return (
        <div className="bg-white">
            {/* ===== Breadcrumb ===== */}
            <nav aria-label="Breadcrumb" className="pt-6">
                <ol className="mx-auto flex max-w-7xl items-center space-x-2 px-4">
                    <li><a href="/tours" className="text-sm text-gray-500 hover:text-orange-600">Tours</a></li>
                    <li>
                        <svg width={14} height={20} fill="currentColor" className="text-gray-400">
                            <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                        </svg>
                    </li>
                    <li className="text-sm font-medium text-gray-900">{tour.TourName}</li>
                </ol>
            </nav>

            {/* ===== Gallery ===== */}
            <div className="mx-auto mt-6 max-w-7xl px-4 grid grid-cols-5 gap-4">

                <div className="col-span-4 aspect-[16/9] rounded-2xl overflow-hidden bg-gray-200">
                    <img
                        src={selectedImage}
                        className="w-full h-full object-cover"
                        alt="Main tour"
                    />
                </div>




                <div className="flex flex-col gap-3">
                    {safeImages.slice(0, 3).map((img) => (
                        <div
                            key={img.ImageID}
                            onClick={() => setSelectedImage(img.ImageUrl)}
                            className={`aspect-[4/3] rounded-xl overflow-hidden cursor-pointer ring-2 transition
                             ${selectedImage === img.ImageUrl
                                    ? "ring-orange-500"
                                    : "ring-transparent hover:ring-orange-300"
                                }`}
                        >
                            <img
                                src={img.ImageUrl}
                                className="w-full h-full object-cover"
                                alt="Tour thumbnail"
                            />
                        </div>
                    ))}
                </div>


            </div>

            {/* ===== Main Layout ===== */}
            <div className="mx-auto max-w-7xl px-4 py-12 lg:grid lg:grid-cols-3 lg:gap-10">

                {/* LEFT CONTENT */}
                <div className="lg:col-span-2 lg:pr-8">

                    <h1 className="text-3xl font-bold text-gray-900">{tour.TourName}</h1>

                    <p className="mt-2 text-gray-600">Tour Code: {tour.TourCode}</p>
                    <p className="mt-1 text-gray-600">Category: {category?.CategoryName}</p>
                    <p className="mt-1 text-gray-600">Country: {tour.Nation}</p>

                    <p className="mt-6 text-gray-700">{tour.TourDescription}</p>

                    {/* Tour Information */}
                    {details && (
                        <div className="mt-10">
                            <h2 className="text-xl font-bold">Tour Information</h2>
                            <p className="mt-4 text-gray-700">{details.TourDetailDescription}</p>
                        </div>
                    )}

                    {/* Season */}
                    {season && (
                        <div className="mt-8 border-l-4 border-orange-500 pl-4">
                            <h3 className="text-lg font-semibold">Season: {season.SeasonName}</h3>
                            <p className="text-gray-600">{season.Description}</p>
                        </div>
                    )}

                    {/* Highlights */}
                    <div className="mt-10">
                        <h3 className="text-lg font-semibold">Highlights</h3>
                        <ul className="list-disc pl-6 mt-4 text-gray-700 space-y-1">
                            <li>Flight tickets + hotel included</li>
                            <li>Transportation & tour guide</li>
                            <li>Travel insurance included</li>
                            <li>Popular sightseeing attractions</li>
                        </ul>
                    </div>

                </div>

                {/* RIGHT BOOKING BOX */}
                {details && (
                    <div>
                        <div className="border rounded-xl p-6 shadow-md bg-orange-50">

                            <p className="text-3xl font-bold text-orange-600">
                                ${Number(unitPrice).toLocaleString()}
                            </p>

                            <div className="mt-5 text-gray-700 text-sm space-y-1">
                                <p><strong>Start:</strong> {formatDateTimeEN(details.DepartureDate)}</p>
                                <p><strong>End:</strong> {formatDateTimeEN(details.ArrivalDate)}</p>

                                <p><strong>From:</strong> {details.FromLocation}</p>
                                <p><strong>To:</strong> {details.ToLocation}</p>
                                <p><strong>Seats:</strong> {details.NumberOfGuests}</p>
                                <p><strong>Booked:</strong> {details.BookedSeat}</p>
                                <p><strong>Available:</strong> {details.NumberOfGuests - details.BookedSeat}</p>
                            </div>
                            {!canBook && (
                                <p className="mt-3 text-sm text-red-600">
                                    This tour must be booked at least 24 hours before departure.
                                </p>
                            )}
                            <button
                                onClick={handleBooking}
                                disabled={!canBook}
                                className={`mt-8 w-full font-semibold py-3 rounded-lg transition
                                ${canBook
                                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    }`}
                            >
                                {canBook ? "Book This Tour" : "Booking closed (less than 24h)"}
                            </button>

                        </div>
                    </div>
                )}

            </div>

            {/* ===== TOUR SCHEDULES ===== */}
            <div className="mx-auto max-w-7xl px-4">
                <TourScheduleAccordion
                    schedules={schedules}
                />
            </div>

            {/* ===== IMPORTANT NOTES ===== */}
            <div className="mx-auto max-w-7xl px-4 mt-12">
                <TourImportantNotes />

                {/* REVIEWS */}
                <div className="mt-12">
                    <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-orange-600">{avgRating}</p>
                            <p className="text-sm text-gray-600">{safeReviews.length} reviews</p>
                        </div>

                        <div className="flex text-yellow-500">
                            {Array(Math.round(avgRating)).fill(0).map((_, i) => (
                                <StarIcon key={i} className="h-7 w-7" />
                            ))}
                        </div>
                    </div>

                    {/* Review List */}
                    <div className="space-y-8">
                        {safeReviews.slice(0, 5).map(r => (
                            <div key={r.ReviewID} className="pb-6 border-b">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700">
                                        U{r.AccountID}
                                    </div>

                                    <div>
                                        <p className="font-semibold">User {r.AccountID}</p>
                                        <div className="flex text-yellow-500">
                                            {Array(r.Rating).fill(0).map((_, i) => (
                                                <StarIcon key={i} className="h-5 w-5" />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-700">{r.Comment}</p>
                                <p className="text-xs text-gray-500">{new Date(r.CreatedAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>

                    {/* Modal */}
                    {safeReviews.length > 5 && (
                        <button className="mt-6 text-orange-600 font-semibold hover:underline"
                            onClick={() => setShowModal(true)}>
                            View all reviews
                        </button>
                    )}

                    <ReviewModal show={showModal} onClose={() => setShowModal(false)} reviews={safeReviews} />
                </div>
            </div>

        </div>
    );
}
