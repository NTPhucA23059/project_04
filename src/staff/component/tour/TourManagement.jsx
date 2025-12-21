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
import TourFilters from "./TourFilters";
import TourTable from "./TourTable";
import TourFormModal from "./TourFormModal";
import TourDetailModal from "./TourDetailModal";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";
// Form chỉ quản lý mức "khung Tour" (bảng Tours), không kiêm luôn TourDetail
const TOUR_CODE_PREFIX = "TOUR-";
const emptyForm = {
  tourID: null,
  tourCode: "",
  tourName: "",
  nation: "Viet Nam",
  startingLocation: "",
  duration: "",
  days: "",
  nights: "",
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

  // Delete confirmation dialog
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, tour: null, error: null, deleting: false });

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

  const toForm = (t) => {
    // Khi edit, nếu tourCode có prefix TOUR-, chỉ lấy phần sau
    let tourCodeValue = t.tourCode || "";
    if (tourCodeValue.startsWith(TOUR_CODE_PREFIX)) {
      tourCodeValue = tourCodeValue.substring(TOUR_CODE_PREFIX.length);
    }

    // Parse duration từ "X days Y nights" thành days và nights
    let days = "";
    let nights = "";
    if (t.duration) {
      const durationStr = t.duration.toLowerCase();
      const daysMatch = durationStr.match(/(\d+)\s*days?/);
      const nightsMatch = durationStr.match(/(\d+)\s*nights?/);
      if (daysMatch) days = daysMatch[1];
      if (nightsMatch) nights = nightsMatch[1];
    }

    return {
      ...emptyForm,
      ...t,
      tourCode: tourCodeValue,
      nation: t.nation || "Viet Nam",
      days: days,
      nights: nights,
      tourImg: toAbsoluteUrl(t.tourImg),
      // Gallery images now come directly from Tour.images (not from TourDetail)
      images:
        (t.images || []).map((i) => ({
          imageID: i.imageID,
          imageUrl: toAbsoluteUrl(i.imageUrl),
          isNew: false,
        })) || [],
    };
  };

  const toPayload = (f) => {
    // Thêm prefix TOUR- vào tourCode
    const tourCodeValue = f.tourCode?.trim() || "";
    const fullTourCode = tourCodeValue ? `${TOUR_CODE_PREFIX}${tourCodeValue}` : "";

    // Tạo duration string từ days và nights
    let durationStr = "";
    if (f.days || f.nights) {
      const parts = [];
      if (f.days) parts.push(`${f.days} day${f.days > 1 ? 's' : ''}`);
      if (f.nights) parts.push(`${f.nights} night${f.nights > 1 ? 's' : ''}`);
      durationStr = parts.join(" ");
    }

    const payload = {
      tourCode: fullTourCode,
      tourName: f.tourName?.trim() || "",
      startingLocation: f.startingLocation?.trim() || "",
      status: f.status != null ? Number(f.status) : 1,
      categoryID: f.categoryID ? Number(f.categoryID) : null,
      nation: f.nation?.trim() || "Viet Nam",
    };

    // Optional fields
    if (durationStr) payload.duration = durationStr;
    if (f.tourDescription?.trim()) payload.tourDescription = f.tourDescription.trim();

    return payload;
  };

  const validate = () => {
    const e = {};
    if (!form.tourCode?.trim()) {
      e.tourCode = "Required";
    } else {
      // Validate tourCode chỉ chứa chữ và số
      if (!/^[a-zA-Z0-9]+$/.test(form.tourCode.trim())) {
        e.tourCode = "Tour code must contain only letters and numbers";
      }
    }
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

  const handleDelete = (tour) => {
    setDeleteConfirm({ isOpen: true, tour: tour, error: null, deleting: false });
  };

  const confirmDeleteTour = async () => {
    if (!deleteConfirm.tour || deleteConfirm.deleting) return;

    try {
      setDeleteConfirm(prev => ({ ...prev, deleting: true, error: null }));
      await deleteTour(deleteConfirm.tour.tourID);
      toast.success("Tour deleted successfully");
      setDeleteConfirm({ isOpen: false, tour: null, error: null, deleting: false });
      loadTours();
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

      // Check if it's a constraint error (tour is being used)
      if (backendMsg.toLowerCase().includes("booking") ||
        backendMsg.toLowerCase().includes("using") ||
        backendMsg.toLowerCase().includes("cannot delete") ||
        backendMsg.toLowerCase().includes("associated")) {

        // Extract number of bookings if available
        const countMatch = backendMsg.match(/\d+/);
        const count = countMatch ? countMatch[0] : "some";

        userFriendlyMsg = `This tour is currently associated with ${count} booking(s). You cannot delete it until you cancel or process those bookings first.`;
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "This tour no longer exists. Please refresh the page.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to delete this tour. Please try again later or contact support if the problem persists.";
      } else {
        userFriendlyMsg = "Unable to delete this tour. Please check your connection and try again.";
      }

      // Show error in dialog and toast
      setDeleteConfirm(prev => ({ ...prev, error: userFriendlyMsg, deleting: false }));
      toast.error(userFriendlyMsg);
    }
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
            toast.success("Departure deleted successfully");
            if (editing?.tourID) {
              const updated = await getTourDetails(editing.tourID);
              setTourDetails(updated);
            }
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

            // Check if it's a constraint error (tour detail is being used)
            if (backendMsg.toLowerCase().includes("booking") ||
              backendMsg.toLowerCase().includes("using") ||
              backendMsg.toLowerCase().includes("cannot delete") ||
              backendMsg.toLowerCase().includes("associated")) {

              // Extract number of bookings if available
              const countMatch = backendMsg.match(/\d+/);
              const count = countMatch ? countMatch[0] : "some";

              userFriendlyMsg = `This departure is currently associated with ${count} booking(s). You cannot delete it until you cancel or process those bookings first.`;
            } else if (backendMsg.toLowerCase().includes("not found")) {
              userFriendlyMsg = "This departure no longer exists. Please refresh the page.";
            } else if (backendMsg) {
              userFriendlyMsg = "Unable to delete this departure. Please try again later or contact support if the problem persists.";
            } else {
              userFriendlyMsg = "Unable to delete this departure. Please check your connection and try again.";
            }

            toast.error(userFriendlyMsg);
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
                    Delete Tour
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
                              Cannot Delete This Tour
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
                          <li>Go to the Bookings management page</li>
                          <li>Find the bookings associated with this tour</li>
                          <li>Cancel or process those bookings</li>
                          <li>Then come back here to delete this tour</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {deleteConfirm.tour
                        ? `Are you sure you want to delete tour "${deleteConfirm.tour.tourCode}"? This action cannot be undone.`
                        : "Are you sure you want to delete this tour?"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, tour: null, error: null, deleting: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
              >
                {deleteConfirm.error ? "Close" : "Cancel"}
              </button>
              {!deleteConfirm.error && (
                <button
                  onClick={confirmDeleteTour}
                  disabled={deleteConfirm.deleting}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition shadow-md ${deleteConfirm.deleting
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
