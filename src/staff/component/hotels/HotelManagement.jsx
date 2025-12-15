import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import {
  searchHotels,
  createHotel,
  updateHotelMultipart,
  deleteHotel,
  getHotelById,
} from "../../../services/staff/hotelStaffService";
import { toast } from "../../shared/toast/toast";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";

const emptyForm = {
  hotelID: null,
  hotelCode: "",
  hotelName: "",
  cityID: "",
  address: "",
  priceMin: "",
  priceMax: "",
  facilities: "",
  foodSpecialty: "",
  rating: "",
  description: "",
  imageUrl: "",
  status: 1,
  phoneNumber: "",
  email: "",
  numberOfRooms: "",
  numberOfFloors: "",
  yearBuilt: "",
  mainImageFile: null,
  galleryFiles: [],
  images: [],
};

export default function HotelManagement() {
  // ================= STATE =================
  const [hotels, setHotels] = useState([]);
  const [search, setSearch] = useState("");
  const [cities, setCities] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [openDetail, setOpenDetail] = useState(false);
  const [detailHotel, setDetailHotel] = useState(null);

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
  const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    const normalized = url.replace(/^\/+/, "");
    return base ? `${base}/${normalized}` : `/${normalized}`;
  };

  const normalizeHotel = (h) => {
    if (!h) return h;
    return {
      ...h,
      imageUrl: toAbsoluteUrl(h.imageUrl),
      images: (h.images || []).map((img) => ({
        ...img,
        imageUrl: toAbsoluteUrl(img.imageUrl),
      })),
    };
  };

  const loadHotels = async () => {
    setLoading(true);
    try {
      const res = await searchHotels({ page, size, keyword: search || undefined });
      setHotels((res.items || []).map(normalizeHotel));
      setTotalPages(res.totalPages || 0);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Load hotels error:", err.response?.data || err.message || err);
      toast.error(err.message || "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHotels();
    // Load cities
    import("../../../services/staff/cityStaffService").then((module) => {
      module.getAllCities().then(setCities).catch(() => { });
    });
  }, []);

  useEffect(() => {
    const id = setTimeout(loadHotels, 400);
    return () => clearTimeout(id);
  }, [search, page]);

  // ================= MAP HELPERS =================
  const toForm = (h) => ({
    hotelID: h.hotelID,
    hotelCode: h.hotelCode || "",
    hotelName: h.hotelName || "",
    cityID: h.cityID || "",
    address: h.address || "",
    priceMin: h.priceMin ?? "",
    priceMax: h.priceMax ?? "",
    facilities: h.facilities || "",
    foodSpecialty: h.foodSpecialty || "",
    rating: h.rating ?? "",
    description: h.description || "",
    imageUrl: toAbsoluteUrl(h.imageUrl) || "",
    status: h.status ?? 1,
    phoneNumber: h.phoneNumber || "",
    email: h.email || "",
    numberOfRooms: h.numberOfRooms ?? "",
    numberOfFloors: h.numberOfFloors ?? "",
    yearBuilt: h.yearBuilt ?? "",
    mainImageFile: null,
    galleryFiles: [],
    images: (h.images || []).map((i) => ({
      imageID: i.imageID,
      imageUrl: toAbsoluteUrl(i.imageUrl),
      isNew: false,
    })),
  });

  // ================= VALIDATE =================
  const validate = () => {
    const e = {};
    if (!form.hotelCode.trim()) e.hotelCode = "Hotel code required";
    if (!form.hotelName.trim()) e.hotelName = "Hotel name required";
    if (!form.cityID) e.cityID = "City required";
    if (form.priceMin !== "" && Number(form.priceMin) < 0) e.priceMin = "Price must be >= 0";
    if (form.priceMax !== "" && Number(form.priceMax) < 0) e.priceMax = "Price must be >= 0";
    if (form.rating !== "" && (Number(form.rating) < 0 || Number(form.rating) > 5)) e.rating = "Rating must be 0-5";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ================= MAP HELPERS =================
  const toPayload = (f) => ({
    hotelCode: f.hotelCode,
    hotelName: f.hotelName,
    cityID: f.cityID ? Number(f.cityID) : null,
    address: f.address,
    priceMin: f.priceMin === "" ? null : Number(f.priceMin),
    priceMax: f.priceMax === "" ? null : Number(f.priceMax),
    facilities: f.facilities,
    foodSpecialty: f.foodSpecialty,
    rating: f.rating === "" ? null : Number(f.rating),
    description: f.description,
    imageUrl: f.imageUrl && !String(f.imageUrl).startsWith("blob:") ? f.imageUrl : null,
    status: f.status === "" ? null : Number(f.status),
    phoneNumber: f.phoneNumber,
    email: f.email,
    numberOfRooms: f.numberOfRooms === "" ? null : Number(f.numberOfRooms),
    numberOfFloors: f.numberOfFloors === "" ? null : Number(f.numberOfFloors),
    yearBuilt: f.yearBuilt === "" ? null : Number(f.yearBuilt),
    // Only send existing URLs (skip blob previews)
    images: (f.images || [])
      .filter((img) => {
        const url = typeof img === "string" ? img : img?.imageUrl;
        return url && !url.startsWith("blob:");
      })
      .map((img) => {
        const url = typeof img === "string" ? img : img?.imageUrl;
        return { imageUrl: url };
      }),
  });

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
        await updateHotelMultipart({
          id: editing.hotelID,
          hotel: payload,
          mainImage: form.mainImageFile,
          galleryImages: form.galleryFiles,
        });
        toast.success("Hotel updated successfully");
      } else {
        const { mainImageFile, galleryFiles } = form;
        delete payload.images;
        delete payload.imageUrl;
        await createHotel({
          hotel: payload,
          mainImage: mainImageFile,
          galleryImages: galleryFiles,
        });
        toast.success("Hotel created successfully");
      }
      setOpenModal(false);
      setEditing(null);
      setForm(emptyForm);
      loadHotels();
    } catch (err) {
      console.error("Save hotel error:", err.response?.data || err.message || err);
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ================= ACTIONS =================
  const handleDelete = async (hotel) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Hotel",
      message: `Are you sure you want to delete hotel ${hotel.hotelCode}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setSaving(true);
          await deleteHotel(hotel.hotelID);
          toast.success("Hotel deleted successfully");
          loadHotels();
        } catch (err) {
          console.error("Delete hotel error:", err.response?.data || err.message || err);
          toast.error(err.message || "Delete failed");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // ================= IMAGE HANDLER =================
  const handleMainImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, mainImageFile: file, imageUrl: URL.createObjectURL(file) });
  };

  const handleAddGallery = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setForm((prev) => ({
      ...prev,
      galleryFiles: [...prev.galleryFiles, ...files],
      images: [
        ...prev.images,
        ...files.map((f) => ({
          imageUrl: URL.createObjectURL(f),
          isNew: true,
          fileName: f.name,
        })),
      ],
    }));
  };

  const resolveUrl = (img) =>
    typeof img === "string" ? img : img?.imageUrl;

  const handleRemoveImage = (img) => {
    const url = resolveUrl(img);
    setForm((prev) => {
      const nextImages = prev.images.filter((i) => resolveUrl(i) !== url);
      let nextFiles = prev.galleryFiles;
      if (img.isNew && img.fileName) {
        let removed = false;
        nextFiles = prev.galleryFiles.filter((f) => {
          if (!removed && f.name === img.fileName) {
            removed = true;
            return false;
          }
          return true;
        });
      }
      return { ...prev, images: nextImages, galleryFiles: nextFiles };
    });
  };

  const filteredHotels = hotels;

  return (
    <div className="w-full p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Hotel Management</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage hotel inventory and details</p>
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
          + Add Hotel
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="w-full border border-neutral-200 bg-white px-4 py-2.5 rounded-lg mb-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
        placeholder="Search hotel..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p className="text-sm text-neutral-600 mb-2 font-medium">Loading...</p>}

      {/* TABLE */}
      <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary-50 border-b border-primary-200">
            <tr>
              {["Code", "Name", "City", "Price Range", "Rating", "Status", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-700">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredHotels.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-neutral-500">
                  No hotels found
                </td>
              </tr>
            ) : (
              filteredHotels.map((h) => (
                <tr key={h.hotelID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                  <td className="px-4 py-2">{h.hotelCode}</td>
                  <td className="px-4 py-2 font-medium">{h.hotelName}</td>
                  <td className="px-4 py-2">{h.cityName || h.cityID}</td>
                  <td className="px-4 py-2">
                    {h.priceMin && h.priceMax 
                      ? `$${h.priceMin} - $${h.priceMax}`
                      : h.priceMin 
                        ? `From $${h.priceMin}`
                        : h.priceMax
                          ? `Up to $${h.priceMax}`
                          : "-"}
                  </td>
                  <td className="px-4 py-2">{h.rating ? `${h.rating} ⭐` : "-"}</td>
                  <td className="px-4 py-2">{h.status === 1 ? "Active" : "Inactive"}</td>

                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => {
                        setEditing(h);
                        setForm(toForm(h));
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
                          const hotelDetail = await getHotelById(h.hotelID);
                          setDetailHotel(normalizeHotel(hotelDetail));
                          setOpenDetail(true);
                        } catch (err) {
                          console.error("Load hotel detail error:", err);
                          toast.error("Failed to load hotel details");
                        }
                      }}
                      className="bg-accent-500 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-accent-600 shadow-sm transition font-medium"
                    >
                      View
                    </button>

                    <button
                      onClick={() => handleDelete(h)}
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
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide opacity-90">
                  {editing ? "Update hotel" : "Create hotel"}
                </p>
                <h3 className="text-lg font-semibold">
                  {editing ? `Editing ${form.hotelCode || "hotel"}` : "Add new hotel"}
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
              {/* Basic info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Basic info</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-500">Hotel Code</label>
                      <input
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.hotelCode ? "border-red-500" : "border-neutral-200"}`}
                        value={form.hotelCode}
                        onChange={(e) => setForm({ ...form, hotelCode: e.target.value })}
                        placeholder="e.g. HOTEL001"
                      />
                      {errors.hotelCode && <p className="text-xs text-red-500 mt-1">{errors.hotelCode}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Hotel Name</label>
                      <input
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.hotelName ? "border-red-500" : "border-neutral-200"}`}
                        value={form.hotelName}
                        onChange={(e) => setForm({ ...form, hotelName: e.target.value })}
                        placeholder="e.g. Grand Hotel"
                      />
                      {errors.hotelName && <p className="text-xs text-red-500 mt-1">{errors.hotelName}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">City</label>
                      <select
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.cityID ? "border-red-500" : "border-neutral-200"}`}
                        value={form.cityID}
                        onChange={(e) => setForm({ ...form, cityID: e.target.value })}
                      >
                        <option value="">-- Select City --</option>
                        {cities.map((c) => (
                          <option key={c.cityID} value={c.cityID}>
                            {c.cityName}
                          </option>
                        ))}
                      </select>
                      {errors.cityID && <p className="text-xs text-red-500 mt-1">{errors.cityID}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Address</label>
                      <input
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Street address"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Pricing & rating</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500">Min Price</label>
                      <input
                        type="number"
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.priceMin ? "border-red-500" : "border-neutral-200"}`}
                        value={form.priceMin}
                        onChange={(e) => setForm({ ...form, priceMin: e.target.value })}
                        min={0}
                        step="0.01"
                        placeholder="0"
                      />
                      {errors.priceMin && <p className="text-xs text-red-500 mt-1">{errors.priceMin}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Max Price</label>
                      <input
                        type="number"
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.priceMax ? "border-red-500" : "border-neutral-200"}`}
                        value={form.priceMax}
                        onChange={(e) => setForm({ ...form, priceMax: e.target.value })}
                        min={0}
                        step="0.01"
                        placeholder="0"
                      />
                      {errors.priceMax && <p className="text-xs text-red-500 mt-1">{errors.priceMax}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Rating</label>
                      <input
                        type="number"
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.rating ? "border-red-500" : "border-neutral-200"}`}
                        value={form.rating}
                        onChange={(e) => setForm({ ...form, rating: e.target.value })}
                        min={0}
                        max={5}
                        step="0.1"
                        placeholder="0-5"
                      />
                      {errors.rating && <p className="text-xs text-red-500 mt-1">{errors.rating}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Status</label>
                      <select
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value={1}>Active</option>
                        <option value={0}>Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Contact information</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-500">Phone Number</label>
                      <input
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        placeholder="+84..."
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">Email</label>
                      <input
                        type="email"
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="hotel@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Hotel details</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500">Rooms</label>
                      <input
                        type="number"
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.numberOfRooms}
                        onChange={(e) => setForm({ ...form, numberOfRooms: e.target.value })}
                        min={0}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">Floors</label>
                      <input
                        type="number"
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.numberOfFloors}
                        onChange={(e) => setForm({ ...form, numberOfFloors: e.target.value })}
                        min={0}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">Year Built</label>
                      <input
                        type="number"
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.yearBuilt}
                        onChange={(e) => setForm({ ...form, yearBuilt: e.target.value })}
                        min={1800}
                        max={new Date().getFullYear()}
                        placeholder="2020"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Facilities & Food */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Facilities</p>
                  <textarea
                    className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                    rows={4}
                    value={form.facilities}
                    onChange={(e) => setForm({ ...form, facilities: e.target.value })}
                    placeholder="WiFi, Pool, Gym, Spa..."
                  />
                </div>

                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Food Specialty</p>
                  <textarea
                    className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                    rows={4}
                    value={form.foodSpecialty}
                    onChange={(e) => setForm({ ...form, foodSpecialty: e.target.value })}
                    placeholder="Local cuisine, International buffet..."
                  />
                </div>
              </div>

              {/* Description & Image */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Description</p>
                  <textarea
                    className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                    rows={5}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Hotel description..."
                  />
                </div>

                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Images</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs text-neutral-500">Main Image</label>
                      <div className="border-2 border-dashed border-neutral-200 rounded-lg p-3 bg-neutral-50">
                        <input type="file" accept="image/*" onChange={handleMainImage} />
                        {form.imageUrl && (
                          <img src={form.imageUrl} alt="preview" className="h-28 mt-2 rounded-lg border object-cover w-full" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-neutral-500">Gallery Images</label>
                      <div className="border-2 border-dashed border-neutral-200 rounded-lg p-3 bg-neutral-50">
                        <input type="file" multiple accept="image/*" onChange={handleAddGallery} />
                        <div className="grid grid-cols-3 gap-3 mt-2">
                          {form.images.map((img, i) => (
                            <div key={i} className="relative group">
                              <img src={typeof img === "string" ? img : img.imageUrl} className="h-20 w-full object-cover rounded border" />
                              <button
                                onClick={() => handleRemoveImage(img)}
                                className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full bg-red-600 text-white text-xs shadow-lg opacity-0 group-hover:opacity-100"
                                aria-label="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
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
      {openDetail && detailHotel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-3xl w-full shadow-xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Hotel Detail - {detailHotel.hotelCode}
              </h3>
              <button
                onClick={() => setOpenDetail(false)}
                className="text-neutral-700 hover:text-neutral-900"
              >
                ✖
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-semibold">Code:</span> {detailHotel.hotelCode}</div>
              <div><span className="font-semibold">Name:</span> {detailHotel.hotelName}</div>
              <div><span className="font-semibold">City:</span> {detailHotel.cityID}</div>
              <div><span className="font-semibold">Address:</span> {detailHotel.address || "-"}</div>
              <div><span className="font-semibold">Price Range:</span> {
                detailHotel.priceMin && detailHotel.priceMax 
                  ? `$${detailHotel.priceMin} - $${detailHotel.priceMax}`
                  : detailHotel.priceMin 
                    ? `From $${detailHotel.priceMin}`
                    : detailHotel.priceMax
                      ? `Up to $${detailHotel.priceMax}`
                      : "-"}
              </div>
              <div><span className="font-semibold">Rating:</span> {detailHotel.rating ? `${detailHotel.rating} ⭐` : "-"}</div>
              <div><span className="font-semibold">Status:</span> {detailHotel.status === 1 ? "Active" : "Inactive"}</div>
              <div><span className="font-semibold">Phone:</span> {detailHotel.phoneNumber || "-"}</div>
              <div><span className="font-semibold">Email:</span> {detailHotel.email || "-"}</div>
              <div><span className="font-semibold">Rooms:</span> {detailHotel.numberOfRooms || "-"}</div>
              <div><span className="font-semibold">Floors:</span> {detailHotel.numberOfFloors || "-"}</div>
              <div><span className="font-semibold">Year Built:</span> {detailHotel.yearBuilt || "-"}</div>
              <div><span className="font-semibold">Created:</span> {detailHotel.createdAt ? new Date(detailHotel.createdAt).toLocaleDateString() : "-"}</div>
              <div><span className="font-semibold">Updated:</span> {detailHotel.updatedAt ? new Date(detailHotel.updatedAt).toLocaleDateString() : "-"}</div>
            </div>

            {detailHotel.facilities && (
              <div className="mt-3 text-sm">
                <span className="font-semibold">Facilities:</span> {detailHotel.facilities}
              </div>
            )}

            {detailHotel.foodSpecialty && (
              <div className="mt-3 text-sm">
                <span className="font-semibold">Food Specialty:</span> {detailHotel.foodSpecialty}
              </div>
            )}

            {detailHotel.description && (
              <div className="mt-3 text-sm">
                <span className="font-semibold">Description:</span> {detailHotel.description}
              </div>
            )}

            {(detailHotel.imageUrl || (detailHotel.images && detailHotel.images.length > 0)) && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Images</p>
                {detailHotel.imageUrl && (
                  <div className="mb-3">
                    <p className="text-xs text-neutral-500 mb-1">Main Image</p>
                    <img src={detailHotel.imageUrl} className="h-48 w-full object-cover rounded border" />
                  </div>
                )}
                {detailHotel.images && detailHotel.images.length > 0 && (
                  <div>
                    <p className="text-xs text-neutral-500 mb-1">Gallery Images</p>
                    <div className="grid grid-cols-4 gap-3">
                      {detailHotel.images.map((img, i) => (
                        <img
                          key={i}
                          src={typeof img === "string" ? img : (img.imageUrl || img)}
                          className="h-24 w-full object-cover rounded border"
                          alt={`Gallery ${i + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}
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

