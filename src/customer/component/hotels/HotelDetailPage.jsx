"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    StarIcon,
    MapPinIcon,
    CheckIcon,
    ClockIcon,
    ArrowLeftIcon
} from "@heroicons/react/24/solid";
import HotelHero from "./HotelHero";
import { fetchHotelById } from "../../../services/customer/hotelService";

export default function HotelDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showAllAmenities, setShowAllAmenities] = useState(false);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const data = await fetchHotelById(id);
                console.log("Hotel data from API:", data);
                console.log("Hotel Amenities:", data.hotelAmenities);
                console.log("Nearby Attractions:", data.nearbyAttractions);
                setHotel(data);
            } catch (err) {
                console.error("Error fetching hotel:", err);
                setHotel(null);
            } finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id]);

    // ⏳ Loading
    if (loading) {
        return (
            <>
                <HotelHero />
                <div className="text-center py-20 text-neutral-700">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
                    <p>Loading hotel data...</p>
                </div>
            </>
        );
    }

    if (!hotel) {
        return (
            <>
                <HotelHero />
                <div className="text-center py-20 text-neutral-700">
                    Hotel not found.
                </div>
            </>
        );
    }

    const allAmenities = hotel.hotelAmenities && hotel.hotelAmenities.length > 0
        ? hotel.hotelAmenities.map(ha => ha.amenityName)
        : (hotel.facilities ? hotel.facilities.split(',').map(f => f.trim()).filter(Boolean) : []);
        const nearbyAttractions = hotel.nearbyAttractions || [];

    // Ảnh chính từ bảng Hotels (ImageUrl)
    const mainImage = hotel.imageUrl;
    
    // 3 ảnh phụ từ bảng Images
    const subImages = hotel.images?.map(img => img.imageUrl || img.url).filter(Boolean).slice(0, 3) || [];
    
    // Tổng hợp: ảnh chính + 3 ảnh phụ
    const displayImages = [mainImage, ...subImages].filter(Boolean);

    const averageRating = hotel.rating;

    return (
        <>
            <HotelHero />

            <div className="max-w-9xl px-4 sm:px-6 py-8">
                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate('/hotels')}
                    className="mb-4 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    <span>Back to hotel list</span>
                </button>

                {/* HEADER SECTION */}
                <div className="mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
                                {hotel.hotelName}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-neutral-700">
                                {averageRating && (
                                    <>
                                        <div className="flex items-center gap-1">
                                            <StarIcon className="w-5 h-5 text-accent-500" />
                                            <span className="font-semibold">{averageRating}</span>
                                        </div>
                                        <span className="text-neutral-400">•</span>
                                    </>
                                )}
                                {hotel.cityName && (
                                    <>
                                        <div className="flex items-center gap-1">
                                            <MapPinIcon className="w-5 h-5 text-primary-600" />
                                            <span>{hotel.cityName}</span>
                                        </div>
                                        {hotel.address && (
                                            <>
                                                <span className="text-neutral-400">•</span>
                                                <span className="text-neutral-600">{hotel.address}</span>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {averageRating && (
                                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                    ⭐ {averageRating} stars
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    {mainImage || subImages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Ảnh chính (từ Hotels.ImageUrl) */}
                            <div className="md:col-span-2 md:row-span-2">
                                <img
                                    src={mainImage || subImages[0]}
                                    alt={hotel.hotelName}
                                    className="w-full h-full object-cover rounded-xl shadow-lg cursor-pointer min-h-[400px]"
                                    onClick={() => { }}
                                />
                            </div>
                            {/* 3 ảnh phụ (từ bảng Images) */}
                            {subImages.slice(0, 3).map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`cursor-pointer rounded-xl overflow-hidden shadow-md transition-transform hover:scale-105 ${idx === selectedImageIndex - 1 ? 'ring-2 ring-primary-500' : ''
                                        }`}
                                    onClick={() => setSelectedImageIndex(idx + 1)}
                                >
                                    <img
                                        src={img}
                                        alt={`${hotel.hotelName} ${idx + 2}`}
                                        className="w-full h-full object-cover min-h-[190px]"
                                    />
                                </div>
                            ))}
                            {/* Placeholder nếu chưa đủ 3 ảnh phụ */}
                            {subImages.length < 3 && Array.from({ length: 3 - subImages.length }).map((_, idx) => (
                                <div key={`placeholder-${idx}`} className="hidden md:block rounded-xl bg-neutral-100 border-2 border-dashed border-neutral-300 min-h-[190px]"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full h-64 bg-neutral-200 rounded-xl flex items-center justify-center">
                            <p className="text-neutral-500">No images available</p>
                        </div>
                    )}
                </div>

                <div className="max-w-9xl mx-auto">
                    {/* MAIN CONTENT */}
                    <div className="space-y-8">
                        {/* OVERVIEW */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Overview</h2>
                            {hotel.description ? (
                                <p className="text-neutral-700 leading-relaxed mb-4">
                                    {hotel.description}
                                </p>
                            ) : (
                                <p className="text-neutral-500 text-sm italic">No description available</p>
                            )}

                            {/* Quick stats */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-neutral-200">
                                {hotel.numberOfRooms && (
                                    <div>
                                        <p className="text-sm text-neutral-500">Rooms</p>
                                        <p className="text-xl font-bold text-neutral-900">{hotel.numberOfRooms}+</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-neutral-500">Star Rating</p>
                                    <p className="text-xl font-bold text-neutral-900">{Math.round(averageRating)} ⭐</p>
                                </div>
                                {hotel.yearBuilt && (
                                    <div>
                                        <p className="text-sm text-neutral-500">Year Built</p>
                                        <p className="text-xl font-bold text-neutral-900">{hotel.yearBuilt}</p>
                                    </div>
                                )}
                                {hotel.numberOfFloors && (
                                    <div>
                                        <p className="text-sm text-neutral-500">Floors</p>
                                        <p className="text-xl font-bold text-neutral-900">{hotel.numberOfFloors}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AMENITIES */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Amenities & Services</h2>
                            
                            {allAmenities.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {(showAllAmenities ? allAmenities : allAmenities.slice(0, 8)).map((amenity, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors">
                                                <CheckIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                                                <span className="text-neutral-700 text-sm font-medium">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {allAmenities.length > 8 && (
                                        <button
                                            onClick={() => setShowAllAmenities(!showAllAmenities)}
                                            className="mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
                                        >
                                            {showAllAmenities ? "Show Less" : `Show More ${allAmenities.length - 8} amenities`}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <p className="text-neutral-500 text-sm">No amenities information available</p>
                            )}
                        </div>



                        {/* LOCATION & NEARBY */}
                        <div className="bg-white rounded-xl border border-neutral-200 p-6">
                            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Location & Nearby</h2>

                            <div className="mb-4">
                                <div className="flex items-start gap-3 mb-4">
                                    <MapPinIcon className="w-6 h-6 text-primary-600 mt-1" />
                                    <div>
                                        {hotel.address && (
                                            <p className="font-semibold text-neutral-900">{hotel.address}</p>
                                        )}
                                        {hotel.cityName && (
                                            <p className="text-neutral-600">{hotel.cityName}</p>
                                        )}
                                        {(hotel.phoneNumber || hotel.email) && (
                                            <div className="mt-2 space-y-1 text-sm text-neutral-600">
                                                {hotel.phoneNumber && <p>📞 {hotel.phoneNumber}</p>}
                                                {hotel.email && <p>✉️ {hotel.email}</p>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Map placeholder */}
                                <div className="w-full h-64 bg-neutral-200 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
                                    <div className="text-center">
                                        <MapPinIcon className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                                        <p className="text-neutral-500">🗺️ Map</p>
                                    </div>
                                </div>
                            </div>

                            {nearbyAttractions.length > 0 ? (
                                <div>
                                    <h3 className="font-semibold text-neutral-900 mb-3">Nearby Attractions</h3>
                                    <div className="space-y-2">
                                        {nearbyAttractions.map((attraction, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                                                <div className="flex-1">
                                                    <p className="font-medium text-neutral-900">{attraction.attractionName}</p>
                                                    {attraction.attractionType && (
                                                        <p className="text-sm text-neutral-500">{attraction.attractionType}</p>
                                                    )}
                                                    {attraction.description && (
                                                        <p className="text-xs text-neutral-400 mt-1">{attraction.description}</p>
                                                    )}
                                                    {attraction.direction && (
                                                        <p className="text-xs text-neutral-500 mt-1">📍 Direction: {attraction.direction}</p>
                                                    )}
                                                </div>
                                                {attraction.distance && (
                                                    <span className="text-primary-600 font-medium ml-4">
                                                        {attraction.distance} km
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h3 className="font-semibold text-neutral-900 mb-3">Nearby Attractions</h3>
                                    <p className="text-neutral-500 text-sm">No nearby attractions information available</p>
                                </div>
                            )}
                        </div>

                      
                    </div>
                </div>
            </div>
        </>
    );
}
