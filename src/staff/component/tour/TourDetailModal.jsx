import React from "react";

export default function TourDetailModal({
  open,
  tour,
  tourCities = [],
  tourDetails = [],
  toAbsoluteUrl,
  onClose,
}) {
  if (!open || !tour) return null;

  // Use data loaded from dedicated APIs; only fallback if tourDetails prop was not provided
  const routeCities = tourCities || [];
  // If tourDetails prop is provided (even if empty array), use it; otherwise fallback to embedded data
  const departures =
    tourDetails !== undefined
      ? tourDetails
      : tour.details || (tour.detail ? [tour.detail] : []) || [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white p-6 rounded-xl max-w-3xl w-full shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Tour Overview - {tour.tourCode}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-700 hover:text-neutral-900"
          >
            ✖
          </button>
        </div>

        {/* Frame info */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="font-semibold">Name:</span> {tour.tourName}
          </div>
          <div>
            <span className="font-semibold">Code:</span> {tour.tourCode}
          </div>
          <div>
            <span className="font-semibold">Category:</span>{" "}
            {tour.categoryName ||
              tour.category?.categoryName ||
              tour.categoryID ||
              "-"}
          </div>
          <div>
            <span className="font-semibold">Status:</span>{" "}
            {tour.status === 1 ? "Active" : "Inactive"}
          </div>
          <div>
            <span className="font-semibold">Nation:</span> {tour.nation || "-"}
          </div>
          <div>
            <span className="font-semibold">Duration:</span>{" "}
            {tour.duration || "-"}
          </div>
          <div>
            <span className="font-semibold">Starting from:</span>{" "}
            {tour.startingLocation || "-"}
          </div>
          <div>
            <span className="font-semibold">Route cities:</span>{" "}
            {routeCities.length}
          </div>
          <div>
            <span className="font-semibold">Total departures:</span>{" "}
            {departures.length}
          </div>
        </div>

        {/* Route cities (TourCities) */}
        {routeCities.length > 0 && (
          <div className="mt-2">
            <p className="font-semibold mb-2 text-sm">Route cities</p>
            <ol className="list-decimal list-inside text-sm space-y-1">
              {routeCities
                .slice()
                .sort((a, b) => a.cityOrder - b.cityOrder)
                .map((c) => (
                  <li key={`${c.tourID}-${c.cityID}`}>
                    <span className="font-medium">
                      {c.cityName || `City ${c.cityID}`}
                    </span>{" "}
                    <span className="text-xs text-neutral-600">
                      (Order {c.cityOrder}, {c.stayDays} day
                      {c.stayDays > 1 ? "s" : ""})
                    </span>
                  </li>
                ))}
            </ol>
          </div>
        )}

        {/* Departures list (TourDetails) */}
        {departures.length > 0 && (
          <div className="mt-3">
            <p className="font-semibold mb-2 text-sm">Departures</p>
            <table className="w-full text-xs border border-neutral-200 rounded-lg overflow-hidden">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-2 py-1 text-left">Departure</th>
                  <th className="px-2 py-1 text-left">Arrival</th>
                  <th className="px-2 py-1 text-right">Unit price</th>
                  <th className="px-2 py-1 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {departures.map((d) => (
                  <tr key={d.tourDetailID} className="border-t border-neutral-100">
                    <td className="px-2 py-1">
                      {d.departureDate
                        ? d.departureDate.substring(0, 10)
                        : "-"}
                    </td>
                    <td className="px-2 py-1">
                      {d.arrivalDate ? d.arrivalDate.substring(0, 10) : "-"}
                    </td>
                    <td className="px-2 py-1 text-right">
                      {d.unitPrice != null ? d.unitPrice : "-"}
                    </td>
                    <td className="px-2 py-1 text-center">
                      {d.status === 1 ? "Active" : "Inactive"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Images */}
        {(tour.tourImg || (tour.images || []).length > 0) && (
          <div className="mt-4 space-y-2">
            <p className="font-semibold mb-2 text-sm">Images</p>
            {tour.tourImg && (
              <div>
                <p className="text-xs text-neutral-500 mb-1">Main image</p>
                <img
                  src={toAbsoluteUrl(tour.tourImg)}
                  className="h-32 w-full object-cover rounded border"
                />
              </div>
            )}
            {(tour.images || []).length > 0 && (
              <div>
                <p className="text-xs text-neutral-500 mb-1">Gallery</p>
                <div className="grid grid-cols-4 gap-3">
                  {(tour.images || []).map((img, i) => (
                    <img
                      key={i}
                      src={toAbsoluteUrl(img.imageUrl || img)}
                      className="h-24 w-full object-cover rounded border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hint about next steps */}
        <div className="mt-4 bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-3 text-xs text-neutral-700">
          This screen shows the <strong>tour frame</strong> and a summary of
          departures. To configure the detailed daily itinerary for a specific
          departure, use the <strong>Tour Details</strong> and{" "}
          <strong>Tour Schedules</strong> management screens.
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


