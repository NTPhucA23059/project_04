import React from "react";

export default function FlightTable({
  flights,
  loading,
  saving,
  renderCityName,
  formatDateTime,
  onEdit,
  onView,
  onDelete,
}) {
  const hasData = flights && flights.length > 0;

  return (
    <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-primary-50 border-b border-primary-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Code
            </th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Airline
            </th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Route
            </th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Departure
            </th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Arrival
            </th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Price
            </th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Status
            </th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td
                colSpan="8"
                className="px-4 py-8 text-center text-neutral-500"
              >
                Loading...
              </td>
            </tr>
          )}
          {!loading && !hasData && (
            <tr>
              <td
                colSpan="8"
                className="px-4 py-8 text-center text-neutral-500"
              >
                No flights found
              </td>
            </tr>
          )}
          {!loading &&
            hasData &&
            flights.map((f) => (
              <tr
                key={f.flightID}
                className="border-b border-neutral-100 hover:bg-primary-50/30 transition"
              >
                <td className="px-4 py-2 font-medium">{f.flightCode}</td>
                <td className="px-4 py-2">{f.airline}</td>
                <td className="px-4 py-2">
                  {renderCityName(f.fromCityID)} →{" "}
                  {renderCityName(f.toCityID)}
                </td>
                <td className="px-4 py-2">
                  {formatDateTime(f.departureTime)}
                </td>
                <td className="px-4 py-2">
                  {formatDateTime(f.arrivalTime)}
                </td>
                <td className="px-4 py-2">
                  {f.price != null ? `$${f.price}` : "-"}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      f.status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {f.status === 1 ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(f)}
                      className="bg-primary-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-primary-700 shadow-sm transition font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onView(f)}
                      className="bg-accent-500 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-accent-600 shadow-sm transition font-medium"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onDelete(f)}
                      disabled={saving}
                      className="bg-red-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-red-700 shadow-sm transition font-medium disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}


