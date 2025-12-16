import { useState } from "react";
import { StarIcon, ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";
import TourScheduleAccordion from "./TourScheduleAccordion";
import ReviewModal from "./ReviewModal";
import TourImportantNotes from "./TourImportantNotes";

export default function TourDetail({ tour, details, images, category, season, reviews }) {
    const tourCities = tour?.TourCities || [];

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

    // Format price to USD
    const formatUSD = (value) =>
        value?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
        }) || "$0";
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

    const formatDateTimeVN = (date) => {
        if (!date) return "";
        const d = new Date(date);

        // Thứ trong tuần
        const weekdays = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
        const weekday = weekdays[d.getDay()];

        // Giờ
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;

        // Ngày tháng năm
        const day = d.getDate();
        const month = d.getMonth() + 1;
        const year = d.getFullYear();

        return `${weekday}, ${time} ngày ${day}/${month}/${year}`;
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
        <div className="bg-white min-h-screen">
            {/* ===== Breadcrumb ===== */}
            <nav aria-label="Breadcrumb" className="bg-white border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>Tours</span>
                        <span>/</span>
                        <span className="text-gray-900 truncate max-w-xs">{tour.TourName}</span>
                    </div>
                </div>
            </nav>

            {/* ===== Floating Back Button ===== */}
            <button
                onClick={() => navigate('/tours')}
                className="fixed top-20 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-primary-50 text-gray-700 rounded-lg shadow-lg border border-primary-200 hover:bg-primary-100 hover:shadow-xl transition-all"
                aria-label="Back to Tours"
            >
                <ArrowLeftIcon className="w-5 h-5" />
            </button>

            {/* ===== Gallery ===== */}
            <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 lg:gap-4">
                    <div className="lg:col-span-4 aspect-[16/9] rounded-lg overflow-hidden bg-gray-200 shadow-md">
                        <img
                            src={selectedImage || tour.TourImg}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            alt="Main tour"
                        />
                    </div>

                    <div className="flex flex-col gap-2 lg:gap-3 lg:col-span-1">
                        {safeImages.length > 0 ? (
                            safeImages.slice(0, 3).map((img) => (
                                <div
                                    key={img.ImageID}
                                    onClick={() => setSelectedImage(img.ImageUrl)}
                                    className={`aspect-[4/3] rounded-lg overflow-hidden cursor-pointer ring-2 transition-all
                                     ${selectedImage === img.ImageUrl
                                            ? "ring-gray-600 ring-2"
                                            : "ring-transparent hover:ring-gray-300"
                                        }`}
                                >
                                    <img
                                        src={img.ImageUrl}
                                        className="w-full h-full object-cover"
                                        alt="Tour thumbnail"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="aspect-[4/3] rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                                No more images
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ===== Main Layout ===== */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

                <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    {/* LEFT CONTENT */}
                    <div className="lg:col-span-2 lg:pr-8 space-y-6">
                        {/* Header Section */}
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">{tour.TourName}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                        {category && (
                                            <span className="inline-flex items-center px-3 py-1 rounded bg-gray-100 text-gray-700 font-medium">
                                                {category.CategoryName}
                                            </span>
                                        )}
                                        <span className="text-gray-600">
                                            <span className="font-medium">Code:</span> {tour.TourCode}
                                        </span>
                                        {tour.Nation && (
                                            <span className="text-gray-600">
                                                {tour.Nation}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {tour.TourDescription && (
                            <div className="prose max-w-none">
                                <p className="text-gray-700 leading-relaxed text-base lg:text-lg">{tour.TourDescription}</p>
                            </div>
                        )}

                        {/* Tour Information Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tour.Duration && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Duration</p>
                                    <p className="font-medium text-gray-900">{tour.Duration}</p>
                                </div>
                            )}
                            {tour.StartingLocation && (
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Starting Location</p>
                                    <p className="font-medium text-gray-900">{tour.StartingLocation}</p>
                                </div>
                            )}
                        </div>

                        {/* Route Cities */}
                        {tourCities.length > 0 && (
                            <div className="bg-white rounded-lg p-5 border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">The city during the tour:</h3>
                                <div className="space-y-2">
                                    {tourCities.map((city, index) => (
                                        <div key={city.CityID} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex-shrink-0 w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                                {city.CityOrder}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{city.CityName}</p>
                                                {city.StayDays > 0 && (
                                                    <p className="text-sm text-gray-600 mt-0.5">
                                                        Stay: {city.StayDays} {city.StayDays === 1 ? 'day' : 'days'}
                                                    </p>
                                                )}
                                            </div>
                                            {index < tourCities.length - 1 && (
                                                <div className="flex-shrink-0 text-gray-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Season */}
                        {season && (
                            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-gray-400">
                                <h3 className="text-base font-semibold text-gray-900 mb-2">
                                    Season: {season.SeasonName}
                                </h3>
                                {season.Description && (
                                    <p className="text-sm text-gray-700">{season.Description}</p>
                                )}
                            </div>
                        )}

                        {/* Highlights */}
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                            <h3 className="text-base font-semibold text-gray-900 mb-3">Tour Highlights</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {[
                                    "Flight tickets + hotel included",
                                    "Transportation & tour guide",
                                    "Travel insurance included",
                                    "Popular sightseeing attractions"
                                ].map((highlight, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <span className="text-gray-600">•</span>
                                        <span className="text-gray-700">{highlight}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT BOOKING BOX */}
                    {details && (
                        <div className="lg:sticky lg:top-6 h-fit mt-6 lg:mt-0">
                            <div className="bg-primary-100 rounded-lg p-5 border border-gray-300 shadow-md">
                                <div className="text-center mb-4">
                                    <p className="text-xs text-gray-600 mb-1">Starting from</p>
                                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                                        {formatUSD(unitPrice)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">per person</p>
                                </div>

                                <div className="bg-primary-50 rounded-lg p-3 space-y-3 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Departure Date</p>
                                        <p className="font-medium text-gray-900">{formatDateTimeEN(details.DepartureDate)}</p>
                                        <p className="text-xs text-gray-500 mt-1">{formatDateTimeVN(details.DepartureDate)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">Arrival Date</p>
                                        <p className="font-medium text-gray-900">{formatDateTimeEN(details.ArrivalDate)}</p>
                                        <p className="text-xs text-gray-500 mt-1">{formatDateTimeVN(details.ArrivalDate)}</p>
                                    </div>
                                    <div className="pt-3 border-t border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Total Seats</span>
                                            <span className="font-medium text-gray-900">{details.NumberOfGuests}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Booked</span>
                                            <span className="font-medium text-gray-900">{details.BookedSeat || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Available</span>
                                            <span className="font-medium text-green-600">
                                                {details.NumberOfGuests - (details.BookedSeat || 0)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!canBook && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-700">
                                            This tour must be booked at least 24 hours before departure.
                                        </p>
                                    </div>
                                )}

                                <button
                                    onClick={handleBooking}
                                    disabled={!canBook}
                                    className={`w-full font-medium py-2.5 text-sm rounded-lg transition
                                     ${canBook
                                            ? "bg-gray-800 text-white hover:bg-gray-700"
                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    {canBook ? "Book This Tour" : "Booking Closed"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ===== TOUR SCHEDULES ===== */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12">
                <TourScheduleAccordion
                    schedules={schedules}
                />
            </div>

            {/* ===== IMPORTANT NOTES ===== */}
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 lg:mt-12">
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

        </div >
    );
}
