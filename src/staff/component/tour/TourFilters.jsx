import React from "react";

export default function TourFilters({
  search,
  statusFilter,
  categoryFilter,
  categories,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onClear,
}) {
  return (
    <div className="grid md:grid-cols-3 gap-3 mb-4">
      <input
        className="border border-neutral-200 bg-white px-4 py-2.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
        placeholder="Search by code or name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select
        className="border border-neutral-200 bg-white px-3 py-2.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">All status</option>
        <option value="1">Active</option>
        <option value="0">Inactive</option>
      </select>

      <div className="flex gap-2">
        <select
          className="border border-neutral-200 bg-white px-3 py-2.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none w-full"
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.categoryID} value={c.categoryID}>
              {c.categoryName}
            </option>
          ))}
        </select>
        <button
          onClick={onClear}
          className="px-3 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 hover:bg-neutral-50"
        >
          Clear
        </button>
      </div>
    </div>
  );
}




