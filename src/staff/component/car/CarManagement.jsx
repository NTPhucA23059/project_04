import React, { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import {
  searchCars,
  createCar,
  updateCarMultipart,
  getAllCarTypes,
  deleteCar,
} from "../../../services/staff/carStaffService";
import { toast } from "../../shared/toast/toast";

const emptyForm = {
  carID: null,
  carCode: "",
  modelName: "",
  brand: "",
  carTypeID: "",
  seatingCapacity: "",
  dailyRate: "",
  status: 1,
  hasAirConditioner: true,
  hasDriverOption: true,
  selfDriveAllowed: true,
  fuelType: "",
  transmission: "",
  modelYear: "",
  plateNumber: "",
  note: "",
  image: "",
  images: [],
  mainImageFile: null,
  galleryFiles: [],
};

export default function CarManagement() {
  // ================= STATE =================
  const [cars, setCars] = useState([]);
  const [search, setSearch] = useState("");
  const [carTypes, setCarTypes] = useState([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [openDetail, setOpenDetail] = useState(false);
  const [detailCar, setDetailCar] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, car: null, error: null, deleting: false });

  // ================= LOAD DATA =================
  const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    const normalized = url.replace(/^\/+/, "");
    return base ? `${base}/${normalized}` : `/${normalized}`;
  };

  const normalizeCar = (c) => {
    if (!c) return c;
    return {
      ...c,
      image: toAbsoluteUrl(c.image),
      images: (c.images || []).map((i) => ({
        ...i,
        imageUrl: toAbsoluteUrl(i.imageUrl || i),
      })),
    };
  };

  const loadCars = async () => {
    setLoading(true);
    try {
      const res = await searchCars({ page, size, keyword: search || undefined });
      setCars((res.items || []).map(normalizeCar));
      setTotalPages(res.totalPages || 0);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Load cars error:", err.response?.data || err.message || err);
      toast.error(err.message || "Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
    getAllCarTypes().then(setCarTypes).catch(() => { });
  }, []);

  useEffect(() => {
    const id = setTimeout(loadCars, 400);
    return () => clearTimeout(id);
  }, [search, page]);

  // ================= MAP HELPERS =================
  const toForm = (c) => ({
    carID: c.carID,
    carCode: c.carCode || "",
    modelName: c.modelName || "",
    brand: c.brand || "",
    carTypeID: c.carTypeID || "",
    seatingCapacity: c.seatingCapacity ?? "",
    dailyRate: Number(c.dailyRate ?? ""),
    status: c.status ?? 1,
    hasAirConditioner: c.hasAirConditioner ?? true,
    hasDriverOption: c.hasDriverOption ?? true,
    selfDriveAllowed: c.selfDriveAllowed ?? true,
    fuelType: c.fuelType || "",
    transmission: c.transmission || "",
    modelYear: c.modelYear || "",
    plateNumber: c.plateNumber || "",
    note: c.note || "",
    image: toAbsoluteUrl(c.image) || "",
    images: (c.images || []).map((i) => ({
      imageUrl: toAbsoluteUrl(i.imageUrl || i),
      isNew: false,
    })),
    mainImageFile: null,
    galleryFiles: [],
  });

  const toPayload = (f) => ({
    carTypeID: f.carTypeID ? Number(f.carTypeID) : null,
    carCode: f.carCode,
    brand: f.brand,
    modelName: f.modelName,
    seatingCapacity: f.seatingCapacity ? Number(f.seatingCapacity) : null,
    fuelType: f.fuelType,
    transmission: f.transmission,
    modelYear: f.modelYear ? Number(f.modelYear) : null,
    hasAirConditioner: !!f.hasAirConditioner,
    hasDriverOption: !!f.hasDriverOption,
    selfDriveAllowed: !!f.selfDriveAllowed,
    dailyRate: f.dailyRate === "" ? null : Number(f.dailyRate),
    plateNumber: f.plateNumber,
    status: f.status === "" ? null : Number(f.status),
    note: f.note,
    image: f.image && !String(f.image).startsWith("blob:") ? f.image : null,
    // Only send existing URLs (skip blob previews); backend expects objects
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

  // ================= VALIDATE =================
  const validate = () => {
    const e = {};
    if (!form.carCode.trim()) e.carCode = "Car code required";
    if (!form.modelName.trim()) e.modelName = "Model required";
    if (!form.brand.trim()) e.brand = "Brand required";
    if (!form.carTypeID) e.carTypeID = "Car type required";
    if (!form.seatingCapacity || Number(form.seatingCapacity) <= 0) e.seatingCapacity = "Capacity > 0";
    if (form.dailyRate === "" || Number(form.dailyRate) < 0) e.dailyRate = "Rate >= 0";
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
        await updateCarMultipart({
          id: editing.carID,
          car: payload,
          mainImage: form.mainImageFile,
          galleryImages: form.galleryFiles,
        });
        toast.success("Car updated successfully");
      } else {
        const { mainImageFile, galleryFiles } = form;
        delete payload.images;
        delete payload.image;
        await createCar({
          car: payload,
          mainImage: mainImageFile,
          galleryImages: galleryFiles,
        });
        toast.success("Car created successfully");
      }
      setOpenModal(false);
      setEditing(null);
      setForm(emptyForm);
      loadCars();
    } catch (err) {
      console.error("Save car error:", err.response?.data || err.message || err);
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ================= ACTIONS =================
  const handleDelete = (car) => {
    setDeleteConfirm({ isOpen: true, car: car, error: null, deleting: false });
  };

  const confirmDeleteCar = async () => {
    if (!deleteConfirm.car || deleteConfirm.deleting) return;

    try {
      setDeleteConfirm(prev => ({ ...prev, deleting: true, error: null }));
      await deleteCar(deleteConfirm.car.carID);
      toast.success("Car deleted successfully");
      setDeleteConfirm({ isOpen: false, car: null, error: null, deleting: false });
      loadCars();
    } catch (err) {
      console.error("Delete car error:", err.response?.data || err.message || err);
      
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
      
      // Check if it's a constraint error (car is being used)
      if (backendMsg.toLowerCase().includes("booking") || 
          backendMsg.toLowerCase().includes("using") ||
          backendMsg.toLowerCase().includes("cannot delete") ||
          backendMsg.toLowerCase().includes("associated")) {
        
        // Extract number of bookings if available
        const countMatch = backendMsg.match(/\d+/);
        const count = countMatch ? countMatch[0] : "some";
        
        userFriendlyMsg = `This car is currently associated with ${count} booking(s). You cannot delete it until you cancel or process those bookings first.`;
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "This car no longer exists. Please refresh the page.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to delete this car. Please try again later or contact support if the problem persists.";
      } else {
        userFriendlyMsg = "Unable to delete this car. Please check your connection and try again.";
      }

      // Show error in dialog and toast
      setDeleteConfirm(prev => ({ ...prev, error: userFriendlyMsg, deleting: false }));
      toast.error(userFriendlyMsg);
    }
  };

  // ================= IMAGE HANDLER =================
  const handleMainImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm({ ...form, mainImageFile: file, image: URL.createObjectURL(file) });
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

  const filteredCars = useMemo(
    () =>
      cars.filter((c) => {
        const kw = search.toLowerCase();
        return (
          (c.carCode || "").toLowerCase().includes(kw) ||
          (c.modelName || "").toLowerCase().includes(kw) ||
          (c.brand || "").toLowerCase().includes(kw)
        );
      }),
    [cars, search]
  );

  return (
    <div className="w-full p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Car Management</h2>
          <p className="text-sm text-neutral-600 mt-1">Manage car inventory and details</p>
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
          + Add Car
        </button>
      </div>

      {/* SEARCH */}
      <input
        className="w-full border border-neutral-200 bg-white px-4 py-2.5 rounded-lg mb-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
        placeholder="Search car..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <p className="text-sm text-neutral-600 mb-2 font-medium">Loading...</p>}

      {/* TABLE */}
      <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-primary-50 border-b border-primary-200">
            <tr>
              {["Code", "Model", "Brand", "Capacity", "Rate", "Status", "Actions"].map(
                (h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-700">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredCars.map((c) => (
              <tr key={c.carID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                <td className="px-4 py-2">{c.carCode}</td>
                <td className="px-4 py-2 font-medium">{c.modelName}</td>
                <td className="px-4 py-2">{c.brand}</td>
                <td className="px-4 py-2">{c.seatingCapacity} seats</td>
                <td className="px-4 py-2">${c.dailyRate}</td>
                <td className="px-4 py-2">{c.status === 1 ? "Active" : "Inactive"}</td>

                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => {
                      setEditing(c);
                      setForm(toForm(c));
                      setErrors({});
                      setOpenModal(true);
                    }}
                    className="bg-primary-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-primary-700 shadow-sm transition font-medium"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => {
                      setDetailCar(c);
                      setOpenDetail(true);
                    }}
                    className="bg-accent-500 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-accent-600 shadow-sm transition font-medium"
                  >
                    View
                  </button>

                  <button
                    onClick={() => handleDelete(c)}
                    className="bg-red-600 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-red-700 shadow-sm transition font-medium"
                    disabled={saving}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
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
                  {editing ? "Update car" : "Create car"}
                </p>
                <h3 className="text-lg font-semibold">
                  {editing ? `Editing ${form.carCode || "car"}` : "Add new car"}
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
                      <label className="text-xs text-neutral-500">Car Code</label>
                      <input
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.carCode ? "border-red-500" : "border-neutral-200"}`}
                        value={form.carCode}
                        onChange={(e) => setForm({ ...form, carCode: e.target.value })}
                        placeholder="e.g. CAR001"
                      />
                      {errors.carCode && <p className="text-xs text-red-500 mt-1">{errors.carCode}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Model</label>
                      <input
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.modelName ? "border-red-500" : "border-neutral-200"}`}
                        value={form.modelName}
                        onChange={(e) => setForm({ ...form, modelName: e.target.value })}
                        placeholder="e.g. Toyota Innova"
                      />
                      {errors.modelName && <p className="text-xs text-red-500 mt-1">{errors.modelName}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Brand</label>
                      <input
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.brand ? "border-red-500" : "border-neutral-200"}`}
                        value={form.brand}
                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                        placeholder="e.g. Toyota"
                      />
                      {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Car Type</label>
                      <select
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.carTypeID ? "border-red-500" : "border-neutral-200"}`}
                        value={form.carTypeID}
                        onChange={(e) => setForm({ ...form, carTypeID: e.target.value })}
                      >
                        <option value="">-- Select --</option>
                        {carTypes.map((t) => (
                          <option key={t.carTypeID} value={t.carTypeID}>
                            {t.typeName}
                          </option>
                        ))}
                      </select>
                      {errors.carTypeID && <p className="text-xs text-red-500 mt-1">{errors.carTypeID}</p>}
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Pricing & status</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500">Daily Rate</label>
                      <input
                        type="number"
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.dailyRate ? "border-red-500" : "border-neutral-200"}`}
                        value={form.dailyRate}
                        onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                        min={0}
                        step="0.01"
                        placeholder="Price/day"
                      />
                      {errors.dailyRate && <p className="text-xs text-red-500 mt-1">{errors.dailyRate}</p>}
                    </div>

                    <div>
                      <label className="text-xs text-neutral-500">Capacity</label>
                      <input
                        type="number"
                        className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.seatingCapacity ? "border-red-500" : "border-neutral-200"}`}
                        value={form.seatingCapacity}
                        onChange={(e) => setForm({ ...form, seatingCapacity: e.target.value })}
                        min={1}
                        placeholder="Seats"
                      />
                      {errors.seatingCapacity && <p className="text-xs text-red-500 mt-1">{errors.seatingCapacity}</p>}
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

                    <div>
                      <label className="text-xs text-neutral-500">Plate Number</label>
                      <input
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.plateNumber}
                        onChange={(e) => setForm({ ...form, plateNumber: e.target.value })}
                        placeholder="XX-9999"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-xs text-neutral-500">Note</label>
                    <textarea
                      className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                      rows={2}
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      placeholder="Extra info for customers or staff"
                    />
                  </div>
                </div>
              </div>

              {/* Specs & options */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Specifications</p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-neutral-500">Fuel Type</label>
                      <input
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.fuelType}
                        onChange={(e) => setForm({ ...form, fuelType: e.target.value })}
                        placeholder="Gasoline / Diesel / EV"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">Transmission</label>
                      <input
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.transmission}
                        onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                        placeholder="Automatic / Manual"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">Model Year</label>
                      <input
                        type="number"
                        className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                        value={form.modelYear}
                        onChange={(e) => setForm({ ...form, modelYear: e.target.value })}
                        placeholder="2024"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-4 shadow-sm">
                  <p className="font-semibold text-neutral-800 mb-3">Options</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, hasAirConditioner: !form.hasAirConditioner })}
                      className={`px-3 py-2 rounded-full text-sm border ${form.hasAirConditioner ? "bg-primary-50 border-primary-300 text-primary-700" : "border-neutral-200 text-neutral-600"}`}
                    >
                      ❄️ Air Conditioner
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, hasDriverOption: !form.hasDriverOption })}
                      className={`px-3 py-2 rounded-full text-sm border ${form.hasDriverOption ? "bg-primary-50 border-primary-300 text-primary-700" : "border-neutral-200 text-neutral-600"}`}
                    >
                      🧑‍✈️ Driver Option
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, selfDriveAllowed: !form.selfDriveAllowed })}
                      className={`px-3 py-2 rounded-full text-sm border ${form.selfDriveAllowed ? "bg-primary-50 border-primary-300 text-primary-700" : "border-neutral-200 text-neutral-600"}`}
                    >
                      🚗 Self Drive
                    </button>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white border rounded-xl p-4 shadow-sm">
                <p className="font-semibold text-neutral-800 mb-3">Images</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs text-neutral-500">Main Image</label>
                    <div className="border-2 border-dashed border-neutral-200 rounded-lg p-3 bg-neutral-50">
                      <input type="file" accept="image/*" onChange={handleMainImage} />
                      {form.image && (
                        <img src={form.image} alt="preview" className="h-28 mt-2 rounded-lg border object-cover w-full" />
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
      {openDetail && detailCar && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                Car Detail - {detailCar.carCode}
              </h3>
              <button
                onClick={() => setOpenDetail(false)}
                className="text-neutral-700 hover:text-neutral-900"
              >
                ✖
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="font-semibold">Code:</span> {detailCar.carCode}</div>
              <div><span className="font-semibold">Model:</span> {detailCar.modelName}</div>
              <div><span className="font-semibold">Brand:</span> {detailCar.brand}</div>
              <div><span className="font-semibold">Type:</span> {detailCar.carType?.typeName || detailCar.carTypeID}</div>
              <div><span className="font-semibold">Seats:</span> {detailCar.seatingCapacity}</div>
              <div><span className="font-semibold">Daily Rate:</span> ${detailCar.dailyRate}</div>
              <div><span className="font-semibold">Status:</span> {detailCar.status === 1 ? "Active" : "Inactive"}</div>
              <div><span className="font-semibold">Fuel:</span> {detailCar.fuelType}</div>
              <div><span className="font-semibold">Transmission:</span> {detailCar.transmission}</div>
              <div><span className="font-semibold">Model Year:</span> {detailCar.modelYear}</div>
              <div><span className="font-semibold">Plate:</span> {detailCar.plateNumber}</div>
              <div><span className="font-semibold">Air Conditioner:</span> {detailCar.hasAirConditioner ? "Yes" : "No"}</div>
              <div><span className="font-semibold">Driver Option:</span> {detailCar.hasDriverOption ? "Yes" : "No"}</div>
              <div><span className="font-semibold">Self Drive:</span> {detailCar.selfDriveAllowed ? "Yes" : "No"}</div>
              <div><span className="font-semibold">Created:</span> {detailCar.createdAt ? detailCar.createdAt : "-"}</div>
              <div><span className="font-semibold">Updated:</span> {detailCar.updatedAt ? detailCar.updatedAt : "-"}</div>
            </div>

            {detailCar.note && (
              <div className="mt-3 text-sm">
                <span className="font-semibold">Note:</span> {detailCar.note}
              </div>
            )}

            {(detailCar.images || detailCar.image) && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Images</p>
                <div className="grid grid-cols-4 gap-3">
                  {detailCar.image && (
                    <img src={detailCar.image} className="h-24 w-full object-cover rounded border" />
                  )}
                  {(detailCar.images || []).map((img, i) => (
                    <img
                      key={i}
                      src={img.imageUrl || img}
                      className="h-24 w-full object-cover rounded border"
                    />
                  ))}
                </div>
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
                    Delete Car
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
                              Cannot Delete This Car
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
                          <li>Go to the Car Bookings management page</li>
                          <li>Find the bookings associated with this car</li>
                          <li>Cancel or process those bookings</li>
                          <li>Then come back here to delete this car</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {deleteConfirm.car
                        ? `Are you sure you want to delete car "${deleteConfirm.car.carCode}"? This action cannot be undone.`
                        : "Are you sure you want to delete this car?"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, car: null, error: null, deleting: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
              >
                {deleteConfirm.error ? "Close" : "Cancel"}
              </button>
              {!deleteConfirm.error && (
                <button
                  onClick={confirmDeleteCar}
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
