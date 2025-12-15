import React from "react";
import { getAllCities } from "../../../services/staff/cityStaffService";

export default function TourCitiesSection({
  tourID,
  cities,
  tourCities,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [availableCities, setAvailableCities] = React.useState([]);
  const [selectedCityID, setSelectedCityID] = React.useState("");
  const [cityOrder, setCityOrder] = React.useState(1);
  const [stayDays, setStayDays] = React.useState(1);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);

  React.useEffect(() => {
    getAllCities().then(setAvailableCities).catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest(".city-search-container")) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  // Filter cities that are not already added and match search query
  const filteredCities = React.useMemo(() => {
    const notAdded = availableCities.filter(
      (c) => !tourCities.some((tc) => tc.cityID === c.cityID)
    );
    if (!searchQuery.trim()) return notAdded;
    const query = searchQuery.toLowerCase();
    return notAdded.filter(
      (c) =>
        c.cityName?.toLowerCase().includes(query) ||
        c.cityCode?.toLowerCase().includes(query) ||
        c.country?.toLowerCase().includes(query)
    );
  }, [availableCities, tourCities, searchQuery]);

  const handleAdd = () => {
    if (!selectedCityID) {
      alert("Please select a city");
      return;
    }
    if (tourCities.some((tc) => tc.cityID === Number(selectedCityID))) {
      alert("City already added");
      return;
    }
    onAdd({
      tourID,
      cityID: Number(selectedCityID),
      cityOrder: tourCities.length + 1,
      stayDays: 1,
    });
    setSelectedCityID("");
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleCitySelect = (cityID) => {
    setSelectedCityID(cityID);
    const city = availableCities.find((c) => c.cityID === cityID);
    if (city) {
      setSearchQuery(city.cityName || "");
    }
    setShowDropdown(false);
  };

  const sortedCities = [...tourCities].sort((a, b) => a.cityOrder - b.cityOrder);

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <p className="font-semibold text-neutral-800 mb-3">Route Cities</p>
      <div className="space-y-3">
        {/* Add new city with search */}
        <div className="flex gap-2">
          <div className="flex-1 relative city-search-container">
            <input
              type="text"
              className="w-full border border-neutral-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
              placeholder="Search city by name, code, or country..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                if (!e.target.value) {
                  setSelectedCityID("");
                }
              }}
              onFocus={() => setShowDropdown(true)}
            />
            {showDropdown && filteredCities.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredCities.slice(0, 20).map((c) => (
                  <button
                    key={c.cityID}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-primary-50 text-sm border-b border-neutral-100 last:border-b-0"
                    onClick={() => handleCitySelect(c.cityID)}
                  >
                    <div className="font-medium">{c.cityName}</div>
                    <div className="text-xs text-neutral-500">
                      {c.cityCode} {c.country ? `• ${c.country}` : ""}
                    </div>
                  </button>
                ))}
                {filteredCities.length > 20 && (
                  <div className="px-3 py-2 text-xs text-neutral-500 text-center border-t border-neutral-200">
                    Showing first 20 of {filteredCities.length} results. Refine your search.
                  </div>
                )}
              </div>
            )}
            {showDropdown && searchQuery && filteredCities.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg px-3 py-2 text-sm text-neutral-500">
                No cities found matching "{searchQuery}"
              </div>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={!selectedCityID}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed text-sm font-medium"
          >
            Add
          </button>
        </div>
        {selectedCityID && (
          <div className="text-xs text-neutral-600 px-2">
            Selected:{" "}
            {availableCities.find((c) => c.cityID === Number(selectedCityID))
              ?.cityName || ""}
          </div>
        )}

        {/* List of cities */}
        {sortedCities.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">
            No cities added yet
          </p>
        ) : (
          <div className="space-y-2">
            {sortedCities.map((tc, idx) => (
              <div
                key={`${tc.tourID}-${tc.cityID}`}
                className="flex items-center gap-2 p-2 border border-neutral-200 rounded-lg"
              >
                <span className="text-xs font-medium text-neutral-600 w-8">
                  #{tc.cityOrder}
                </span>
                <span className="flex-1 text-sm font-medium">
                  {tc.cityName || `City ${tc.cityID}`}
                </span>
                <input
                  type="number"
                  min="1"
                  className="w-20 border border-neutral-200 px-2 py-1 rounded text-sm"
                  value={tc.stayDays}
                  onChange={(e) => {
                    const newStayDays = Number(e.target.value);
                    if (newStayDays > 0) {
                      onUpdate(tc.tourID, tc.cityID, {
                        cityOrder: tc.cityOrder,
                        stayDays: newStayDays,
                      });
                    }
                  }}
                />
                <span className="text-xs text-neutral-500">days</span>
                <button
                  onClick={() => onDelete(tc.tourID, tc.cityID)}
                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

