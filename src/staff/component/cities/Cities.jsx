import React, { useState, useEffect } from "react";
import CityFormModal from "./CityFormModal";
import {
  searchCities,
  createCity,
  updateCity,
  deleteCity,
} from "../../../services/staff/cityStaffService";
import { toast } from "../../shared/toast/toast";

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, "1" (Active), "0" (Inactive)

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, city: null, error: null, deleting: false });

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
        status: statusFilter !== "ALL" ? Number(statusFilter) : undefined,
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
  // LOAD STATISTICS
  // ============================
  const loadStats = async () => {
    try {
      // Load all cities to calculate stats
      const res = await searchCities({
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

  // ============================
  // RESET PAGE WHEN SEARCH/FILTER CHANGES
  // ============================
  useEffect(() => {
    setCurrentPage(1);
    // Reset sort when search/filter changes
    setSortField(null);
    setSortDirection('asc');
  }, [search, pageSize, statusFilter]);

  useEffect(() => {
    loadData();
  }, [search, pageSize, currentPage, sortField, sortDirection, statusFilter]);

  useEffect(() => {
    loadStats();
  }, []);

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

  const handleDelete = (city) => {
    setDeleteConfirm({ isOpen: true, city: city, error: null, deleting: false });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.city || deleteConfirm.deleting) return;

    try {
      setDeleteConfirm(prev => ({ ...prev, deleting: true, error: null }));
      await deleteCity(deleteConfirm.city.CityID);
      toast.success("City deleted successfully");
      setDeleteConfirm({ isOpen: false, city: null, error: null, deleting: false });
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
      
      // Check if it's a constraint error (city is being used)
      if (backendMsg.toLowerCase().includes("hotel") || 
          backendMsg.toLowerCase().includes("attraction") ||
          backendMsg.toLowerCase().includes("flight") ||
          backendMsg.toLowerCase().includes("tour") ||
          backendMsg.toLowerCase().includes("using") ||
          backendMsg.toLowerCase().includes("cannot delete")) {
        
        // Extract counts if available
        const counts = backendMsg.match(/(\d+)\s+(\w+)/g);
        if (counts && counts.length > 0) {
          const items = counts.map(c => {
            const match = c.match(/(\d+)\s+(\w+)/);
            if (match) {
              const count = match[1];
              const type = match[2];
              return `${count} ${type}${parseInt(count) > 1 ? 's' : ''}`;
            }
            return c;
          }).join(", ");
          
          userFriendlyMsg = `This city is currently being used by ${items}. You cannot delete it until you remove or change the city for those records first.`;
        } else {
          userFriendlyMsg = "This city is currently being used by other records. You cannot delete it until you remove or change the city for those records first.";
        }
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "This city no longer exists. Please refresh the page.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to delete this city. Please try again later or contact support if the problem persists.";
      } else {
        userFriendlyMsg = "Unable to delete this city. Please check your connection and try again.";
      }

      // Show error in dialog and toast
      setDeleteConfirm(prev => ({ ...prev, error: userFriendlyMsg, deleting: false }));
      toast.error(userFriendlyMsg);
    }
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
      loadStats();
    } catch (err) {
      console.error(err);
      
      // Get backend message
      let backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "";
      
      // Convert to user-friendly message
      let userFriendlyMsg = "";
      
      if (backendMsg.toLowerCase().includes("already exists") || backendMsg.toLowerCase().includes("duplicate")) {
        if (backendMsg.toLowerCase().includes("code")) {
          userFriendlyMsg = "This city code is already in use. Please choose a different code.";
        } else {
          userFriendlyMsg = "This city already exists. Please check the code and name.";
        }
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "City not found. Please refresh the page and try again.";
      } else if (backendMsg.toLowerCase().includes("validation") || backendMsg.toLowerCase().includes("required")) {
        userFriendlyMsg = "Please fill in all required fields correctly.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to save city. Please check your input and try again.";
      } else {
        userFriendlyMsg = "Unable to save city. Please check your connection and try again.";
      }

      toast.error(userFriendlyMsg);
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Total Cities</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Active Cities</p>
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
              <p className="text-sm font-medium text-neutral-600 mb-1">Inactive Cities</p>
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

      {/* Search, Filter & Sort Controls */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search cities..."
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
                    onClick={() => handleDelete(city)}
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
                  className={`px-3 py-1.5 rounded-lg border transition ${currentPage === page
                      ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                      : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
                    }`}
                >
                  {page}
                </button>
              );
            });
          })()}

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
                    Delete City
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
                              Cannot Delete This City
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
                          <li>Go to the relevant management pages (Hotels, Attractions, Flights, Tours)</li>
                          <li>Find the records using this city</li>
                          <li>Update their city to a different one</li>
                          <li>Then come back here to delete this city</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {deleteConfirm.city
                        ? `Are you sure you want to delete city "${deleteConfirm.city.CityName}"? This action cannot be undone.`
                        : "Are you sure you want to delete this city?"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, city: null, error: null, deleting: false })}
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





