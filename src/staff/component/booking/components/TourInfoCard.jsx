import React from "react";

const toAbsoluteUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  return `${baseUrl}${url}`;
};

export default function TourInfoCard({ tour, tourDetails, selectedDetail, onSelectDetail, loadingTour, availableSeats }) {
  const tourCities = tourDetails?.tourCities || [];

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-sm p-5">
      <h3 className="font-bold text-neutral-900 mb-4 border-b border-primary-200 pb-2">
        1. Tour Information
      </h3>

      {loadingTour ? (
        <div className="text-center py-4 text-neutral-500">Loading tour details...</div>
      ) : (
        <>
          <div className="flex gap-3 mb-4">
            <img
              src={toAbsoluteUrl(tour.tourImg) || "https://via.placeholder.com/80"}
              alt={tour.tourName}
              className="w-20 h-20 object-cover rounded-lg border border-neutral-200"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/80";
              }}
            />
            <div className="text-sm flex-1">
              <div className="font-bold text-neutral-900">{tour.tourName}</div>
              <div className="text-xs text-neutral-600 mt-1">
                Tour Code: {tour.tourCode}
              </div>
              <div className="text-xs text-neutral-600">
                Starting Location: {tour.startingLocation}
              </div>
              <div className="text-xs text-neutral-600">
                Duration: {tour.duration}
              </div>
            </div>
          </div>

          {/* Tour Route - Cities */}
          {tourCities.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-900 mb-2">Tour Route:</p>
              <div className="flex flex-wrap gap-2">
                {tourCities
                  .sort((a, b) => (a.cityOrder || 0) - (b.cityOrder || 0))
                  .map((city, index) => (
                    <div key={city.cityID || index} className="flex items-center gap-1">
                      <span className="text-xs text-blue-700 font-medium">
                        {city.cityName}
                      </span>
                      {city.stayDays > 0 && (
                        <span className="text-xs text-blue-600">
                          ({city.stayDays} {city.stayDays === 1 ? "night" : "nights"})
                        </span>
                      )}
                      {index < tourCities.length - 1 && (
                        <span className="text-blue-500 mx-1">→</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <label className="text-sm font-medium text-neutral-700">
            Select Departure Date *
          </label>
          <select
            className="border border-neutral-200 px-3 py-2 rounded-lg w-full mt-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition bg-white"
            value={selectedDetail?.tourDetailID || ""}
            onChange={(e) => {
              const detailId = Number(e.target.value);
              const d = tourDetails?.details?.find(
                (x) => x.tourDetailID === detailId
              );
              onSelectDetail(d || null);
            }}
            disabled={loadingTour}
          >
            <option value="">-- Select date --</option>
            {tourDetails?.details?.map((d) => (
              <option key={d.tourDetailID} value={d.tourDetailID}>
                {new Date(d.departureDate).toLocaleDateString()} – $
                {parseFloat(d.unitPrice || 0).toLocaleString()}
              </option>
            ))}
          </select>

          {selectedDetail && (
            <div className="mt-3 bg-primary-50 border border-primary-200 rounded-lg p-3 text-xs space-y-1">
              <p className="text-neutral-700">
                <b className="text-neutral-900">Departure Date:</b>{" "}
                {new Date(selectedDetail.departureDate).toLocaleDateString()}
              </p>
              <p className="text-neutral-700">
                <b className="text-neutral-900">Seats:</b> {selectedDetail.bookedSeat || 0}/
                {selectedDetail.numberOfGuests || 0} –{" "}
                <span className="text-primary-600 font-bold">
                  {availableSeats} available
                </span>
              </p>
              <p className="text-neutral-700">
                <b className="text-neutral-900">Adult Price:</b> $
                {parseFloat(selectedDetail.unitPrice || 0).toLocaleString()}
              </p>
              <p className="text-neutral-700">
                <b className="text-neutral-900">Child:</b> 70% of adult price /{" "}
                <b className="text-neutral-900">Infant:</b> 30%
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

