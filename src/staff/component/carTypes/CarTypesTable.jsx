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
  pageSize,
  onPageSizeChange,
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
      <div className="mt-4 flex justify-between items-center flex-wrap gap-4 text-sm">
        <p className="text-neutral-600 font-medium">
          Showing {total === 0 ? 0 : startIndex + 1}–{endIndex} of {total}
        </p>

        <div className="flex items-center gap-4">
          {/* Page size selector */}
          <select
            value={pageSize || 5}
            onChange={(e) => {
              if (onPageSizeChange) {
                onPageSizeChange(Number(e.target.value));
              }
            }}
            className="border border-neutral-200 bg-white px-3 py-1.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => onChangePage("prev")}
              className="px-3 py-1.5 border border-neutral-200 rounded-lg transition disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-300"
            >
              Prev
            </button>

            {/* Page numbers */}
            {totalPages > 0 && [...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 2) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    if (onChangePage) {
                      const dir = pageNum < page ? "prev" : pageNum > page ? "next" : null;
                      if (dir) {
                        let newPage = page;
                        while (newPage !== pageNum) {
                          newPage = dir === "prev" ? newPage - 1 : newPage + 1;
                        }
                        onChangePage(dir);
                      }
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    page === pageNum
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              disabled={page >= totalPages}
              onClick={() => onChangePage("next")}
              className="px-3 py-1.5 border border-neutral-200 rounded-lg transition disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed hover:bg-primary-50 hover:border-primary-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
