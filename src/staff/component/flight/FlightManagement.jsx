import React, { useEffect, useMemo, useState } from "react";
import {
  searchFlights,
  createFlight,
  updateFlight,
  deleteFlight,
  getFlightById,
} from "../../../services/staff/flightStaffService";
import { getAllCities } from "../../../services/staff/cityStaffService";
import { toast } from "../../shared/toast/toast";
import FlightFilters from "./FlightFilters";
import FlightTable from "./FlightTable";
import FlightFormModal from "./FlightFormModal";
import FlightDetailModal from "./FlightDetailModal";

const emptyForm = {
  flightID: null,
  flightCode: "",
  airline: "",
  fromCityID: "",
  toCityID: "",
  departureTime: "",
  arrivalTime: "",
  durationMinutes: "",
  price: "",
  scheduleInfo: "",
  flightType: "",
  imageURL: "",
  status: 1,
};

export default function FlightManagement() {
  const [flights, setFlights] = useState([]);
  const [cities, setCities] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromCityFilter, setFromCityFilter] = useState("");
  const [toCityFilter, setToCityFilter] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const [openDetail, setOpenDetail] = useState(false);
  const [detailFlight, setDetailFlight] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, flight: null, error: null, deleting: false });

  // Helpers
  const cityNameById = useMemo(() => {
    const map = new Map();
    cities.forEach((c) => map.set(c.cityID, c.cityName));
    return map;
  }, [cities]);

  const formatDateTimeInput = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const MM = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
  };

  const toForm = (f) => ({
    flightID: f.flightID,
    flightCode: f.flightCode || "",
    airline: f.airline || "",
    fromCityID: f.fromCityID ?? "",
    toCityID: f.toCityID ?? "",
    departureTime: formatDateTimeInput(f.departureTime),
    arrivalTime: formatDateTimeInput(f.arrivalTime),
    durationMinutes: f.durationMinutes ?? "",
    price: f.price ?? "",
    scheduleInfo: f.scheduleInfo || "",
    flightType: f.flightType || "",
    imageURL: f.imageURL || "",
    status: f.status ?? 1,
  });

  const toPayload = (f, isCreate) => {
    const payload = {
      airline: f.airline.trim(),
      fromCityID: f.fromCityID ? Number(f.fromCityID) : null,
      toCityID: f.toCityID ? Number(f.toCityID) : null,
      departureTime: f.departureTime ? new Date(f.departureTime) : null,
      arrivalTime: f.arrivalTime ? new Date(f.arrivalTime) : null,
      durationMinutes:
        f.durationMinutes === "" ? null : Number(f.durationMinutes),
      price: f.price === "" ? null : Number(f.price),
      scheduleInfo: f.scheduleInfo?.trim() || "",
      flightType: f.flightType?.trim() || "",
      imageURL: f.imageURL?.trim() || null,
      status: f.status === "" ? null : Number(f.status),
    };
    if (isCreate) {
      return {
        ...payload,
        flightCode: f.flightCode.trim(),
      };
    }
    return payload;
  };

  // Validate
  const validate = (isCreate) => {
    const e = {};
    if (isCreate && !form.flightCode.trim())
      e.flightCode = "Flight code is required";
    if (!form.airline.trim()) e.airline = "Airline is required";
    if (!form.fromCityID) e.fromCityID = "From city is required";
    if (!form.toCityID) e.toCityID = "To city is required";
    if (!form.departureTime) e.departureTime = "Departure time is required";
    if (!form.arrivalTime) e.arrivalTime = "Arrival time is required";
    if (form.durationMinutes !== "" && Number(form.durationMinutes) < 0)
      e.durationMinutes = "Duration must be >= 0";
    if (form.price !== "" && Number(form.price) < 0)
      e.price = "Price must be >= 0";
    if (![0, 1].includes(Number(form.status)))
      e.status = "Status must be 0 or 1";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Load data
  const loadFlights = async () => {
    setLoading(true);
    try {
      const res = await searchFlights({
        page,
        size,
        keyword: search.trim() || undefined,
        status:
          statusFilter === "" || statusFilter === "all"
            ? undefined
            : Number(statusFilter),
        fromCityID: fromCityFilter || undefined,
        toCityID: toCityFilter || undefined,
      });
      setFlights(res.items || []);
      setTotalPages(res.totalPages || 0);
      setTotal(res.total || 0);
    } catch (err) {
      console.error("Load flights error:", err);
      toast.error(err.message || "Failed to load flights");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load cities and first page
    getAllCities()
      .then((list) => setCities(list))
      .catch(() => {});
    loadFlights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setTimeout(loadFlights, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, statusFilter, fromCityFilter, toCityFilter]);

  // Actions
  const handleOpenCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setImageFile(null);
    setOpenModal(true);
  };

  const handleOpenEdit = (f) => {
    setEditing(f);
    setForm(toForm(f));
    setErrors({});
    setImageFile(null);
    setOpenModal(true);
  };

  const handleSave = async () => {
    const isCreate = !editing;
    if (!validate(isCreate)) {
      toast.error("Please fix validation errors");
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(form, isCreate);
      if (isCreate) {
        await createFlight(payload, imageFile);
        toast.success("Flight created successfully");
      } else {
        await updateFlight(editing.flightID, payload, imageFile);
        toast.success("Flight updated successfully");
      }
      setOpenModal(false);
      setEditing(null);
      setForm(emptyForm);
      setImageFile(null);
      loadFlights();
    } catch (err) {
      console.error("Save flight error:", err);
      
      // Get backend message
      let backendMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "";
      
      // Convert to user-friendly message
      let userFriendlyMsg = "";
      
      if (backendMsg.toLowerCase().includes("already exists")) {
        if (backendMsg.toLowerCase().includes("code")) {
          userFriendlyMsg = "This flight code is already in use. Please choose a different code.";
        } else {
          userFriendlyMsg = "This flight already exists. Please check the code.";
        }
      } else if (backendMsg.toLowerCase().includes("not found")) {
        userFriendlyMsg = "Flight not found. Please refresh the page and try again.";
      } else if (backendMsg.toLowerCase().includes("validation") || backendMsg.toLowerCase().includes("required")) {
        userFriendlyMsg = "Please fill in all required fields correctly.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to save flight. Please check your input and try again.";
      } else {
        userFriendlyMsg = "Unable to save flight. Please check your connection and try again.";
      }

      toast.error(userFriendlyMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (f) => {
    setDeleteConfirm({ isOpen: true, flight: f, error: null, deleting: false });
  };

  const confirmDeleteFlight = async () => {
    if (!deleteConfirm.flight || deleteConfirm.deleting) return;

    try {
      setDeleteConfirm(prev => ({ ...prev, deleting: true, error: null }));
      await deleteFlight(deleteConfirm.flight.flightID);
      toast.success("Flight deleted successfully");
      setDeleteConfirm({ isOpen: false, flight: null, error: null, deleting: false });
      loadFlights();
    } catch (err) {
      console.error("Delete flight error:", err.response?.data || err.message || err);
      
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
        userFriendlyMsg = "This flight no longer exists. Please refresh the page.";
      } else if (backendMsg) {
        userFriendlyMsg = "Unable to delete this flight. Please try again later or contact support if the problem persists.";
      } else {
        userFriendlyMsg = "Unable to delete this flight. Please check your connection and try again.";
      }

      // Show error in dialog and toast
      setDeleteConfirm(prev => ({ ...prev, error: userFriendlyMsg, deleting: false }));
      toast.error(userFriendlyMsg);
    }
  };

  const handleOpenDetail = async (f) => {
    try {
      const res = await getFlightById(f.flightID);
      setDetailFlight(res);
      setOpenDetail(true);
    } catch (err) {
      console.error("Load flight detail error:", err);
      toast.error(err.message || "Failed to load flight detail");
    }
  };

  const resetFilters = () => {
    setStatusFilter("");
    setFromCityFilter("");
    setToCityFilter("");
    setSearch("");
    setPage(0);
  };

  // Render helpers
  const renderCityName = (id) =>
    id && cityNameById.get(id) ? cityNameById.get(id) : id || "-";

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString();
  };

  const filteredFlights = flights; // backend already filters/paginates

  return (
    <div className="w-full p-6">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">
            Flight Management
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Manage flight routes, schedules and basic information
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-primary-700 hover:to-primary-600 transition-all"
        >
          + Add Flight
        </button>
      </div>

      {/* Filters */}
      <FlightFilters
        search={search}
        statusFilter={statusFilter}
        fromCityFilter={fromCityFilter}
        toCityFilter={toCityFilter}
        cities={cities}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(0);
        }}
        onFromCityChange={(value) => {
          setFromCityFilter(value);
          setPage(0);
        }}
        onToCityChange={(value) => {
          setToCityFilter(value);
          setPage(0);
        }}
        onClear={resetFilters}
      />

      {/* Table */}
      <FlightTable
        flights={filteredFlights}
        loading={loading}
        saving={saving}
        renderCityName={renderCityName}
        formatDateTime={formatDateTime}
        onEdit={handleOpenEdit}
        onView={handleOpenDetail}
        onDelete={handleDelete}
      />

      {/* Pagination */}
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
            onClick={() =>
              setPage((p) => (p + 1 < totalPages ? p + 1 : p))
            }
            disabled={page + 1 >= totalPages}
            className="px-3 py-1.5 rounded-lg border border-neutral-200 text-neutral-700 disabled:opacity-50 disabled:bg-neutral-100 hover:bg-primary-50 hover:border-primary-300 transition"
          >
            Next
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <FlightFormModal
        open={openModal}
        editing={editing}
        form={form}
        errors={errors}
        cities={cities}
        saving={saving}
        imageFile={imageFile}
        onClose={() => {
          setOpenModal(false);
          setImageFile(null);
        }}
        onChange={setForm}
        onImageChange={setImageFile}
        onSave={handleSave}
      />

      {/* Detail Modal */}
      <FlightDetailModal
        open={openDetail}
        flight={detailFlight}
        renderCityName={renderCityName}
        formatDateTime={formatDateTime}
        onClose={() => setOpenDetail(false)}
      />

      {/* Confirmation Dialog */}
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
                    Delete Flight
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
                              Cannot Delete This Flight
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
                      {deleteConfirm.flight
                        ? `Are you sure you want to delete flight "${deleteConfirm.flight.flightCode}"? This action cannot be undone.`
                        : "Are you sure you want to delete this flight?"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm({ isOpen: false, flight: null, error: null, deleting: false })}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
              >
                {deleteConfirm.error ? "Close" : "Cancel"}
              </button>
              {!deleteConfirm.error && (
                <button
                  onClick={confirmDeleteFlight}
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
