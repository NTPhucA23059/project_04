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
import api from "../../../services/api";
import { toast } from "../../shared/toast/toast";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";

export default function Attractions() {
  const [attractions, setAttractions] = useState([]);
  const [cities, setCities] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

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
  const [sortField, setSortField] = useState(null); 
  const [sortDirection, setSortDirection] = useState('asc'); 

  // Convert relative URL to absolute URL
  const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    const normalized = url.startsWith("/") ? url : `/${url}`;
    return base ? `${base}${normalized}` : normalized;
  };

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

      // Map response data to component format
      const items = res.items?.map((x) => ({
        AttractionID: x.attractionID,
        CityID: x.cityID,
        Name: x.name,
        Description: x.description,
        Address: x.address,
        Rating: x.rating,
        ImageUrl: toAbsoluteUrl(x.imageUrl), // Convert to absolute URL
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

  const handleDelete = async (id) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Attraction",
      message: "Are you sure you want to delete this attraction? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteAttraction(id);
          toast.success("Attraction deleted successfully");
          loadData();
        } catch (err) {
          toast.error(err?.response?.data?.error || err.message || "Delete failed");
        }
      },
    });
  };

  const handleSave = async (data, imageFile) => {
    try {
      setLoading(true);
      setError("");
      
      if (editingItem) {
        // Update: không gửi cityID vì không được phép đổi city
        const updatePayload = {
          name: data.Name,
          description: data.Description || null,
          address: data.Address || null,
          rating: data.Rating || null,
          imageUrl: data.ImageUrl || null,
          status: data.Status,
        };
        
        // Update: if image file provided, use multipart, otherwise use JSON
        if (imageFile) {
          await updateAttractionMultipart({
            id: editingItem.AttractionID,
            attraction: updatePayload,
            image: imageFile,
          });
        } else {
          await updateAttraction(editingItem.AttractionID, updatePayload);
        }
        toast.success("Attraction updated successfully");
      } else {
        // Create: gửi đầy đủ bao gồm cityID
        const createPayload = {
          cityID: data.CityID,
          name: data.Name,
          description: data.Description || null,
          address: data.Address || null,
          rating: data.Rating || null,
          imageUrl: data.ImageUrl || null,
          status: data.Status,
        };
        
        // Create: if image file provided, use multipart, otherwise use JSON
        if (imageFile) {
          await createAttraction({
            attraction: createPayload,
            image: imageFile,
          });
        } else {
          await createAttraction({
            attraction: createPayload,
            image: null,
          });
        }
        toast.success("Attraction created successfully");
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

  // Apply sorting to attractions
  const sortedAttractions = React.useMemo(() => {
    if (!sortField) return attractions;
    
    return [...attractions].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle null/undefined
      if (aVal == null) aVal = '';
      if (bVal == null) bVal = '';
      
      // Handle numbers (Rating, Status)
      if (sortField === 'Rating' || sortField === 'Status') {
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
              <th className="px-4 py-3 text-center font-semibold text-neutral-700 w-20">Image</th>
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
                onClick={() => handleSort('Rating')}
              >
                <div className="flex items-center gap-2">
                  <span>Rating</span>
                  {sortField === 'Rating' ? (
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
                <td colSpan="8" className="py-8 text-center text-neutral-500">Loading...</td>
              </tr>
            )}
            {!loading && pageData.map((attr, index) => (
              <tr key={attr.AttractionID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                <td className="px-4 py-3 text-center text-neutral-500 font-medium">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-3 text-center">
                  {attr.ImageUrl ? (
                    <img
                      src={attr.ImageUrl}
                      alt={attr.Name}
                      className="w-16 h-16 object-cover rounded-lg border border-neutral-200"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        if (parent) {
                          const placeholder = parent.querySelector('.image-placeholder');
                          if (placeholder) {
                            placeholder.classList.remove('hidden');
                          }
                        }
                      }}
                    />
                  ) : null}
                  <div className={`image-placeholder w-16 h-16 bg-neutral-100 rounded-lg border border-neutral-200 flex items-center justify-center ${attr.ImageUrl ? 'hidden' : ''}`}>
                    <span className="text-neutral-400 text-xs">No Image</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-neutral-900">{attr.Name}</div>
                  {attr.Description && (
                    <div className="text-xs text-neutral-500 mt-1 line-clamp-1">
                      {attr.Description}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-700">{attr.CityName || "-"}</td>
                <td className="px-4 py-3 text-neutral-600">{attr.Address || "-"}</td>
                <td className="px-4 py-3">
                  {attr.Rating ? (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-medium text-neutral-700">{attr.Rating}</span>
                    </div>
                  ) : (
                    <span className="text-neutral-400">-</span>
                  )}
                </td>
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
                      onClick={() => handleDelete(attr.AttractionID)}
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
                <td colSpan="8" className="py-6 text-center text-neutral-500">
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


