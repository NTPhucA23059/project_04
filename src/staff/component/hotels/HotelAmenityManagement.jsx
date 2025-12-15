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
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";

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
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [openDetail, setOpenDetail] = useState(false);
  const [detailAmenity, setDetailAmenity] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

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

  useEffect(() => {
    loadAmenities();
    loadHotels();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setPage(0);
      loadAmenities();
    }, 400);
    return () => clearTimeout(id);
  }, [search, selectedHotelID, selectedCategory]);

  useEffect(() => {
    loadAmenities();
  }, [page]);

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
    amenityName: f.amenityName,
    amenityCategory: f.amenityCategory || null,
    icon: f.icon || null,
    sortOrder: f.sortOrder === "" ? 0 : Number(f.sortOrder),
  });

  // ================= VALIDATE =================
  const validate = () => {
    const e = {};
    if (!form.hotelID) e.hotelID = "Hotel required";
    if (!form.amenityName.trim()) e.amenityName = "Amenity name required";
    if (form.sortOrder !== "" && Number(form.sortOrder) < 0) e.sortOrder = "Sort order must be >= 0";
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
    } catch (err) {
      console.error("Save amenity error:", err.response?.data || err.message || err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Save failed";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ================= ACTIONS =================
  const handleDelete = async (amenity) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Amenity",
      message: `Are you sure you want to delete amenity "${amenity.amenityName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setSaving(true);
          await deleteHotelAmenity(amenity.hotelAmenityID);
          toast.success("Amenity deleted successfully");
          loadAmenities();
        } catch (err) {
          console.error("Delete amenity error:", err.response?.data || err.message || err);
          const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Delete failed";
          toast.error(errorMsg);
        } finally {
          setSaving(false);
        }
      },
    });
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
      <div className="flex items-center justify-between mt-4 text-sm">
        <div className="text-neutral-600">
          Page {page + 1} / {Math.max(totalPages, 1)} • Total {total}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page <= 0}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
          >
            Prev
          </button>
          <button
            onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
            disabled={page + 1 >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
          >
            Next
          </button>
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
                    />
                    {errors.amenityName && <p className="text-xs text-red-500 mt-1">{errors.amenityName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500">Category</label>
                      <input
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.amenityCategory}
                        onChange={(e) => setForm({ ...form, amenityCategory: e.target.value })}
                        placeholder="e.g. Facility, Service, Entertainment"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Icon</label>
                      <input
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.icon}
                        onChange={(e) => setForm({ ...form, icon: e.target.value })}
                        placeholder="e.g. 🏊, 🏋️, 📶"
                      />
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
