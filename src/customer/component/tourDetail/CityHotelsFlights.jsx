import { useState, useEffect } from "react";
import { getHotelsByCity } from "../../../services/customer/hotelService";
import { fetchFlights } from "../../../services/customer/flightService";
import { fetchCityById } from "../../../services/customer/cityService";
import HotelCard from "../hotels/HotelCard";
import FlightCard from "../flight/FlightCard";
import { BuildingOfficeIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

export default function CityHotelsFlights({ tourCities = [] }) {
    const [hotelsData, setHotelsData] = useState({}); // { cityID: [hotels] }
    const [flightsData, setFlightsData] = useState({}); // { "from-cityID": [flights] }
    const [cityNamesMap, setCityNamesMap] = useState({}); // { cityID: cityName }
    const [loadingHotels, setLoadingHotels] = useState({});
    const [loadingFlights, setLoadingFlights] = useState({});
    const [expandedCity, setExpandedCity] = useState(null);
    
    // Initialize city names map from tourCities
    useEffect(() => {
        const initialMap = {};
        tourCities.forEach(city => {
            if (city.CityID) {
                initialMap[city.CityID] = city.CityName;
            }
        });
        setCityNamesMap(initialMap);
    }, [tourCities]);

    // Fetch hotels for each city
    useEffect(() => {
        const fetchHotelsForCities = async () => {
            const hotelsPromises = tourCities.map(async (city) => {
                if (city.CityID) {
                    setLoadingHotels(prev => ({ ...prev, [city.CityID]: true }));
                    try {
                        const hotels = await getHotelsByCity(city.CityID);
                        return { cityID: city.CityID, hotels: hotels || [] };
                    } catch (error) {
                        console.error(`Error fetching hotels for city ${city.CityID}:`, error);
                        return { cityID: city.CityID, hotels: [] };
                    } finally {
                        setLoadingHotels(prev => ({ ...prev, [city.CityID]: false }));
                    }
                }
                return null;
            });

            const results = await Promise.all(hotelsPromises);
            const hotelsMap = {};
            results.forEach(result => {
                if (result) {
                    hotelsMap[result.cityID] = result.hotels;
                }
            });
            setHotelsData(hotelsMap);
        };

        if (tourCities.length > 0) {
            fetchHotelsForCities();
        }
    }, [tourCities]);

    // Fetch flights FROM each city (not to a specific destination)
    useEffect(() => {
        const fetchFlightsFromCities = async () => {
            const flightsPromises = [];
            
            tourCities.forEach((city) => {
                if (city.CityID) {
                    const key = `from-${city.CityID}`;
                    setLoadingFlights(prev => ({ ...prev, [key]: true }));
                    
                    flightsPromises.push(
                        fetchFlights({
                            page: 0,
                            size: 10,
                            fromCityID: city.CityID
                            // No toCityID - get all flights departing from this city
                        })
                        .then(response => {
                            const flights = response.items || [];
                            return { key, flights };
                        })
                        .catch(error => {
                            console.error(`Error fetching flights from city ${city.CityID}:`, error);
                            return { key, flights: [] };
                        })
                        .finally(() => {
                            setLoadingFlights(prev => ({ ...prev, [key]: false }));
                        })
                    );
                }
            });

            const results = await Promise.all(flightsPromises);
            const flightsMap = {};
            const cityIDsToFetch = new Set();
            
            // Collect all unique city IDs from flights
            results.forEach(result => {
                flightsMap[result.key] = result.flights;
                result.flights.forEach(flight => {
                    if (flight.fromCityID) {
                        cityIDsToFetch.add(flight.fromCityID);
                    }
                    if (flight.toCityID) {
                        cityIDsToFetch.add(flight.toCityID);
                    }
                });
            });
            setFlightsData(flightsMap);
            
            // Fetch city names for all cities in flights (only if not already in map)
            if (cityIDsToFetch.size > 0) {
                setCityNamesMap(currentMap => {
                    const missingIDs = Array.from(cityIDsToFetch).filter(id => !currentMap[id]);
                    if (missingIDs.length > 0) {
                        const cityNamePromises = missingIDs.map(async (cityID) => {
                            try {
                                const cityData = await fetchCityById(cityID);
                                return { cityID, cityName: cityData.cityName || cityData.CityName || null };
                            } catch (error) {
                                console.error(`Error fetching city ${cityID}:`, error);
                                return { cityID, cityName: null };
                            }
                        });
                        
                        Promise.all(cityNamePromises).then(cityNameResults => {
                            setCityNamesMap(prev => {
                                const updated = { ...prev };
                                cityNameResults.forEach(({ cityID, cityName }) => {
                                    if (cityName) {
                                        updated[cityID] = cityName;
                                    }
                                });
                                return updated;
                            });
                        });
                    }
                    return currentMap;
                });
            }
        };

        if (tourCities.length > 0) {
            fetchFlightsFromCities();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tourCities]);

    const toggleCity = (cityID) => {
        setExpandedCity(expandedCity === cityID ? null : cityID);
    };

    if (tourCities.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg p-5 border border-gray-200 space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Accommodation & Transportation
            </h3>

            {tourCities.map((city, index) => {
                const cityHotels = hotelsData[city.CityID] || [];
                const isLoadingHotels = loadingHotels[city.CityID];
                const isExpanded = expandedCity === city.CityID;

                // Get flights FROM this city (all flights departing from this city)
                const flightsFromCity = flightsData[`from-${city.CityID}`] || [];
                const flightsFromCityKey = `from-${city.CityID}`;
                const isLoadingFlightsFromCity = loadingFlights[flightsFromCityKey] || false;

                // Get flights TO this city (from previous city) - optional, for reference
                const flightsToCity = index > 0 
                    ? flightsData[`${tourCities[index - 1].CityID}-${city.CityID}`] || []
                    : [];
                const flightsToCityKey = index > 0 ? `${tourCities[index - 1].CityID}-${city.CityID}` : null;
                const isLoadingFlightsToCity = flightsToCityKey ? loadingFlights[flightsToCityKey] : false;

                return (
                    <div key={city.CityID} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* City Header */}
                        <div
                            className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 cursor-pointer hover:from-primary-100 hover:to-primary-200 transition"
                            onClick={() => toggleCity(city.CityID)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                                        {city.CityOrder}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900">{city.CityName}</h4>
                                        {city.StayDays > 0 && (
                                            <p className="text-sm text-gray-600">
                                                Stay: {city.StayDays} {city.StayDays === 1 ? 'day' : 'days'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    {cityHotels.length > 0 && (
                                        <span className="bg-white px-3 py-1 rounded-full">
                                            {cityHotels.length} {cityHotels.length === 1 ? 'hotel' : 'hotels'}
                                        </span>
                                    )}
                                    {flightsFromCity.length > 0 && (
                                        <span className="bg-white px-3 py-1 rounded-full">
                                            {flightsFromCity.length} {flightsFromCity.length === 1 ? 'flight' : 'flights'}
                                        </span>
                                    )}
                                    <svg
                                        className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="p-5 space-y-6 bg-gray-50">
                                {/* Flights FROM this city (all flights departing from this city) */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <PaperAirplaneIcon className="w-5 h-5 text-primary-600" />
                                        <h5 className="text-base font-semibold text-gray-900">
                                            Flights from {city.CityName}
                                        </h5>
                                    </div>
                                    {isLoadingFlightsFromCity ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                            <p className="text-gray-500 mt-2">Loading flights...</p>
                                        </div>
                                    ) : flightsFromCity.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {flightsFromCity.map((flight) => {
                                                // Map city IDs to city names
                                                const normalizedFlight = {
                                                    ...flight,
                                                    fromCityName: cityNamesMap[flight.fromCityID] || flight.fromCityName || "—",
                                                    toCityName: cityNamesMap[flight.toCityID] || flight.toCityName || "—",
                                                    imageURL: flight.imageURL || flight.imageUrl || flight.ImageURL || flight.ImageUrl
                                                };
                                                return (
                                                    <FlightCard key={flight.flightID} item={normalizedFlight} />
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4 bg-white rounded-lg border border-gray-200">
                                            No flights available from this city.
                                        </p>
                                    )}
                                </div>

                                {/* Hotels in this city */}
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <BuildingOfficeIcon className="w-5 h-5 text-primary-600" />
                                        <h5 className="text-base font-semibold text-gray-900">
                                            Hotels in {city.CityName}
                                        </h5>
                                    </div>
                                    {isLoadingHotels ? (
                                        <div className="text-center py-8">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                                            <p className="text-gray-500 mt-2">Loading hotels...</p>
                                        </div>
                                    ) : cityHotels.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {cityHotels.slice(0, 6).map((hotel) => {
                                                // Normalize hotel data format for HotelCard component
                                                const normalizedHotel = {
                                                    hotelID: hotel.hotelID || hotel.HotelID,
                                                    hotelName: hotel.hotelName || hotel.HotelName || hotel.name || hotel.Name,
                                                    rating: hotel.rating || hotel.Rating || 0,
                                                    priceMin: hotel.priceMin || hotel.PriceMin || hotel.price || hotel.Price || 0,
                                                    imageUrl: hotel.imageUrl || hotel.ImageUrl || hotel.mainImage || hotel.MainImage,
                                                    images: hotel.images || hotel.Images || []
                                                };
                                                return (
                                                    <HotelCard 
                                                        key={normalizedHotel.hotelID} 
                                                        hotel={normalizedHotel} 
                                                    />
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-4 bg-white rounded-lg border border-gray-200">
                                            No hotels available in this city.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

