import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import {
  searchTours,
  createTour,
  updateTour,
  getAllTourCategories,
  deleteTour,
} from "../../../services/staff/tourStaffService";
import { deleteImage } from "../../../services/staff/imageService";
import { toast } from "../../shared/toast/toast";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";

// Form chỉ quản lý mức "khung Tour" (bảng Tours), không kiêm luôn TourDetail
const emptyForm = {
  tourID: null,
  tourCode: "",
  tourName: "",
  nation: "",
  startingLocation: "",
  duration: "",
  status: 1,
  categoryID: "",
  tourImg: "",
  mainImageFile: null,
  galleryFiles: [],
  images: [],
};

export default function TourManagement() {
  const [tours, setTours] = useState([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const [openDetail, setOpenDetail] = useState(false);
  const [detailTour, setDetailTour] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const MAX_GALLERY = 4;

  const toAbsoluteUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    const normalized = url.replace(/^\/+/, "");
    return base ? `${base}/${normalized}` : `/${normalized}`;
  };

  const normalizeTour = (t) => {
    if (!t) return t;

    // Backend trả về: details (array) và field tiện lợi detail (đợt đầu tiên)
    const detail = t.detail;
    const details = t.details || (detail ? [detail] : []);

    return {
      ...t,
      tourImg: toAbsoluteUrl(t.tourImg),
      detail,
      details,
    };
  };

  const loadTours = async () => {
    setLoading(true);
    try {
      const res = await searchTours({
        page,
        size,
        keyword: search || undefined,
      });
      const mapped = (res.items || []).map(normalizeTour);
      setTours(mapped);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      toast.error(err?.message || "Failed to load tours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTours();
    getAllTourCategories().then(setCategories);
  }, []);

  useEffect(() => {
    const t = setTimeout(loadTours, 400);
    return () => clearTimeout(t);
  }, [search, page]);

  const toForm = (t) => ({
    ...emptyForm,
    ...t,
    tourImg: toAbsoluteUrl(t.tourImg),
    images:
      t.detail?.images?.map((i) => ({
        imageID: i.imageID,
        imageUrl: toAbsoluteUrl(i.imageUrl),
        isNew: false,
      })) || [],
  });

  const toPayload = (f) => ({
    tourCode: f.tourCode,
    tourName: f.tourName,
    nation: f.nation,
    startingLocation: f.startingLocation,
    duration: f.duration,
    status: Number(f.status),
    categoryID: Number(f.categoryID),
    // Không gửi TourDetail ở đây – TourDetails sẽ được quản lý ở màn hình khác
  });

  const validate = () => {
    const e = {};
    if (!form.tourCode) e.tourCode = "Required";
    if (!form.tourName) e.tourName = "Required";
    if (!form.categoryID) e.categoryID = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please fix validation errors");
      return;
    }

    const payload = toPayload(form);
    setSaving(true);

    try {
      if (editing) {
        await updateTour(editing.tourID, {
          tour: payload,
          mainImage: form.mainImageFile,
          galleryImages: form.galleryFiles,
        });
        toast.success("Tour updated successfully");
      } else {
        await createTour({
          tour: payload,
          mainImage: form.mainImageFile,
          galleryImages: form.galleryFiles,
        });
        toast.success("Tour created successfully");
      }

      setOpenModal(false);
      setEditing(null);
      setForm(emptyForm);
      loadTours();
    } catch (err) {
      toast.error(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tour) => {
        setConfirmDialog({
            isOpen: true,
            title: "Delete Tour",
            message: `Are you sure you want to delete tour ${tour.tourCode}? This action cannot be undone.`,
            onConfirm: async () => {
                setSaving(true);
                try {
                    await deleteTour(tour.tourID);
                    toast.success("Tour deleted successfully");
                    loadTours();
                } catch (err) {
                    toast.error(err?.message || "Delete failed");
                } finally {
                    setSaving(false);
                }
            },
        });
    };

  const handleMainImage = (e) =>
    setForm({
      ...form,
      mainImageFile: e.target.files?.[0] || null,
      tourImg: e.target.files?.[0]
        ? URL.createObjectURL(e.target.files[0])
        : form.tourImg,
    });

  const handleAddGallery = (e) => {
    const files = [...(e.target.files || [])];
    setForm((prev) => {
      const currentCount = prev.images.length;
      const allowed = Math.max(0, MAX_GALLERY - currentCount);
      if (allowed === 0) {
        toast.warning(`Maximum ${MAX_GALLERY} gallery images allowed`);
        return prev;
      }
      const accepted = files.slice(0, allowed);
      if (accepted.length < files.length) {
        toast.warning(`Maximum ${MAX_GALLERY} gallery images allowed`);
      }
      return {
        ...prev,
        galleryFiles: [...prev.galleryFiles, ...accepted],
        images: [
          ...prev.images,
          ...accepted.map((f) => ({
            imageUrl: URL.createObjectURL(f),
            isNew: true,
            fileName: f.name,
          })),
        ],
      };
    });
  };

    const handleRemoveImage = async (img, idx) => {
        // If existing image, call API to delete
        if (img.imageID) {
            try {
                await deleteImage(img.imageID);
                toast.success("Image deleted successfully");
            } catch (err) {
                toast.error(err?.message || "Failed to delete image");
                return;
            }
        }

        setForm((prev) => {
            const nextImages = prev.images.filter((_, i) => i !== idx);
            let nextGalleryFiles = prev.galleryFiles;
            // If this was a newly added file, remove corresponding file by preview name
            if (!img.imageID && img.isNew) {
                const targetName = img.fileName;
                let removed = false;
                nextGalleryFiles = prev.galleryFiles.filter((f) => {
                    if (!removed && f.name === targetName) {
                        removed = true;
                        return false;
                    }
                    return true;
                });
            }
            return { ...prev, images: nextImages, galleryFiles: nextGalleryFiles };
        });
    };


  const filteredTours = tours;

  return (
        <div className="w-full p-6">
            <div className="flex justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900">Tour Management</h2>
                    <p className="text-sm text-neutral-600 mt-1">Manage tour packages and pricing</p>
                </div>
                <button
                    className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all"
                    onClick={() => {
                        setEditing(null);
                        setForm(emptyForm);
                        setOpenModal(true);
                    }}
                >
                    + Add Tour
                </button>
            </div>

            <input
                className="w-full border border-neutral-200 bg-white px-4 py-2.5 rounded-lg mb-4 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition"
                placeholder="Search tour..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                }}
            />

            {/* TABLE */}
            <div className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-primary-50 border-b border-primary-200">
                        <tr>
                            {["Code", "Name", "Category", "Departures", "Status", "Actions"].map(
                                (h) => (
                                    <th key={h} className="px-4 py-3 text-left font-semibold text-neutral-700">
                                        {h}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {filteredTours.map((t) => (
                            <tr key={t.tourID} className="border-b border-neutral-100 hover:bg-primary-50/30 transition">
                                <td className="px-4 py-2">{t.tourCode}</td>
                                <td className="px-4 py-2">{t.tourName}</td>
                                <td className="px-4 py-2">
                                  {t.categoryName || t.category?.categoryName || t.categoryID}
                                </td>
                                <td className="px-4 py-2">
                                  {t.details?.length ?? (t.detail ? 1 : 0)}
                                </td>
                                <td className="px-4 py-2">
                                    {t.status === 1 ? "Active" : "Inactive"}
                                </td>

                                <td className="px-4 py-2 space-x-2">
                                    <button
                                        className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-primary-700 shadow-sm transition font-medium"
                                        onClick={() => {
                                            setEditing(t);
                                            setForm(toForm(t));
                                            setErrors({});
                                            setOpenModal(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-accent-500 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-accent-600 shadow-sm transition font-medium"
                                        onClick={() => {
                                            setDetailTour(normalizeTour(t));
                                            setOpenDetail(true);
                                        }}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 shadow-sm transition font-medium"
                                        onClick={() => handleDelete(t)}
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

            {/* ========== MODAL ========== */}
            {openModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                        <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide opacity-90">
                                    {editing ? "Update tour" : "Create tour"}
                                </p>
                                <h3 className="text-lg font-semibold">
                                    {editing ? `Editing ${form.tourCode || "tour"}` : "Add new tour"}
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
                                            <label className="text-xs text-neutral-500">Tour Code</label>
                                            <input
                                                className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.tourCode ? "border-red-500" : "border-neutral-200"}`}
                                                value={form.tourCode}
                                                onChange={(e) => setForm({ ...form, tourCode: e.target.value })}
                                                placeholder="e.g. TOUR001"
                                            />
                                            {errors.tourCode && <p className="text-xs text-red-500 mt-1">{errors.tourCode}</p>}
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-500">Tour Name</label>
                                            <input
                                                className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.tourName ? "border-red-500" : "border-neutral-200"}`}
                                                value={form.tourName}
                                                onChange={(e) => setForm({ ...form, tourName: e.target.value })}
                                                placeholder="Amazing Vietnam"
                                            />
                                            {errors.tourName && <p className="text-xs text-red-500 mt-1">{errors.tourName}</p>}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs text-neutral-500">Country</label>
                                                <input
                                                    className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                                                    value={form.nation}
                                                    onChange={(e) => setForm({ ...form, nation: e.target.value })}
                                                    placeholder="Vietnam"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-neutral-500">Duration</label>
                                                <input
                                                    className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                                                    value={form.duration}
                                                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                                    placeholder="3 days 2 nights"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-500">Starting Location</label>
                                            <input
                                                className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                                                value={form.startingLocation}
                                                onChange={(e) => setForm({ ...form, startingLocation: e.target.value })}
                                                placeholder="Hanoi"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-neutral-500">Category</label>
                                            <select
                                                className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${errors.categoryID ? "border-red-500" : "border-neutral-200"}`}
                                                value={form.categoryID}
                                                onChange={(e) => setForm({ ...form, categoryID: e.target.value })}
                                            >
                                                <option value="">-- Select Category --</option>
                                                {categories.map((c) => (
                                                    <option key={c.categoryID} value={c.categoryID}>
                                                        {c.categoryName}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.categoryID && <p className="text-xs text-red-500 mt-1">{errors.categoryID}</p>}
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

                                <div className="bg-white border rounded-xl p-4 shadow-sm">
                                    <p className="font-semibold text-neutral-800 mb-3">
                                      Images
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-xs text-neutral-500">Main Image</label>
                                            <div className="border-2 border-dashed border-neutral-200 rounded-lg p-3 bg-neutral-50">
                                                <input type="file" accept="image/*" onChange={handleMainImage} />
                                                {form.tourImg && (
                                                    <img src={form.tourImg} className="h-28 mt-2 rounded-lg border object-cover w-full" />
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
                                                            <img
                                                                src={img.imageUrl || img}
                                                                className="h-20 w-full object-cover rounded border"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(img, i)}
                                                                className="hidden group-hover:flex absolute top-1 right-1 h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs shadow-lg"
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

                            {/* Gợi ý quy trình: TourDetails & lịch trình quản lý ở màn khác */}
                            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-4 py-3">
                              Sau khi tạo khung tour, hãy vào phần quản lý đợt khởi hành
                              (Tour Details) và lịch trình (Tour Schedules) để cấu hình ngày đi,
                              giá và hoạt động chi tiết cho từng đợt.
                            </div>

                            {/* Images block moved above */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-white border rounded-xl p-4 shadow-sm">
                                    {/* cột phải để trống hoặc mở rộng thêm field tourDescription nếu cần */}
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
                                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-60"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAIL MODAL */}
            {openDetail && detailTour && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
                    <div className="bg-white p-6 rounded-xl max-w-3xl w-full shadow-xl overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-neutral-900">
                                Tour Detail - {detailTour.tourCode}
                            </h3>
                            <button
                                onClick={() => setOpenDetail(false)}
                                className="text-neutral-700 hover:text-neutral-900"
                            >
                                ✖
                            </button>
                        </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><span className="font-semibold">Name:</span> {detailTour.tourName}</div>
                            <div><span className="font-semibold">Code:</span> {detailTour.tourCode}</div>
                            <div><span className="font-semibold">Category:</span> {detailTour.categoryName || detailTour.category?.categoryName || detailTour.categoryID}</div>
                            <div><span className="font-semibold">Status:</span> {detailTour.status === 1 ? "Active" : "Inactive"}</div>
                            <div><span className="font-semibold">Nation:</span> {detailTour.nation}</div>
                            <div><span className="font-semibold">Duration:</span> {detailTour.duration}</div>
                            <div><span className="font-semibold">Start:</span> {detailTour.startingLocation}</div>
                            <div><span className="font-semibold">Total departures:</span> {detailTour.details?.length ?? (detailTour.detail ? 1 : 0)}</div>
                            <div><span className="font-semibold">Updated:</span> {detailTour.updatedAt || "-"}</div>
                        </div>

                        {/* Danh sách các đợt khởi hành (TourDetails) */}
                        {(detailTour.details && detailTour.details.length > 0) && (
                          <div className="mt-4">
                            <p className="font-semibold mb-2">Departures</p>
                            <table className="w-full text-xs border border-neutral-200 rounded-lg overflow-hidden">
                              <thead className="bg-neutral-50">
                                <tr>
                                  <th className="px-2 py-1 text-left">Departure</th>
                                  <th className="px-2 py-1 text-left">Arrival</th>
                                  <th className="px-2 py-1 text-right">Price</th>
                                  <th className="px-2 py-1 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detailTour.details.map((d) => (
                                  <tr key={d.tourDetailID} className="border-t border-neutral-100">
                                    <td className="px-2 py-1">
                                      {d.departureDate ? d.departureDate.substring(0, 10) : "-"}
                                    </td>
                                    <td className="px-2 py-1">
                                      {d.arrivalDate ? d.arrivalDate.substring(0, 10) : "-"}
                                    </td>
                                    <td className="px-2 py-1 text-right">
                                      {d.unitPrice}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                      {d.status === 1 ? "Active" : "Inactive"}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {(detailTour.tourImg || detailTour.detail?.images?.length) ? (
                            <div className="mt-4 space-y-2">
                                <p className="font-semibold mb-2">Images</p>
                                {detailTour.tourImg && (
                                    <div>
                                        <p className="text-xs text-neutral-500 mb-1">Main image</p>
                                        <img
                                            src={toAbsoluteUrl(detailTour.tourImg)}
                                            className="h-32 w-full object-cover rounded border"
                                        />
                                    </div>
                                )}
                                {(detailTour.detail?.images || []).length > 0 && (
                                    <div>
                                        <p className="text-xs text-neutral-500 mb-1">Gallery</p>
                                        <div className="grid grid-cols-4 gap-3">
                                            {(detailTour.detail?.images || []).map((img, i) => (
                                                <img
                                                    key={i}
                                                    src={toAbsoluteUrl(img.imageUrl || img)}
                                                    className="h-24 w-full object-cover rounded border"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}

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
