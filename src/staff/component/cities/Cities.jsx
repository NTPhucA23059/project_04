import React, { useState, useEffect } from "react";
import CityFormModal from "./CityFormModal";
import {
  searchCities,
  createCity,
  updateCity,
  deleteCity,
} from "../../../services/staff/cityStaffService";
import { toast } from "../../shared/toast/toast";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Sorting
  const [sortField, setSortField] = useState(null); // 'CityCode', 'CityName', 'Country', 'Status'
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  // ============================
  // FETCH FROM BACKEND
  // ============================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await searchCities({
        page: currentPage - 1,
        size: pageSize,
        keyword: search.trim() || undefined,
      });

      // Map response data to component format
      const items = res.items?.map((x) => ({
        CityID: x.cityID,
        CityCode: x.cityCode,
        CityName: x.cityName,
        Country: x.country,
        Status: x.status,
        CreatedAt: x.createdAt,
        UpdatedAt: x.updatedAt,
      })) ?? [];

      setCities(items);
      setTotalItems(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // RESET PAGE WHEN SEARCH CHANGES
  // ============================
  useEffect(() => {
    setCurrentPage(1);
    // Reset sort when search changes
    setSortField(null);
    setSortDirection('asc');
  }, [search, pageSize]);

  useEffect(() => {
    loadData();
  }, [search, pageSize, currentPage, sortField, sortDirection]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // ============================
  // CRUD FUNCTIONS
  // ============================
  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  const handleEdit = (city) => {
    setEditingItem(city);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete City",
      message: "Are you sure you want to delete this city? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteCity(id);
          toast.success("City deleted successfully");
          loadData();
        } catch (err) {
          toast.error(err?.response?.data?.error || err.message || "Delete failed");
        }
      },
    });
  };

  const handleSave = async (data) => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        cityCode: data.CityCode,
        cityName: data.CityName,
        country: data.Country || "Viet Nam",
        status: data.Status,
      };

      if (editingItem) {
        const updatePayload = {
          cityName: payload.cityName,
          country: payload.country,
          status: payload.status,
        };
        await updateCity(editingItem.CityID, updatePayload);
        toast.success("City updated successfully");
      } else {
        await createCity(payload);
        toast.success("City created successfully");
      }

      setModalOpen(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.error || err?.response?.data?.message || err.message || "Save failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to asc
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Apply sorting to cities
  const sortedCities = React.useMemo(() => {
    if (!sortField) return cities;

    return [...cities].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle null/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';

      // Handle numbers (Status)
      if (sortField === 'Status') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else {
        // Handle strings
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });
  }, [cities, sortField, sortDirection]);

  // Pagination calculation - không cần slice vì backend đã phân trang
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageData = sortedCities; // Use sorted data


  // ============================
  // UI RENDER
  // ============================
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">City Management</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage cities and their information</p>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all"
        >
          + Add City
        </button>
      </div>

      {/* Search & Sort Controls */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search cities..."
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {sortField && (
          <button
            onClick={() => {
              setSortField(null);
              setSortDirection('asc');
            }}
            className="px-4 py-2.5 rounded-lg border border-neutral-200 bg-white text-sm text-neutral-700 hover:bg-neutral-50 transition flex items-center gap-2"
            title="Clear sort"
          >
            <span>Clear Sort</span>
            <span className="text-neutral-400">×</span>
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 border-b border-red-200 text-sm font-medium">
            {error}
          </div>
        )}
        <table className="min-w-full text-sm">
          <thead className="bg-primary-50 border-b border-primary-200">
            <tr>
              <th className="px-4 py-3 text-center font-semibold text-neutral-700 w-16">#</th>
              <th
                className="px-4 py-3 text-left font-semibold text-neutral-700 cursor-pointer hover:bg-primary-100 transition select-none"
                onClick={() => handleSort('CityCode')}
              >
                <div className="flex items-center gap-2">
                  <span>Code</span>
                  {sortField === 'CityCode' ? (
                    <span className="text-primary-600 font-bold">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-xs">↕</span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-neutral-700 cursor-pointer hover:bg-primary-100 transition select-none"
                onClick={() => handleSort('CityName')}
              >
                <div className="flex items-center gap-2">
                  <span>City Name</span>
                  {sortField === 'CityName' ? (
                    <span className="text-primary-600 font-bold">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-xs">↕</span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-neutral-700 cursor-pointer hover:bg-primary-100 transition select-none"
                onClick={() => handleSort('Country')}
              >
                <div className="flex items-center gap-2">
                  <span>Country</span>
                  {sortField === 'Country' ? (
                    <span className="text-primary-600 font-bold">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-xs">↕</span>
                  )}
                </div>
              </th>
              <th
                className="px-4 py-3 text-left font-semibold text-neutral-700 cursor-pointer hover:bg-primary-100 transition select-none"
                onClick={() => handleSort('Status')}
              >
                <div className="flex items-center gap-2">
                  <span>Status</span>
                  {sortField === 'Status' ? (
                    <span className="text-primary-600 font-bold">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-xs">↕</span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-center font-semibold text-neutral-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="7" className="py-8 text-center text-neutral-500">Loading...</td>
              </tr>
            )}
            {!loading && pageData.map((city, index) => (
              <tr key={city.CityID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                <td className="px-4 py-3 text-center text-neutral-500 font-medium">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-3 text-neutral-900 font-medium">{city.CityCode}</td>
                <td className="px-4 py-3 text-neutral-700 font-semibold">{city.CityName}</td>
                <td className="px-4 py-3 text-neutral-600">{city.Country || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${city.Status === 1
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                    {city.Status === 1 ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-3 space-x-2 text-center">
                  <button
                    onClick={() => handleEdit(city)}
                    className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 shadow-sm transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(city.CityID)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 shadow-sm transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!loading && pageData.length === 0 && (
              <tr>
                <td colSpan="7" className="py-6 text-center text-neutral-500">
                  No cities found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        {/* Showing */}
        <p className="text-sm text-neutral-600 font-medium">
          {totalItems === 0
            ? "No cities"
            : `Showing ${startIndex + 1}–${endIndex} of ${totalItems} cities`}
        </p>

        {/* Page size */}
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border border-neutral-200 bg-white px-3 py-1.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
        >
          <option value={5}>5 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>

        {/* Page buttons */}
        <div className="flex gap-2">
          {/* Previous */}
          <button
            onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`px-3 py-1.5 rounded-lg border transition ${currentPage <= 1
                ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
              }`}
          >
            Previous
          </button>

          {/* Page numbers */}
          {totalPages > 0 &&
            [...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1.5 rounded-lg border transition ${currentPage === i + 1
                    ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                    : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
                  }`}
              >
                {i + 1}
              </button>
            ))}

          {/* Next */}
          <button
            onClick={() =>
              currentPage < totalPages && setCurrentPage(currentPage + 1)
            }
            disabled={currentPage >= totalPages}
            className={`px-3 py-1.5 rounded-lg border transition ${currentPage >= totalPages
                ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
              }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      <CityFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSave}
        initial={editingItem}
        list={cities}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          if (confirmDialog.onConfirm) {
            confirmDialog.onConfirm();
          }
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
      />
    </div>
  );
}




