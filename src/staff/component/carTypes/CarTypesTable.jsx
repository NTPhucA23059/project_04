import CarTypesStatusBadge from "./CarTypesStatusBadge";

export default function CarTypesTable({
  data,
  onEdit,
  onDelete,
  page,
  totalPages,
  onChangePage,
  total,
  startIndex,
  endIndex,
}) {
  return (
    <>
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-primary-50 border-b border-primary-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Description</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-neutral-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) => (
              <tr key={item.carTypeID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                <td className="px-4 py-3 text-neutral-900 font-medium">{item.typeCode}</td>
                <td className="px-4 py-3 text-neutral-700">{item.typeName}</td>
                <td className="px-4 py-3 text-neutral-600">{item.description || "-"}</td>
                <td className="px-4 py-3">
                  <CarTypesStatusBadge status={item.status} />
                </td>

                <td className="px-4 py-3 text-center space-x-2">
                  <button
                    onClick={() => onEdit(item)}
                    className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-sm transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(item)}
                    className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-neutral-500">
                  No car types found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <p className="text-neutral-600 font-medium">
          Showing {total === 0 ? 0 : startIndex + 1}–{endIndex} of {total}
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onChangePage("prev")}
            className="px-3 py-1.5 border border-neutral-200 rounded-lg transition disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-300"
          >
            Prev
          </button>

          <span className="px-3 py-1.5 text-neutral-700 font-medium">
            Page {page} / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => onChangePage("next")}
            className="px-3 py-1.5 border border-neutral-200 rounded-lg transition disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-300"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
