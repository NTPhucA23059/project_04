import React, { useEffect, useState } from "react";
import {
  searchHotelAmenities,
  createHotelAmenity,
  updateHotelAmenity,
  deleteHotelAmenity,
  getHotelAmenityById,
} from "../../../services/staff/hotelAmenityStaffService";
import { searchHotels } from "../../../services/staff/hotelStaffService";
import { toast } from "../../shared/toast/toast";

const emptyForm = {
  hotelAmenityID: null,
  hotelID: "",
  amenityName: "",
  amenityCategory: "",
  icon: "",
  sortOrder: "",
};

export default function HotelAmenityManagement() {
  // ================= STATE =================
  const [amenities, setAmenities] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedHotelID, setSelectedHotelID] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hotels, setHotels] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
  });

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [openDetail, setOpenDetail] = useState(false);
  const [detailAmenity, setDetailAmenity] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, amenity: null, error: null, deleting: false });

  // ================= LOAD DATA =================
  const loadAmenities = async () => {
    setLoading(true);
    try {
      const res = await searchHotelAmenities({
        page,
        size,
        keyword: search || undefined,
        hotelID: selectedHotelID || undefined,
        category: selectedCategory || undefined,
      });
      console.log("API Response:", res); // Debug log
      setAmenities(res.items || []);
      setTotalPages(res.totalPages || 0);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Load amenities error:", err.response?.data || err.message || err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load amenities";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadHotels = async () => {
    try {
      const res = await searchHotels({ page: 0, size: 1000 });
      console.log("Hotels loaded:", res.items?.length || 0); // Debug log
      setHotels(res.items || []);
    } catch (err) {
      console.error("Load hotels error:", err);
      toast.error("Failed to load hotels list");
    }
  };

  // ============================
  // LOAD STATISTICS
  // ============================
  const loadStats = async () => {
    try {
      // Load all amenities to calculate stats
      const res = await searchHotelAmenities({
        page: 0,
        size: 1000, // Get all for stats
        keyword: undefined,
        hotelID: undefined,
        category: undefined,
      });

      const totalCount = res.items?.length || 0;
      setStats({
        total: totalCount,
      });
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  useEffect(() => {
    loadAmenities();
    loadHotels();
    loadStats();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setPage(0);
      loadAmenities();
      loadStats();
    }, 400);
    return () => clearTimeout(id);
  }, [search, selectedHotelID, selectedCategory]);

  useEffect(() => {
    loadAmenities();
  }, [page, size]);

  // ================= MAP HELPERS =================
  const toForm = (a) => ({
    hotelAmenityID: a.hotelAmenityID,
    hotelID: a.hotelID || "",
    amenityName: a.amenityName || "",
    amenityCategory: a.amenityCategory || "",
    icon: a.icon || "",
    sortOrder: a.sortOrder ?? "",
  });

  const toPayload = (f) => ({
    hotelID: f.hotelID ? Number(f.hotelID) : null,
    amenityName: f.amenityName.trim(),
    amenityCategory: f.amenityCategory && f.amenityCategory.trim() ? f.amenityCategory.trim() : null,
    icon: f.icon && f.icon.trim() ? f.icon.trim() : null,
    sortOrder: f.sortOrder === "" || f.sortOrder === null || f.sortOrder === undefined ? 0 : Number(f.sortOrder),
  });

  // ================= VALIDATE =================
  const validate = () => {
    const e = {};
    
    // Hotel ID: required, must be valid number
    if (!form.hotelID) {
      e.hotelID = "Hotel is required";
    } else {
      const hotelIDNum = Number(form.hotelID);
      if (isNaN(hotelIDNum) || hotelIDNum <= 0 || !Number.isInteger(hotelIDNum)) {
        e.hotelID = "Please select a valid hotel";
      }
    }
    
    // Amenity Name: required, not blank, max 100 characters
    const amenityNameTrimmed = form.amenityName.trim();
    if (!amenityNameTrimmed) {
      e.amenityName = "Amenity name is required";
    } else if (amenityNameTrimmed.length > 100) {
      e.amenityName = "Amenity name must be 100 characters or less";
    } else if (amenityNameTrimmed.length < 2) {
      e.amenityName = "Amenity name must be at least 2 characters";
    }
    
    // Amenity Category: optional, but if provided max 50 characters
    if (form.amenityCategory && form.amenityCategory.trim()) {
      const categoryTrimmed = form.amenityCategory.trim();
      if (categoryTrimmed.length > 50) {
        e.amenityCategory = "Category must be 50 characters or less";
      }
    }
    
    // Icon: optional, but if provided max 50 characters
    if (form.icon && form.icon.trim()) {
      const iconTrimmed = form.icon.trim();
      if (iconTrimmed.length > 50) {
        e.icon = "Icon must be 50 characters or less";
      }
    }
    
    // Sort Order: must be integer >= 0, reasonable max (10000)
    if (form.sortOrder !== "" && form.sortOrder !== null && form.sortOrder !== undefined) {
      const sortOrderNum = Number(form.sortOrder);
      if (isNaN(sortOrderNum)) {
        e.sortOrder = "Sort order must be a valid number";
      } else if (!Number.isInteger(sortOrderNum)) {
        e.sortOrder = "Sort order must be an integer";
      } else if (sortOrderNum < 0) {
        e.sortOrder = "Sort order must be 0 or greater";
      } else if (sortOrderNum > 10000) {
        e.sortOrder = "Sort order must be 10000 or less";
      }
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ================= SAVE =================
  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editing) {
        await updateHotelAmenity(editing.hotelAmenityID, payload);
        toast.success("Amenity updated successfully");
      } else {
        await createHotelAmenity(payload);
        toast.success("Amenity created successfully");
      }
      setOpenModal(false);
      setEditing(null);
      setForm(emptyForm);
      loadAmenities();
      loadStats();
    } catch (err) {
      console.error("Save amenity error:", err.response?.data || err.message || err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Save failed";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ================= ACTIONS =================
  const handleDelete = (amenity) => {
    setDeleteConfirm({ isOpen: true, amenity: amenity, error: null, deleting: false });
  };

  const confirmDeleteAmenity = async () => {
    if (!deleteConfirm.amenity || deleteConfirm.deleting) return;

    try {
      setDeleteConfirm(prev => ({ ...prev, deleting: true, error: null }));
      await deleteHotelAmenity(deleteConfirm.amenity.hotelAmenityID);
      toast.success("Amenity deleted successfully");
      setDeleteConfirm({ isOpen: false, amenity: null, error: null, deleting: false });
      loadAmenities();
      loadStats();
    } catch (err) {
      console.error("Delete amenity error:", err.response?.data || err.message || err);
      
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
      
      if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "This amenity no longer exists. Please refresh the page.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to delete this amenity. Please try again later or contact support if the problem persists.";
      } else {
        userFriendlyMsg = "Unable to delete this amenity. Please check your connection and try again.";
      }

      // Show error in dialog and toast
      setDeleteConfirm(prev => ({ ...prev, error: userFriendlyMsg, deleting: false }));
      toast.error(userFriendlyMsg);
    }
  };

  // Get unique categories for filter
  const categories = [...new Set(amenities.map(a => a.amenityCategory).filter(Boolean))];

  const filteredAmenities = amenities;

  return (
    <div className="w-full p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Hotel Amenity Management</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage hotel amenities and features</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm(emptyForm);
            setErrors({});
            setOpenModal(true);
          }}
          className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all"
        >
          + Add Amenity
        </button>
      </div>

      {/* Statistics Card */}
      <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600 mb-1">Total Amenities</p>
            <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-primary-100 rounded-lg">
            <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          className="border border-neutral-200 bg-white px-4 py-2.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          placeholder="Search amenity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-neutral-200 bg-white px-4 py-2.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          value={selectedHotelID}
          onChange={(e) => setSelectedHotelID(e.target.value)}
        >
          <option value="">All Hotels</option>
          {hotels.map((h) => (
            <option key={h.hotelID} value={h.hotelID}>
              {h.hotelCode} - {h.hotelName}
            </option>
          ))}
        </select>
        <select
          className="border border-neutral-200 bg-white px-4 py-2.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-sm text-neutral-600 mb-2 font-medium">Loading...</p>}

      {/* TABLE */}
      <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary-50 border-b border-primary-200">
            <tr>
              {["Hotel", "Amenity Name", "Category", "Sort Order", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-700">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredAmenities.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-neutral-500">
                  No amenities found
                </td>
              </tr>
            ) : (
              filteredAmenities.map((a) => (
                <tr key={a.hotelAmenityID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                  <td className="px-4 py-2">
                    <div className="font-medium">{a.hotelName || a.hotelCode || a.hotelID}</div>
                    {a.hotelCode && <div className="text-xs text-neutral-500">{a.hotelCode}</div>}
                  </td>
                  <td className="px-4 py-2 font-medium">
                    <div className="flex items-center gap-2">
                     
                      <span>{a.amenityName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    {a.amenityCategory ? (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        {a.amenityCategory}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2">{a.sortOrder ?? 0}</td>

                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => {
                        setEditing(a);
                        setForm(toForm(a));
                        setErrors({});
                        setOpenModal(true);
                      }}
                      className="bg-primary-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-primary-700 shadow-sm transition font-medium"
                    >
                      Edit
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const amenityDetail = await getHotelAmenityById(a.hotelAmenityID);
                          console.log("Amenity detail loaded:", amenityDetail); // Debug log
                          setDetailAmenity(amenityDetail);
                          setOpenDetail(true);
                        } catch (err) {
                          console.error("Load amenity detail error:", err);
                          const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load amenity details";
                          toast.error(errorMsg);
                        }
                      }}
                      className="bg-accent-500 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-accent-600 shadow-sm transition font-medium"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleDelete(a)}
                      className="bg-red-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-red-700 shadow-sm transition font-medium"
                      disabled={saving}
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

      {/* PAGINATION */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
        {/* Showing info */}
        <p className="text-sm text-neutral-600 font-medium">
          {total === 0
            ? "No amenities"
            : `Showing ${page * size + 1}–${Math.min((page + 1) * size, total)} of ${total} amenities`}
        </p>

        <div className="flex items-center gap-4">
          {/* Page size selector */}
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            className="border border-neutral-200 bg-white px-3 py-1.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>

          {/* Page navigation */}
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page <= 0}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
            >
              Prev
            </button>
            
            {/* Page numbers */}
            {totalPages > 0 && [...Array(Math.min(totalPages, 5))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 2) {
                pageNum = i;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={i}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    page === pageNum
                      ? "bg-primary-600 text-white border-primary-600"
                      : "bg-white border-neutral-200 text-neutral-700 hover:bg-primary-50 hover:border-primary-300"
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            
            <button
              onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
              disabled={page + 1 >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {openModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-90">
                  {editing ? "Update amenity" : "Create amenity"}
                </p>
                <h3 className="text-lg font-semibold">
                  {editing ? `Editing ${form.amenityName || "amenity"}` : "Add new amenity"}
                </h3>
              </div>
              <button
                onClick={() => setOpenModal(false)}
                className="text-white/80 hover:text-white text-xl leading-none"
              >
                ✖
              </button>
            </div>

            <div className="p-6 space-y-5 bg-neutral-50 overflow-y-auto">
              <div className="bg-white border rounded-xl p-4 shadow-sm">
                <p className="font-semibold text-neutral-800 mb-3">Amenity Information</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-neutral-500">Hotel</label>
                    <select
                      className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.hotelID ? "border-red-500" : "border-neutral-200"}`}
                      value={form.hotelID}
                      onChange={(e) => setForm({ ...form, hotelID: e.target.value })}
                    >
                      <option value="">-- Select Hotel --</option>
                      {hotels.map((h) => (
                        <option key={h.hotelID} value={h.hotelID}>
                          {h.hotelCode} - {h.hotelName}
                        </option>
                      ))}
                    </select>
                    {errors.hotelID && <p className="text-xs text-red-500 mt-1">{errors.hotelID}</p>}
                  </div>

                  <div>
                    <label className="text-xs text-neutral-500">Amenity Name</label>
                    <input
                      className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.amenityName ? "border-red-500" : "border-neutral-200"}`}
                      value={form.amenityName}
                      onChange={(e) => setForm({ ...form, amenityName: e.target.value })}
                      placeholder="e.g. WiFi, Swimming Pool, Gym"
                      maxLength={100}
                    />
                    {errors.amenityName && <p className="text-xs text-red-500 mt-1">{errors.amenityName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500">Category</label>
                      <input
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.amenityCategory ? "border-red-500" : "border-neutral-200"}`}
                        value={form.amenityCategory}
                        onChange={(e) => setForm({ ...form, amenityCategory: e.target.value })}
                        placeholder="e.g. Facility, Service, Entertainment"
                        maxLength={50}
                      />
                      {errors.amenityCategory && <p className="text-xs text-red-500 mt-1">{errors.amenityCategory}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Icon</label>
                      <input
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.icon ? "border-red-500" : "border-neutral-200"}`}
                        value={form.icon}
                        onChange={(e) => setForm({ ...form, icon: e.target.value })}
                        placeholder="e.g. 🏊, 🏋️, 📶"
                        maxLength={50}
                      />
                      {errors.icon && <p className="text-xs text-red-500 mt-1">{errors.icon}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-500">Sort Order</label>
                    <input
                      type="number"
                      className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.sortOrder ? "border-red-500" : "border-neutral-200"}`}
                      value={form.sortOrder}
                      onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                      min={0}
                      max={10000}
                      placeholder="0"
                    />
                    {errors.sortOrder && <p className="text-xs text-red-500 mt-1">{errors.sortOrder}</p>}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setOpenModal(false)}
                  className="border border-neutral-300 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {openDetail && detailAmenity && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Amenity Detail - {detailAmenity.amenityName}
              </h3>
              <button
                onClick={() => setOpenDetail(false)}
                className="text-neutral-700 hover:text-neutral-900"
              >
                ✖
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg">
                {detailAmenity.icon && <span className="text-3xl">{detailAmenity.icon}</span>}
                <div>
                  <h4 className="font-semibold text-lg">{detailAmenity.amenityName}</h4>
                  {detailAmenity.amenityCategory && (
                    <span className="text-xs text-primary-600 font-medium">{detailAmenity.amenityCategory}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-semibold">ID:</span> {detailAmenity.hotelAmenityID}</div>
                <div><span className="font-semibold">Sort Order:</span> {detailAmenity.sortOrder ?? 0}</div>
                <div className="col-span-2">
                  <span className="font-semibold">Hotel:</span>{" "}
                  {detailAmenity.hotelName ? (
                    <span>{detailAmenity.hotelName} ({detailAmenity.hotelCode || detailAmenity.hotelID})</span>
                  ) : (
                    detailAmenity.hotelID
                  )}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">Icon:</span>{" "}
                  {detailAmenity.icon ? (
                    <span className="text-2xl">{detailAmenity.icon}</span>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setOpenDetail(false)}
                className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                    Delete Amenity
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
                              Cannot Delete This Amenity
                            </p>
                            <p className="text-sm text-amber-800 leading-relaxed">
                              {deleteConfirm.error}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {deleteConfirm.amenity
                        ? `Are you sure you want to delete amenity "${deleteConfirm.amenity.amenityName}"? This action cannot be undone.`
                        : "Are you sure you want to delete this amenity?"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, amenity: null, error: null, deleting: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
              >
                {deleteConfirm.error ? "Close" : "Cancel"}
              </button>
              {!deleteConfirm.error && (
                <button
                  onClick={confirmDeleteAmenity}
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
