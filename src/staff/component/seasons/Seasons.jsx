import React, { useState, useEffect } from "react";
import {
  searchSeasons,
  createSeason,
  updateSeason,
  deleteSeason,
} from "../../../services/staff/seasonStaffService";
import { toast } from "../../shared/toast/toast";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";
import SeasonFormModal from "./SeasonFormModal";

export default function Seasons() {
  const [seasons, setSeasons] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, "1" (Active), "0" (Inactive)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, season: null, error: null, deleting: false });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // =============================
  // LOAD DATA FROM BACKEND
  // =============================
  const loadData = async () => {
    try {
      const res = await searchSeasons({
        page: currentPage - 1,
        size: pageSize,
        keyword: search.trim() || undefined,
        status: statusFilter !== "ALL" ? Number(statusFilter) : undefined,
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
      setTotalItems(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || "Failed to load seasons");
    }
  };

  // =============================
  // LOAD STATISTICS
  // =============================
  const loadStats = async () => {
    try {
      // Load all seasons to calculate stats
      const res = await searchSeasons({
        page: 0,
        size: 1000, // Get all for stats
        keyword: undefined,
        status: undefined,
      });

      const allItems = res.items || [];
      const total = allItems.length;
      const active = allItems.filter((item) => item.status === 1).length;
      const inactive = total - active;

      setStats({
        total,
        active,
        inactive,
      });
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, search, statusFilter]);

  // RESET PAGE WHEN FILTER CHANGES
  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize, statusFilter]);

  useEffect(() => {
    loadStats();
  }, []);

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
  const handleDelete = (season) => {
    setDeleteConfirm({ isOpen: true, season: season, error: null, deleting: false });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.season || deleteConfirm.deleting) return;

    try {
      setDeleteConfirm(prev => ({ ...prev, deleting: true, error: null }));
      await deleteSeason(deleteConfirm.season.SeasonID);
      toast.success("Season deleted successfully");
      setDeleteConfirm({ isOpen: false, season: null, error: null, deleting: false });
      loadData();
      loadStats();
    } catch (err) {
      // Get error message from response
      let backendMsg = "";
      
      if (err?.response?.data?.message) {
        backendMsg = err.response.data.message;
      } else if (err?.response?.data?.error) {
        backendMsg = err.response.data.error;
      } else if (err?.message) {
        backendMsg = err.message;
      }

      // Convert technical message to user-friendly message
      let userFriendlyMsg = "";
      
      // Check if it's a constraint error (season is being used)
      if (backendMsg.toLowerCase().includes("tour") && 
          (backendMsg.toLowerCase().includes("using") || backendMsg.toLowerCase().includes("cannot delete") || backendMsg.toLowerCase().includes("departure"))) {
        // Extract number of tour details if available
        const countMatch = backendMsg.match(/\d+/);
        const count = countMatch ? countMatch[0] : "some";
        
        userFriendlyMsg = `This season is currently being used by ${count} tour departure(s). You cannot delete it until you remove or change the season for those departures first.`;
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "This season no longer exists. Please refresh the page.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to delete this season. Please try again later or contact support if the problem persists.";
      } else {
        userFriendlyMsg = "Unable to delete this season. Please check your connection and try again.";
      }

      // Show error in dialog and toast
      setDeleteConfirm(prev => ({ ...prev, error: userFriendlyMsg, deleting: false }));
      toast.error(userFriendlyMsg);
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
        toast.success("Season updated successfully");
      } else {
        await createSeason(payload);
        toast.success("Season added successfully");
      }

      setModalOpen(false);
      loadData();
      loadStats();
      loadStats();
    } catch (err) {
      // Get backend message
      let backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "";
      
      // Convert to user-friendly message
      let userFriendlyMsg = "";
      
      if (backendMsg.toLowerCase().includes("already exists") || backendMsg.toLowerCase().includes("duplicate")) {
        if (backendMsg.toLowerCase().includes("code")) {
          userFriendlyMsg = "This season code is already in use. Please choose a different code.";
        } else if (backendMsg.toLowerCase().includes("name")) {
          userFriendlyMsg = "This season name is already in use. Please choose a different name.";
        } else {
          userFriendlyMsg = "This season already exists. Please check the code and name.";
        }
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "Season not found. Please refresh the page and try again.";
      } else if (backendMsg.toLowerCase().includes("month") || backendMsg.toLowerCase().includes("greater")) {
        userFriendlyMsg = "Start month cannot be greater than end month. Please check your input.";
      } else if (backendMsg.toLowerCase().includes("validation") || backendMsg.toLowerCase().includes("required")) {
        userFriendlyMsg = "Please fill in all required fields correctly.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to save season. Please check your input and try again.";
      } else {
        userFriendlyMsg = "Unable to save season. Please check your connection and try again.";
      }

      toast.error(userFriendlyMsg);
    }
  };


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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Total Seasons</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Active Seasons</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Inactive Seasons</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Search seasons..."
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
        >
          <option value="ALL">All Status</option>
          <option value="1">Active</option>
          <option value="0">Inactive</option>
        </select>
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
            {seasons.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-6 text-center">
                  No seasons found.
                </td>
              </tr>
            ) : (
              seasons.map((s) => (
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
                    onClick={() => handleDelete(s)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 shadow-sm transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
        {/* Showing info */}
        <p className="text-sm text-neutral-600 font-medium">
          {totalItems === 0
            ? "No seasons"
            : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, totalItems)} of ${totalItems} seasons`}
        </p>

        <div className="flex items-center gap-4">
          {/* Page size selector */}
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

          {/* Page navigation */}
          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {totalPages > 0 && (() => {
                const pages = [];
                const maxVisible = 7;
                
                if (totalPages <= maxVisible) {
                  // Show all pages if total is small
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Always show first page
                  pages.push(1);
                  
                  if (currentPage <= 4) {
                    // Near the start: 1 2 3 4 5 ... last
                    for (let i = 2; i <= 5; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  } else if (currentPage >= totalPages - 3) {
                    // Near the end: 1 ... last-4 last-3 last-2 last-1 last
                    pages.push('...');
                    for (let i = totalPages - 4; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // In the middle: 1 ... current-1 current current+1 ... last
                    pages.push('...');
                    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                      pages.push(i);
                    }
                    pages.push('...');
                    pages.push(totalPages);
                  }
                }
                
                return pages.map((page, idx) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-2 text-neutral-400">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg border transition ${
                        currentPage === page
                          ? "bg-primary-600 text-white border-primary-600"
                          : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
                      }`}
                    >
                      {page}
                    </button>
                  );
                });
              })()}
              
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL ADD / EDIT */}
      <SeasonFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initial={editingItem}
        list={seasons}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all border border-gray-200/50">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-red-100 rounded-full p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Delete Season
                  </h3>
                  {deleteConfirm.error ? (
                    <div className="space-y-3">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-amber-900 mb-2">
                              Cannot Delete This Season
                            </p>
                            <p className="text-sm text-amber-800 leading-relaxed">
                              {deleteConfirm.error}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-blue-900 mb-1">What to do next:</p>
                        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                          <li>Go to the Tours management page</li>
                          <li>Find the tour departures using this season</li>
                          <li>Update their season to a different one</li>
                          <li>Then come back here to delete this season</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {deleteConfirm.season
                        ? `Are you sure you want to delete season "${deleteConfirm.season.SeasonName}"? This action cannot be undone.`
                        : "Are you sure you want to delete this season?"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, season: null, error: null, deleting: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
              >
                {deleteConfirm.error ? "Close" : "Cancel"}
              </button>
              {!deleteConfirm.error && (
                <button
                  onClick={confirmDelete}
                  disabled={deleteConfirm.deleting}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition shadow-md ${
                    deleteConfirm.deleting
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {deleteConfirm.deleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
