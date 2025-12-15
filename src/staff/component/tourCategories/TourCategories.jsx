import React, { useState, useEffect } from "react";
import CategoryFormModal from "./CategoryFormModal";
import {
  searchTourCategories,
  createTourCategory,
  updateTourCategory,
  deleteTourCategory,
} from "../../../services/staff/tourCategoryStaffService";

export default function TourCategories() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // ============================
  // FETCH FROM BACKEND
  // ============================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await searchTourCategories({
        page: currentPage - 1, // backend is 0-based
        size: pageSize,
        keyword: search.trim() || undefined,
      });

      const items =
        res.items?.map((i) => ({
          CategoryID: i.categoryID,
          CategoryCode: i.categoryCode,
          CategoryName: i.categoryName,
          Description: i.description,
          Status: i.status,
        })) ?? [];

      setCategories(items);
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
  }, [search, pageSize]);

  useEffect(() => {
    loadData();
  }, [search, pageSize, currentPage]);

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

  const handleEdit = (cat) => {
    setEditingItem(cat);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    deleteTourCategory(id)
      .then(() => loadData())
      .catch((err) => alert(err?.response?.data?.error || err.message || "Delete failed"));
  };

  const handleSave = async (data) => {
    try {
      setLoading(true);
      setError("");
      const payload = {
        categoryCode: data.CategoryCode,
        categoryName: data.CategoryName,
        description: data.Description,
        status: data.Status,
      };

      if (editingItem) {
        await updateTourCategory(editingItem.CategoryID, {
          categoryName: payload.categoryName,
          description: payload.description,
          status: payload.status,
        });
      } else {
        await createTourCategory(payload);
      }
      setModalOpen(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || err.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // UI RENDER
  // ============================
  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Tour Categories</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage tour categories and descriptions</p>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all"
        >
          + Add New Category
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search categories..."
          className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Description</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-neutral-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-neutral-500">Loading...</td>
              </tr>
            )}
            {!loading && categories.map((cat) => (
              <tr key={cat.CategoryID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                <td className="px-4 py-3 text-neutral-900 font-medium">{cat.CategoryCode}</td>
                <td className="px-4 py-3 text-neutral-700">{cat.CategoryName}</td>
                <td className="px-4 py-3 text-neutral-600">{cat.Description || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cat.Status === 1 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {cat.Status === 1 ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-3 space-x-2 text-center">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 shadow-sm transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(cat.CategoryID)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 shadow-sm transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {!loading && categories.length === 0 && (
              <tr>
                <td colSpan="5" className="py-6 text-center">
                  No categories found.
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
            ? "No categories"
            : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
              currentPage * pageSize,
              totalItems
            )} of ${totalItems} categories`}
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
            className={`px-3 py-1.5 rounded-lg border transition ${
              currentPage <= 1
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
                className={`px-3 py-1.5 rounded-lg border transition ${
                  currentPage === i + 1
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
            className={`px-3 py-1.5 rounded-lg border transition ${
              currentPage >= totalPages
                ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed"
                : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initial={editingItem}
        list={categories}
      />
    </div>
  );
}
