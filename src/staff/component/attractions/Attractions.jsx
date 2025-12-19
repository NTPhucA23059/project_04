import React, { useState, useEffect } from "react";
import AttractionFormModal from "./AttractionFormModal";
import { getAllCities } from "../../../services/staff/cityStaffService";
import {
  searchAttractions,
  createAttraction,
  updateAttractionMultipart,
  updateAttraction,
  deleteAttraction,
} from "../../../services/staff/attractionStaffService";
import { toast } from "../../shared/toast/toast";

export default function Attractions() {
  const [attractions, setAttractions] = useState([]);
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, attraction: null, error: null, deleting: false });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Sorting
  const [sortField, setSortField] = useState(null); 
  const [sortDirection, setSortDirection] = useState('asc');

  // ============================
  // LOAD CITIES (for dropdown)
  // ============================
  const loadCities = async () => {
    try {
      const res = await getAllCities();
      // Map response data to component format
      const mappedCities = res.map((city) => ({
        CityID: city.cityID,
        CityCode: city.cityCode,
        CityName: city.cityName,
        Country: city.country,
        Description: city.description,
        Status: city.status,
      }));
      setCities(mappedCities);
    } catch (err) {
      console.error("Failed to load cities:", err);
      // Fallback to empty array if API fails
      setCities([]);
    }
  };

  // ============================
  // FETCH ATTRACTIONS
  // ============================
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const res = await searchAttractions({
        page: currentPage - 1,
        size: pageSize,
        keyword: search.trim() || undefined,
        cityID: selectedCity ? Number(selectedCity) : undefined,
      });

      // Map response data to component format (only fields in entity)
      const items = res.items?.map((x) => ({
        AttractionID: x.attractionID,
        CityID: x.cityID,
        Name: x.name,
        Address: x.address,
        Status: x.status,
        CityName: x.cityName || "", // Backend should include cityName in response
        CreatedAt: x.createdAt,
        UpdatedAt: x.updatedAt,
      })) ?? [];

      setAttractions(items);
      setTotalItems(res.total || 0);
      setTotalPages(res.pages || res.totalPages || 0);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  // ============================
  // RESET PAGE WHEN SEARCH CHANGES
  // ============================
  useEffect(() => {
    setCurrentPage(1);
    // Reset sort when search/filter changes
    setSortField(null);
    setSortDirection('asc');
  }, [search, selectedCity, pageSize]);

  useEffect(() => {
    if (cities.length > 0) {
      loadData();
    }
  }, [search, selectedCity, pageSize, currentPage, cities.length]);

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

  const handleEdit = (attr) => {
    setEditingItem(attr);
    setModalOpen(true);
  };

  const handleDelete = (attr) => {
    setDeleteConfirm({ isOpen: true, attraction: attr, error: null, deleting: false });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.attraction || deleteConfirm.deleting) return;

    try {
      setDeleteConfirm(prev => ({ ...prev, deleting: true, error: null }));
      await deleteAttraction(deleteConfirm.attraction.AttractionID);
      toast.success("Attraction deleted successfully");
      setDeleteConfirm({ isOpen: false, attraction: null, error: null, deleting: false });
      loadData();
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
      
      // Check if it's a constraint error (attraction is being used)
      if (backendMsg.toLowerCase().includes("tour") || 
          backendMsg.toLowerCase().includes("schedule") ||
          backendMsg.toLowerCase().includes("activity") ||
          backendMsg.toLowerCase().includes("using") ||
          backendMsg.toLowerCase().includes("cannot delete")) {
        
        // Extract number of schedule items if available
        const countMatch = backendMsg.match(/\d+/);
        const count = countMatch ? countMatch[0] : "some";
        
        userFriendlyMsg = `This attraction is currently being used by ${count} tour schedule activity(ies). You cannot delete it until you remove or change the attraction for those activities first.`;
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "This attraction no longer exists. Please refresh the page.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to delete this attraction. Please try again later or contact support if the problem persists.";
      } else {
        userFriendlyMsg = "Unable to delete this attraction. Please check your connection and try again.";
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
      
      if (editingItem) {
        // Update: không gửi cityID vì không được phép đổi city
        const updatePayload = {
          name: data.Name,
          address: data.Address || null,
          status: data.Status,
        };
        
        await updateAttraction(editingItem.AttractionID, updatePayload);
        toast.success("Attraction updated successfully");
      } else {
        // Create: gửi đầy đủ bao gồm cityID
        const createPayload = {
          cityID: data.CityID,
          name: data.Name,
          address: data.Address || null,
          status: data.Status,
        };
        
        await createAttraction({
          attraction: createPayload,
          image: null,
        });
        toast.success("Attraction created successfully");
      }
      
      setModalOpen(false);
      setEditingItem(null);
      loadData();
    } catch (err) {
      console.error(err);
      
      // Get backend message
      let backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "";
      
      // Convert to user-friendly message
      let userFriendlyMsg = "";
      
      if (backendMsg.toLowerCase().includes("city not found")) {
        userFriendlyMsg = "The selected city no longer exists. Please refresh the page and try again.";
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "Attraction not found. Please refresh the page and try again.";
      } else if (backendMsg.toLowerCase().includes("validation") || backendMsg.toLowerCase().includes("required")) {
        userFriendlyMsg = "Please fill in all required fields correctly.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to save attraction. Please check your input and try again.";
      } else {
        userFriendlyMsg = "Unable to save attraction. Please check your connection and try again.";
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

  // Apply sorting to attractions
  const sortedAttractions = React.useMemo(() => {
    if (!sortField) return attractions;
    
    return [...attractions].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle null/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';
      
      // Handle numbers (Status)
      if (sortField === 'Status') {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
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
  }, [attractions, sortField, sortDirection]);

  // Pagination calculation - backend đã phân trang rồi
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageData = sortedAttractions; // Backend đã trả về đúng page rồi


  // ============================
  // UI RENDER
  // ============================
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Attraction Management</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage attractions and their information</p>
        </div>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all"
        >
          + Add Attraction
        </button>
      </div>

      {/* Filters & Sort Controls */}
      <div className="mb-4 flex items-center gap-3">
        <input
          type="text"
          placeholder="Search attractions..."
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition min-w-[200px]"
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city.CityID} value={city.CityID}>
              {city.CityName}
            </option>
          ))}
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
                onClick={() => handleSort('Name')}
              >
                <div className="flex items-center gap-2">
                  <span>Attraction Name</span>
                  {sortField === 'Name' ? (
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
                  <span>City</span>
                  {sortField === 'CityName' ? (
                    <span className="text-primary-600 font-bold">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-xs">↕</span>
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-neutral-700">Address</th>
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
                <td colSpan="6" className="py-8 text-center text-neutral-500">Loading...</td>
              </tr>
            )}
            {!loading && pageData.map((attr, index) => (
              <tr key={attr.AttractionID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                <td className="px-4 py-3 text-center text-neutral-500 font-medium">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-neutral-900">{attr.Name}</div>
                </td>
                <td className="px-4 py-3 text-neutral-700">{attr.CityName || "-"}</td>
                <td className="px-4 py-3 text-neutral-600">{attr.Address || "-"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    attr.Status === 1 
                      ? "bg-green-100 text-green-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    {attr.Status === 1 ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2 flex-nowrap whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(attr)}
                      className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700 shadow-sm transition whitespace-nowrap"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(attr)}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 shadow-sm transition whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!loading && pageData.length === 0 && (
              <tr>
                <td colSpan="6" className="py-6 text-center text-neutral-500">
                  No attractions found.
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
            ? "No attractions"
            : `Showing ${startIndex + 1}–${endIndex} of ${totalItems} attractions`}
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
      <AttractionFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSave}
        initial={editingItem}
        cities={cities}
        list={attractions}
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
                    Delete Attraction
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
                              Cannot Delete This Attraction
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
                          <li>Find the tour schedules using this attraction</li>
                          <li>Update or remove those activities</li>
                          <li>Then come back here to delete this attraction</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {deleteConfirm.attraction
                        ? `Are you sure you want to delete attraction "${deleteConfirm.attraction.Name}"? This action cannot be undone.`
                        : "Are you sure you want to delete this attraction?"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, attraction: null, error: null, deleting: false })}
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




