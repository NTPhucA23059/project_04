// src/staff/component/carTypes/CarTypesHeader.jsx
import React from "react";

export default function CarTypesHeader({ search, setSearch, onAddNew }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Car Types Management</h2>
        <p className="text-sm text-neutral-600 mt-1">Manage car types and classifications</p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search by code or name..."
          className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={onAddNew}
          className="whitespace-nowrap rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all"
        >
          + Add Car Type
        </button>
      </div>
    </div>
  );
}
 