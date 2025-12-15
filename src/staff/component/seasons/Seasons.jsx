import React, { useState, useEffect } from "react";
import {
  searchSeasons,
  createSeason,
  updateSeason,
  deleteSeason,
} from "../../../services/staff/seasonStaffService";

import SeasonFormModal from "./SeasonFormModal";

export default function Seasons() {
  const [seasons, setSeasons] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [toast, setToast] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // =============================
  // LOAD DATA FROM BACKEND
  // =============================
  const loadData = async () => {
    try {
      const res = await searchSeasons({
        page: currentPage - 1,
        size: pageSize,
        keyword: search.trim() || undefined,
      });

      const items =
        res.items?.map((i) => ({
          SeasonID: i.seasonID,
          SeasonCode: i.seasonCode,
          SeasonName: i.seasonName,
          StartMonth: i.startMonth,
          EndMonth: i.endMonth,
          Description: i.description,
          Status: i.status,
        })) ?? [];

      setSeasons(items);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to load seasons");
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, search]);

  // FILTER + PAGINATION
  const filtered = seasons.filter((s) =>
    (s.SeasonCode + s.SeasonName + s.Description)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = filtered.slice(startIndex, endIndex);

  // RESET PAGE WHEN FILTER CHANGES
  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  // ADD
  const handleAdd = () => {
    setEditingItem(null);
    setModalOpen(true);
  };

  // EDIT
  const handleEdit = (season) => {
    setEditingItem(season);
    setModalOpen(true);
  };

  // DELETE
  const confirmDelete = async () => {
    try {
      await deleteSeason(deleteItem.SeasonID);
      setToast({ message: "Season deleted successfully", type: "error" });
      setDeleteItem(null);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.error || "Delete failed");
    }
  };

  // SAVE (ADD/EDIT)
  const handleSave = async (data) => {
    try {
      const payload = {
        seasonCode: data.SeasonCode,
        seasonName: data.SeasonName,
        startMonth: data.StartMonth,
        endMonth: data.EndMonth,
        description: data.Description,
        status: data.Status,
      };

      if (editingItem) {
        await updateSeason(editingItem.SeasonID, {
          seasonName: payload.seasonName,
          startMonth: payload.startMonth,
          endMonth: payload.endMonth,
          description: payload.description,
          status: payload.status,
        });

        setToast({ message: "Season updated successfully", type: "success" });
      } else {
        await createSeason(payload);
        setToast({ message: "Season added successfully", type: "success" });
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.error || "Save failed");
    }
  };

  // AUTO HIDE TOAST
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="w-full">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Seasons</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage seasonal periods and pricing</p>
        </div>

        <button
          onClick={handleAdd}
          className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all"
        >
          + Add New Season
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search seasons..."
          className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-primary-50 border-b border-primary-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Code</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Name</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Start</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">End</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Description</th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-neutral-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((s) => (
              <tr key={s.SeasonID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                <td className="px-4 py-3 text-neutral-900 font-medium">{s.SeasonCode}</td>
                <td className="px-4 py-3 text-neutral-700">{s.SeasonName}</td>
                <td className="px-4 py-3 text-neutral-700">{s.StartMonth}</td>
                <td className="px-4 py-3 text-neutral-700">{s.EndMonth}</td>
                <td className="px-4 py-3 text-neutral-600">{s.Description || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      s.Status === 1
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.Status === 1 ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2 text-center">
                  <button
                    onClick={() => handleEdit(s)}
                    className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 shadow-sm transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => setDeleteItem(s)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 shadow-sm transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td colSpan="7" className="py-6 text-center">
                  No seasons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-neutral-600 font-medium">
          Showing {totalItems === 0 ? 0 : startIndex + 1}–
          {Math.min(endIndex, totalItems)} of {totalItems} seasons
        </p>

        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border border-neutral-200 bg-white px-3 py-1.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

      {/* MODAL ADD / EDIT */}
      <SeasonFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initial={editingItem}
        list={seasons}
      />

      {/* MODAL DELETE */}
      {deleteItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl border border-neutral-200">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">Delete Season</h3>

            <p className="text-sm text-neutral-600 mb-6">
              Are you sure you want to delete{" "}
              <b className="text-neutral-900">{deleteItem.SeasonName}</b>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteItem(null)}
                className="px-4 py-2 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-200 transition font-medium"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999]">
          <div
            className={`px-6 py-3 rounded-xl text-white shadow-lg ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

    </div>
  );
}
