import React from "react";

export default function TourTable({
  tours,
  loading,
  saving,
  onEdit,
  onView,
  onDelete,
}) {
  const hasData = tours && tours.length > 0;

  return (
    <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-primary-50 border-b border-primary-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Code
            </th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Name
            </th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Category
            </th>
            <th className="px-4 py-3 text-left font-semibold text-neutral-700">
              Departures
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
                colSpan="6"
                className="px-4 py-8 text-center text-neutral-500"
              >
                Loading...
              </td>
            </tr>
          )}

          {!loading && !hasData && (
            <tr>
              <td
                colSpan="6"
                className="px-4 py-8 text-center text-neutral-500"
              >
                No tours found
              </td>
            </tr>
          )}

          {!loading &&
            hasData &&
            tours.map((t) => (
              <tr
                key={t.tourID}
                className="border-b border-neutral-100 hover:bg-primary-50/30 transition"
              >
                <td className="px-4 py-2">{t.tourCode}</td>
                <td className="px-4 py-2">{t.tourName}</td>
                <td className="px-4 py-2">
                  {t.categoryName ||
                    t.category?.categoryName ||
                    t.categoryID ||
                    "-"}
                </td>
                <td className="px-4 py-2">
                  {t.details?.length ?? (t.detail ? 1 : 0)}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      t.status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {t.status === 1 ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-primary-700 shadow-sm transition font-medium"
                      onClick={() => onEdit(t)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-accent-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-accent-600 shadow-sm transition font-medium"
                      onClick={() => onView(t)}
                    >
                      View
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 shadow-sm transition font-medium disabled:opacity-60"
                      onClick={() => onDelete(t)}
                      disabled={saving}
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




