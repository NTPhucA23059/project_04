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
import {
  getTourCities,
  createTourCity,
  updateTourCity,
  deleteTourCity,
} from "../../../services/staff/tourCityStaffService";
import {
  getTourDetails,
  createTourDetail,
  updateTourDetail,
  deleteTourDetail,
} from "../../../services/staff/tourDetailStaffService";
import { toast } from "../../shared/toast/toast";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";
import TourFilters from "./TourFilters";
import TourTable from "./TourTable";
import TourFormModal from "./TourFormModal";
import TourDetailModal from "./TourDetailModal";

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

  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

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

  // Data for editing (in modal)
  const [tourCities, setTourCities] = useState([]);
  const [tourDetails, setTourDetails] = useState([]);

  // Data for view detail modal (summary for staff)
  const [viewCities, setViewCities] = useState([]);
  const [viewDetails, setViewDetails] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  // Post-create nice prompt (instead of window.confirm)
  const [postCreateDialog, setPostCreateDialog] = useState({
    isOpen: false,
    tour: null,
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
        status:
          statusFilter === "" || statusFilter === "all"
            ? undefined
            : Number(statusFilter),
        categoryId: categoryFilter || undefined,
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
    // Gallery images now come directly from Tour.images (not from TourDetail)
    images:
      (t.images || []).map((i) => ({
        imageID: i.imageID,
        imageUrl: toAbsoluteUrl(i.imageUrl),
        isNew: false,
      })) || [],
  });

  const toPayload = (f) => {
    const payload = {
      tourCode: f.tourCode?.trim() || "",
      tourName: f.tourName?.trim() || "",
      startingLocation: f.startingLocation?.trim() || "",
      status: f.status != null ? Number(f.status) : 1,
      categoryID: f.categoryID ? Number(f.categoryID) : null,
    };
    
    // Optional fields
    if (f.nation?.trim()) payload.nation = f.nation.trim();
    if (f.duration?.trim()) payload.duration = f.duration.trim();
    if (f.tourDescription?.trim()) payload.tourDescription = f.tourDescription.trim();
    
    return payload;
  };

  const validate = () => {
    const e = {};
    if (!form.tourCode?.trim()) e.tourCode = "Required";
    if (!form.tourName?.trim()) e.tourName = "Required";
    if (!form.startingLocation?.trim()) e.startingLocation = "Required";
    if (!form.categoryID) e.categoryID = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleOpenEdit = async (t) => {
    setEditing(t);
    setForm(toForm(t));
    setErrors({});
    setOpenModal(true);

    // Load TourCities and TourDetails
    if (t.tourID) {
      try {
        const [cities, details] = await Promise.all([
          getTourCities(t.tourID),
          getTourDetails(t.tourID),
        ]);
        setTourCities(cities);
        setTourDetails(details);
      } catch (err) {
        console.error("Failed to load tour cities/details:", err);
      }
    }
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
        const result = await createTour({
          tour: payload,
          mainImage: form.mainImageFile,
          galleryImages: form.galleryFiles,
        });
        toast.success("Tour created successfully");

        // Mở dialog đẹp hỏi người dùng có muốn cấu hình thành phố & đợt khởi hành luôn không
        const createdTour = result?.data || result;
        if (createdTour && createdTour.tourID) {
          setPostCreateDialog({
            isOpen: true,
            tour: createdTour,
          });
        }
      }

      setOpenModal(false);
      setEditing(null);
      setForm(emptyForm);
      setTourCities([]);
      setTourDetails([]);
      loadTours();
    } catch (err) {
      const status = err?.response?.status;
      const backendMsg = err?.response?.data?.message;
      const errorMessage = backendMsg || err?.message || "Save failed";

      // Ưu tiên bắt lỗi trùng code cho thao tác tạo mới
      if (!editing && status === 400) {
        setErrors((prev) => ({
          ...prev,
          tourCode:
            backendMsg ||
            "Tour code is invalid or already exists. Please use a different code.",
        }));
        toast.error(
          backendMsg ||
            "Tour code is invalid or already exists. Please use a different code."
        );
      } else {
        toast.error(errorMessage);
      }
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
                    <p className="text-sm text-neutral-600 mt-1">
                      Manage tour frames (Tours) before configuring departures and schedules
                    </p>
                </div>
                <button
                    className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all"
                    onClick={() => {
                        setEditing(null);
                        setForm(emptyForm);
                        setErrors({});
                        setTourCities([]);
                        setTourDetails([]);
                        setOpenModal(true);
                    }}
                >
                    + Add Tour
                </button>
            </div>

            <TourFilters
              search={search}
              statusFilter={statusFilter}
              categoryFilter={categoryFilter}
              categories={categories}
              onSearchChange={(value) => {
                setSearch(value);
                setPage(0);
              }}
              onStatusChange={(value) => {
                setStatusFilter(value);
                setPage(0);
              }}
              onCategoryChange={(value) => {
                setCategoryFilter(value);
                setPage(0);
              }}
              onClear={() => {
                setSearch("");
                setStatusFilter("");
                setCategoryFilter("");
                setPage(0);
              }}
            />

            <TourTable
              tours={filteredTours}
              loading={loading}
              saving={saving}
              onEdit={handleOpenEdit}
              onView={async (t) => {
                const normalized = normalizeTour(t);
                setDetailTour(normalized);
                // Clear previous view data first
                setViewCities([]);
                setViewDetails([]);
                setOpenDetail(true);

                // Load full route cities & departures for this tour to show summary
                if (t.tourID) {
                  try {
                    const [cities, details] = await Promise.all([
                      getTourCities(t.tourID),
                      getTourDetails(t.tourID),
                    ]);
                    setViewCities(cities);
                    setViewDetails(details);
                  } catch (err) {
                    console.error("Failed to load tour cities/details for view:", err);
                    // On error, still set empty arrays to avoid fallback to old data
                    setViewCities([]);
                    setViewDetails([]);
                  }
                } else {
                  setViewCities([]);
                  setViewDetails([]);
                }
              }}
              onDelete={handleDelete}
            />

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

            {/* FORM MODAL */}
            <TourFormModal
              open={openModal}
              editing={editing}
              form={form}
              errors={errors}
              categories={categories}
              saving={saving}
              onClose={() => setOpenModal(false)}
              onChange={(newForm) => {
                setForm(newForm);
                // Clear tourCode error when user changes the code
                if (errors.tourCode && newForm.tourCode !== form.tourCode) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.tourCode;
                    return next;
                  });
                }
              }}
              onSave={handleSave}
              onMainImageChange={handleMainImage}
              onAddGallery={handleAddGallery}
              onRemoveImage={handleRemoveImage}
              tourCities={tourCities}
              tourDetails={tourDetails}
              onTourCityAdd={async (payload) => {
                try {
                  await createTourCity(payload);
                  toast.success("City added to route");
                  const updated = await getTourCities(payload.tourID);
                  setTourCities(updated);
                } catch (err) {
                  toast.error(err?.message || "Failed to add city");
                }
              }}
              onTourCityUpdate={async (tourID, cityID, payload) => {
                try {
                  await updateTourCity(tourID, cityID, payload);
                  toast.success("City updated");
                  const updated = await getTourCities(tourID);
                  setTourCities(updated);
                } catch (err) {
                  toast.error(err?.message || "Failed to update city");
                }
              }}
              onTourCityDelete={async (tourID, cityID) => {
                try {
                  await deleteTourCity(tourID, cityID);
                  toast.success("City removed from route");
                  const updated = await getTourCities(tourID);
                  setTourCities(updated);
                } catch (err) {
                  toast.error(err?.message || "Failed to remove city");
                }
              }}
              onTourDetailAdd={async (tourID, payload) => {
                try {
                  await createTourDetail(tourID, payload);
                  toast.success("Departure added");
                  const updated = await getTourDetails(tourID);
                  setTourDetails(updated);
                } catch (err) {
                  toast.error(err?.message || "Failed to add departure");
                }
              }}
              onTourDetailUpdate={async (tourDetailID, payload) => {
                try {
                  await updateTourDetail(tourDetailID, payload);
                  toast.success("Departure updated");
                  if (editing?.tourID) {
                    const updated = await getTourDetails(editing.tourID);
                    setTourDetails(updated);
                  }
                } catch (err) {
                  toast.error(err?.message || "Failed to update departure");
                }
              }}
              onTourDetailDelete={async (tourDetailID) => {
                try {
                  await deleteTourDetail(tourDetailID);
                  toast.success("Departure deleted");
                  if (editing?.tourID) {
                    const updated = await getTourDetails(editing.tourID);
                    setTourDetails(updated);
                  }
                } catch (err) {
                  toast.error(err?.message || "Failed to delete departure");
                }
              }}
            />

            {/* DETAIL MODAL */}
            <TourDetailModal
              open={openDetail}
              tour={detailTour}
              tourCities={viewCities}
              tourDetails={viewDetails}
              toAbsoluteUrl={toAbsoluteUrl}
              onClose={() => setOpenDetail(false)}
            />

            {/* Post-create setup dialog */}
            <ConfirmDialog
              isOpen={postCreateDialog.isOpen}
              title="Next step for this tour"
              message="Tour has been created. Do you want to immediately configure route cities and departures for this tour?"
              type="info"
              onClose={() =>
                setPostCreateDialog((prev) => ({ ...prev, isOpen: false }))
              }
              onConfirm={async () => {
                const createdTour = postCreateDialog.tour;
                if (!createdTour?.tourID) return;

                const normalized = normalizeTour(createdTour);
                setEditing(normalized);
                setForm(toForm(normalized));
                setErrors({});
                setOpenModal(true);

                try {
                  const [cities, details] = await Promise.all([
                    getTourCities(createdTour.tourID),
                    getTourDetails(createdTour.tourID),
                  ]);
                  setTourCities(cities);
                  setTourDetails(details);
                } catch (err) {
                  console.error(
                    "Failed to load tour cities/details for new tour:",
                    err
                  );
                }

                loadTours();
              }}
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
