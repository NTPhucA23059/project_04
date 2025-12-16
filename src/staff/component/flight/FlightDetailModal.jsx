import React from "react";

export default function FlightDetailModal({
  open,
  flight,
  renderCityName,
  formatDateTime,
  onClose,
}) {
  if (!open || !flight) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl max-w-3xl w-full shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">
            Flight Detail - {flight.flightCode}
          </h3>
          <button
            onClick={onClose}
            className="text-neutral-700 hover:text-neutral-900"
          >
            ✖
          </button>
        </div>

        {flight.imageURL && (
          <div className="mb-4">
            <img
              src={flight.imageURL.startsWith('http') ? flight.imageURL : `${import.meta.env.VITE_API_BASE_URL || ''}${flight.imageURL}`}
              alt={flight.flightCode}
              className="w-full max-w-md h-48 object-cover rounded-lg border border-neutral-200"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-semibold">Code:</span> {flight.flightCode}
          </div>
          <div>
            <span className="font-semibold">Airline:</span> {flight.airline}
          </div>
          <div>
            <span className="font-semibold">Route:</span>{" "}
            {renderCityName(flight.fromCityID)} →{" "}
            {renderCityName(flight.toCityID)}
          </div>
          <div>
            <span className="font-semibold">Departure:</span>{" "}
            {formatDateTime(flight.departureTime)}
          </div>
          <div>
            <span className="font-semibold">Arrival:</span>{" "}
            {formatDateTime(flight.arrivalTime)}
          </div>
          <div>
            <span className="font-semibold">Duration:</span>{" "}
            {flight.durationMinutes != null
              ? `${flight.durationMinutes} minutes`
              : "-"}
          </div>
          <div>
            <span className="font-semibold">Price:</span>{" "}
            {flight.price != null ? `$${flight.price}` : "-"}
          </div>
          <div>
            <span className="font-semibold">Flight Type:</span>{" "}
            {flight.flightType || "-"}
          </div>
          <div>
            <span className="font-semibold">Status:</span>{" "}
            {flight.status === 1 ? "Active" : "Inactive"}
          </div>
          <div>
            <span className="font-semibold">Created:</span>{" "}
            {flight.createdAt
              ? new Date(flight.createdAt).toLocaleString()
              : "-"}
          </div>
        </div>

        {flight.scheduleInfo && (
          <div className="mt-3 text-sm">
            <span className="font-semibold">Schedule Info:</span>{" "}
            {flight.scheduleInfo}
          </div>
        )}

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




