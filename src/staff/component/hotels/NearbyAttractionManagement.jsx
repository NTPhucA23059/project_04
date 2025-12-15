import React, { useEffect, useState } from "react";
import {
  searchNearbyAttractions,
  createNearbyAttraction,
  updateNearbyAttraction,
  deleteNearbyAttraction,
  getNearbyAttractionById,
} from "../../../services/staff/nearbyAttractionStaffService";
import { searchHotels } from "../../../services/staff/hotelStaffService";
import { toast } from "../../shared/toast/toast";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";

const emptyForm = {
  attractionID: null,
  hotelID: "",
  attractionName: "",
  attractionType: "",
  distance: "",
  direction: "",
  description: "",
  sortOrder: "",
};

export default function NearbyAttractionManagement() {
  // ================= STATE =================
  const [attractions, setAttractions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedHotelID, setSelectedHotelID] = useState("");
  const [selectedAttractionType, setSelectedAttractionType] = useState("");
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
  const [detailAttraction, setDetailAttraction] = useState(null);

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
  const loadAttractions = async () => {
    setLoading(true);
    try {
      const res = await searchNearbyAttractions({
        page,
        size,
        keyword: search || undefined,
        hotelID: selectedHotelID || undefined,
        attractionType: selectedAttractionType || undefined,
      });

      setAttractions(res.items || []);
      setTotalPages(res.totalPages || 0);
      setTotal(res.total || 0);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load attractions";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadHotels = async () => {
    try {
      const res = await searchHotels({ page: 0, size: 1000 });
      setHotels(res.items || []);
    } catch (err) {
      toast.error("Failed to load hotels list", err);
    }
  };

  useEffect(() => {
    loadAttractions();
    loadHotels();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      setPage(0);
      loadAttractions();
    }, 400);
    return () => clearTimeout(id);
  }, [search, selectedHotelID, selectedAttractionType]);

  useEffect(() => {
    loadAttractions();
  }, [page]);

  // ================= MAP HELPERS =================
  const toForm = (a) => ({
    attractionID: a.attractionID,
    hotelID: a.hotelID || "",
    attractionName: a.attractionName || "",
    attractionType: a.attractionType || "",
    distance: a.distance !== null && a.distance !== undefined ? String(a.distance) : "",
    direction: a.direction || "",
    description: a.description || "",
    sortOrder: a.sortOrder ?? "",
  });

  const toPayload = (f) => ({
    hotelID: f.hotelID ? Number(f.hotelID) : null,
    attractionName: f.attractionName,
    attractionType: f.attractionType || null,
    distance: f.distance === "" ? null : Number(f.distance),
    direction: f.direction || null,
    description: f.description || null,
    sortOrder: f.sortOrder === "" ? 0 : Number(f.sortOrder),
  });

  // ================= VALIDATE =================
  const validate = () => {
    const e = {};
    if (!form.hotelID) e.hotelID = "Hotel required";
    if (!form.attractionName.trim()) e.attractionName = "Attraction name required";
    if (form.distance !== "" && Number(form.distance) < 0) e.distance = "Distance must be >= 0";
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
        await updateNearbyAttraction(editing.attractionID, payload);
        toast.success("Attraction updated successfully");
      } else {
        await createNearbyAttraction(payload);
        toast.success("Attraction created successfully");
      }
      setOpenModal(false);
      setEditing(null);
      setForm(emptyForm);
      loadAttractions();
    } catch (err) {
      console.error("Save attraction error:", err.response?.data || err.message || err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Save failed";
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ================= ACTIONS =================
  const handleDelete = async (attraction) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Attraction",
      message: `Are you sure you want to delete attraction "${attraction.attractionName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setSaving(true);
          await deleteNearbyAttraction(attraction.attractionID);
          toast.success("Attraction deleted successfully");
          loadAttractions();
        } catch (err) {
          console.error("Delete attraction error:", err.response?.data || err.message || err);
          const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Delete failed";
          toast.error(errorMsg);
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // Get unique attraction types for filter
  const attractionTypes = [...new Set(attractions.map(a => a.attractionType).filter(Boolean))];

  return (
    <div className="w-full p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Nearby Attraction Management</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage nearby attractions for hotels</p>
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
          + Add Attraction
        </button>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          className="border border-neutral-200 bg-white px-4 py-2.5 rounded-lg text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
          placeholder="Search attraction..."
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
          value={selectedAttractionType}
          onChange={(e) => setSelectedAttractionType(e.target.value)}
        >
          <option value="">All Types</option>
          {attractionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
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
              {["Hotel", "Attraction Name", "Type", "Distance", "Direction", "Sort Order", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-700">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {attractions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-neutral-500">
                  No attractions found
                </td>
              </tr>
            ) : (
              attractions.map((a) => (
                <tr key={a.attractionID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                  <td className="px-4 py-2">
                    <div className="font-medium">{a.hotelName || a.hotelCode || a.hotelID}</div>
                    {a.hotelCode && <div className="text-xs text-neutral-500">{a.hotelCode}</div>}
                  </td>
                  <td className="px-4 py-2 font-medium">{a.attractionName}</td>
                  <td className="px-4 py-2">
                    {a.attractionType ? (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        {a.attractionType}
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-2">{a.distance ? `${a.distance} km` : "-"}</td>
                  <td className="px-4 py-2">{a.direction || "-"}</td>
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
                          const attractionDetail = await getNearbyAttractionById(a.attractionID);
                          console.log("Attraction detail loaded:", attractionDetail); // Debug log
                          setDetailAttraction(attractionDetail);
                          setOpenDetail(true);
                        } catch (err) {
                          console.error("Load attraction detail error:", err);
                          const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to load attraction details";
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
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-90">
                  {editing ? "Update attraction" : "Create attraction"}
                </p>
                <h3 className="text-lg font-semibold">
                  {editing ? `Editing ${form.attractionName || "attraction"}` : "Add new attraction"}
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
                <p className="font-semibold text-neutral-800 mb-3">Attraction Information</p>
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
                    <label className="text-xs text-neutral-500">Attraction Name</label>
                    <input
                      className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.attractionName ? "border-red-500" : "border-neutral-200"}`}
                      value={form.attractionName}
                      onChange={(e) => setForm({ ...form, attractionName: e.target.value })}
                      placeholder="e.g. Beach, Museum, Shopping Mall"
                    />
                    {errors.attractionName && <p className="text-xs text-red-500 mt-1">{errors.attractionName}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500">Attraction Type</label>
                      <input
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.attractionType}
                        onChange={(e) => setForm({ ...form, attractionType: e.target.value })}
                        placeholder="e.g. Beach, Museum, Park"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Distance (km)</label>
                      <input
                        type="number"
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.distance ? "border-red-500" : "border-neutral-200"}`}
                        value={form.distance}
                        onChange={(e) => setForm({ ...form, distance: e.target.value })}
                        min={0}
                        step="0.1"
                        placeholder="0"
                      />
                      {errors.distance && <p className="text-xs text-red-500 mt-1">{errors.distance}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-500">Direction</label>
                    <input
                      className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                      value={form.direction}
                      onChange={(e) => setForm({ ...form, direction: e.target.value })}
                      placeholder="e.g. North, 500m from hotel"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-neutral-500">Description</label>
                    <textarea
                      className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Attraction description..."
                    />
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
      {openDetail && detailAttraction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Attraction Detail - {detailAttraction.attractionName}
              </h3>
              <button
                onClick={() => setOpenDetail(false)}
                className="text-neutral-700 hover:text-neutral-900"
              >
                ✖
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-primary-50 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">{detailAttraction.attractionName}</h4>
                {detailAttraction.attractionType && (
                  <span className="px-2 py-1 bg-primary-600 text-white rounded-full text-xs font-medium">
                    {detailAttraction.attractionType}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-semibold">ID:</span> {detailAttraction.attractionID}</div>
                <div>
                  <span className="font-semibold">Hotel:</span>{" "}
                  {detailAttraction.hotelName ? (
                    <span>{detailAttraction.hotelName} ({detailAttraction.hotelCode || detailAttraction.hotelID})</span>
                  ) : (
                    detailAttraction.hotelID
                  )}
                </div>
                <div><span className="font-semibold">Distance:</span> {detailAttraction.distance ? `${detailAttraction.distance} km` : "-"}</div>
                <div><span className="font-semibold">Direction:</span> {detailAttraction.direction || "-"}</div>
                <div><span className="font-semibold">Sort Order:</span> {detailAttraction.sortOrder ?? 0}</div>
                <div><span className="font-semibold">Created:</span> {detailAttraction.createdAt ? new Date(detailAttraction.createdAt).toLocaleDateString() : "-"}</div>
              </div>
            </div>

            {detailAttraction.description && (
              <div className="mt-3 text-sm">
                <span className="font-semibold">Description:</span> {detailAttraction.description}
              </div>
            )}

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

