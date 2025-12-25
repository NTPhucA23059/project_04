import React from "react";
import { getAllCities } from "../../../services/staff/cityStaffService";
import { toast } from "../../shared/toast/toast";

export default function TourCitiesSection({
  tourID,
  cities,
  tourCities,
  tourDuration = null,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [availableCities, setAvailableCities] = React.useState([]);
  const [numberOfCities, setNumberOfCities] = React.useState("");
  const [citySelections, setCitySelections] = React.useState([]);
  const [validationError, setValidationError] = React.useState("");

  React.useEffect(() => {
    getAllCities().then(setAvailableCities).catch(() => {});
  }, []);

  const handleNumberOfCitiesChange = (value) => {
    const num = value ? Number(value) : 0;
    if (num < 0) return;
    
    setNumberOfCities(value);
    setValidationError("");
    
    if (num > 0) {
      setCitySelections(Array.from({ length: num }, () => ({ cityID: "", stayDays: 1 })));
    } else {
      setCitySelections([]);
    }
  };

  const handleCitySelectionChange = (index, field, value) => {
    const updated = [...citySelections];
    updated[index] = {
      ...updated[index],
      [field]: field === "stayDays" ? Number(value) : value,
    };
    setCitySelections(updated);
    setValidationError("");
  };

  const validateBeforeAdd = () => {
    if (!tourDuration || tourDuration <= 0) {
      setValidationError("Tour duration is required. Please set tour days first.");
      return false;
    }

    const hasEmptyCity = citySelections.some((cs) => !cs.cityID);
    if (hasEmptyCity) {
      setValidationError("Please select all cities");
      return false;
    }

    const cityIDs = citySelections.map((cs) => cs.cityID).filter(Boolean);
    const uniqueCityIDs = new Set(cityIDs);
    if (cityIDs.length !== uniqueCityIDs.size) {
      setValidationError("Cities must be unique. Please remove duplicates.");
      return false;
    }

    const alreadyAdded = citySelections.some((cs) =>
      tourCities.some((tc) => tc.cityID === Number(cs.cityID))
    );
    if (alreadyAdded) {
      setValidationError("One or more cities are already added to this tour");
      return false;
    }

    if (citySelections.length > tourDuration) {
      setValidationError(
        `Number of cities (${citySelections.length}) cannot exceed tour duration (${tourDuration} days)`
      );
      return false;
    }

    const totalStayDays = citySelections.reduce((sum, cs) => sum + (cs.stayDays || 0), 0);
    if (totalStayDays > tourDuration) {
      setValidationError(
        `Total stay days (${totalStayDays}) cannot exceed tour duration (${tourDuration} days)`
      );
      return false;
    }

    const hasInvalidDays = citySelections.some((cs) => !cs.stayDays || cs.stayDays < 1);
    if (hasInvalidDays) {
      setValidationError("Each city must have at least 1 day");
      return false;
    }

    return true;
  };

  const handleAddAll = () => {
    if (!validateBeforeAdd()) {
      return;
    }

    const nextOrder = tourCities.length + 1;
    citySelections.forEach((cs, index) => {
      onAdd({
        tourID,
        cityID: Number(cs.cityID),
        cityOrder: nextOrder + index,
        stayDays: cs.stayDays,
      });
    });

    setNumberOfCities("");
    setCitySelections([]);
    setValidationError("");
  };

  // Filter cities that are not already added
  const getAvailableCitiesForSelect = () => {
    return availableCities.filter(
      (c) => !tourCities.some((tc) => tc.cityID === c.cityID)
    );
  };

  const sortedCities = [...tourCities].sort((a, b) => a.cityOrder - b.cityOrder);
  const totalStayDaysInTour = sortedCities.reduce((sum, tc) => sum + (tc.stayDays || 0), 0);
  const remainingDays = tourDuration ? tourDuration - totalStayDaysInTour : null;

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <p className="font-semibold text-neutral-800 mb-3">Route Cities</p>
      
      {/* Tour duration info */}
      {tourDuration && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-800">
            <span className="font-medium">Tour Duration:</span> {tourDuration} days
            {remainingDays !== null && (
              <span className="ml-2">
                • <span className="font-medium">Remaining:</span> {remainingDays} days
              </span>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Input số tỉnh muốn đi */}
        <div>
          <label className="text-sm font-medium text-neutral-700 mb-1 block">
            Number of cities to add:
          </label>
          <input
            type="number"
            min="1"
            max={tourDuration || 30}
            className="w-32 border border-neutral-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
            value={numberOfCities}
            onChange={(e) => handleNumberOfCitiesChange(e.target.value)}
            placeholder="Enter number"
          />
          {tourDuration && (
            <p className="text-xs text-neutral-500 mt-1">
              Maximum: {tourDuration} cities (based on tour duration)
            </p>
          )}
        </div>

        {/* Danh sách select box cho từng thành phố */}
        {citySelections.length > 0 && (
          <div className="space-y-3 border border-neutral-200 rounded-lg p-3 bg-neutral-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-neutral-700">Select cities:</p>
              <button
                onClick={handleAddAll}
                className="px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
              >
                Add All
              </button>
            </div>

            {citySelections.map((selection, index) => (
              <div
                key={index}
                className="flex gap-2 items-center p-2 bg-white rounded-lg border border-neutral-200"
              >
                <span className="text-sm font-medium text-neutral-600 w-8">
                  #{index + 1}
                </span>
                <select
                  className="flex-1 border border-neutral-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  value={selection.cityID}
                  onChange={(e) =>
                    handleCitySelectionChange(index, "cityID", e.target.value)
                  }
                >
                  <option value="">-- Select City --</option>
                  {getAvailableCitiesForSelect().map((city) => (
                    <option key={city.cityID} value={city.cityID}>
                      {city.cityName} {city.cityCode ? `(${city.cityCode})` : ""}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max={tourDuration || 30}
                  className="w-20 border border-neutral-200 px-2 py-2 rounded text-sm"
                  value={selection.stayDays}
                  onChange={(e) =>
                    handleCitySelectionChange(index, "stayDays", e.target.value)
                  }
                  placeholder="Days"
                />
                <span className="text-xs text-neutral-500 w-10">days</span>
              </div>
            ))}

            {/* Validation error */}
            {validationError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600">{validationError}</p>
              </div>
            )}

            {/* Summary */}
            {citySelections.length > 0 && (
              <div className="p-2 bg-neutral-100 rounded-lg">
                <p className="text-xs text-neutral-600">
                  <span className="font-medium">Selected:</span> {citySelections.filter((cs) => cs.cityID).length} cities
                  {" • "}
                  <span className="font-medium">Total days:</span>{" "}
                  {citySelections.reduce((sum, cs) => sum + (cs.stayDays || 0), 0)} days
                  {tourDuration && (
                    <>
                      {" / "}
                      <span className={citySelections.reduce((sum, cs) => sum + (cs.stayDays || 0), 0) > tourDuration ? "text-red-600 font-medium" : ""}>
                        {tourDuration} days
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* List of already added cities */}
        {sortedCities.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4 border border-dashed border-neutral-200 rounded-lg">
            No cities added yet
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">Added cities:</p>
            {sortedCities.map((tc, idx) => (
              <div
                key={`${tc.tourID}-${tc.cityID}`}
                className="flex items-center gap-2 p-2 border border-neutral-200 rounded-lg bg-white"
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
                  max={tourDuration || 30}
                  className="w-20 border border-neutral-200 px-2 py-1 rounded text-sm"
                  value={tc.stayDays}
                  onChange={(e) => {
                    const newStayDays = Number(e.target.value);
                    if (newStayDays > 0) {
                      // Validate tổng không vượt quá tour duration
                      const otherCitiesTotal = sortedCities
                        .filter((c) => c.cityID !== tc.cityID)
                        .reduce((sum, c) => sum + (c.stayDays || 0), 0);
                      const newTotal = otherCitiesTotal + newStayDays;
                      
                      if (tourDuration && newTotal > tourDuration) {
                        toast.error(
                          `Total stay days (${newTotal}) cannot exceed tour duration (${tourDuration} days)`
                        );
                        return;
                      }
                      
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
            {/* Total days summary for added cities */}
            {tourDuration && (
              <div className="p-2 bg-neutral-100 rounded-lg">
                <p className="text-xs text-neutral-600">
                  <span className="font-medium">Total added:</span> {totalStayDaysInTour} days
                  {" / "}
                  <span className={totalStayDaysInTour > tourDuration ? "text-red-600 font-medium" : ""}>
                    {tourDuration} days
                  </span>
                  {remainingDays !== null && remainingDays >= 0 && (
                    <span className="ml-2 text-green-600">
                      ({remainingDays} days remaining)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
