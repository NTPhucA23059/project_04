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
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

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
        f.durationMinutes === "" || f.durationMinutes === null || f.durationMinutes === undefined
          ? null
          : Number(f.durationMinutes),
      price:
        f.price === "" || f.price === null || f.price === undefined
          ? null
          : Number(f.price),
      scheduleInfo: f.scheduleInfo && f.scheduleInfo.trim() ? f.scheduleInfo.trim() : null,
      flightType: f.flightType && f.flightType.trim() ? f.flightType.trim() : null,
      imageURL: f.imageURL && f.imageURL.trim() ? f.imageURL.trim() : null,
      status: f.status === "" || f.status === null || f.status === undefined ? null : Number(f.status),
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
    
    // Flight Code: required when creating, max 50 characters, must be unique (backend will check)
    if (isCreate) {
      const flightCodeTrimmed = form.flightCode.trim();
      if (!flightCodeTrimmed) {
        e.flightCode = "Flight code is required";
      } else if (flightCodeTrimmed.length > 50) {
        e.flightCode = "Flight code must be 50 characters or less";
      } else if (flightCodeTrimmed.length < 2) {
        e.flightCode = "Flight code must be at least 2 characters";
      }
    }
    
    // Airline: required, not blank
    const airlineTrimmed = form.airline.trim();
    if (!airlineTrimmed) {
      e.airline = "Airline is required";
    } else if (airlineTrimmed.length > 200) {
      e.airline = "Airline name must be 200 characters or less";
    } else if (airlineTrimmed.length < 2) {
      e.airline = "Airline name must be at least 2 characters";
    }
    
    // From City: required, must be valid number
    if (!form.fromCityID) {
      e.fromCityID = "From city is required";
    } else {
      const fromCityNum = Number(form.fromCityID);
      if (isNaN(fromCityNum) || fromCityNum <= 0 || !Number.isInteger(fromCityNum)) {
        e.fromCityID = "Please select a valid from city";
      }
    }
    
    // To City: required, must be valid number, cannot be same as from city
    if (!form.toCityID) {
      e.toCityID = "To city is required";
    } else {
      const toCityNum = Number(form.toCityID);
      if (isNaN(toCityNum) || toCityNum <= 0 || !Number.isInteger(toCityNum)) {
        e.toCityID = "Please select a valid to city";
      } else if (form.fromCityID && Number(form.fromCityID) === toCityNum) {
        e.toCityID = "To city must be different from from city";
      }
    }
    
    // Departure Time: required, must be valid date
    if (!form.departureTime) {
      e.departureTime = "Departure time is required";
    } else {
      const depTime = new Date(form.departureTime);
      if (isNaN(depTime.getTime())) {
        e.departureTime = "Please enter a valid departure time";
      }
    }
    
    // Arrival Time: required, must be valid date, must be after departure time
    if (!form.arrivalTime) {
      e.arrivalTime = "Arrival time is required";
    } else {
      const arrTime = new Date(form.arrivalTime);
      if (isNaN(arrTime.getTime())) {
        e.arrivalTime = "Please enter a valid arrival time";
      } else if (form.departureTime) {
        const depTime = new Date(form.departureTime);
        if (!isNaN(depTime.getTime()) && arrTime <= depTime) {
          e.arrivalTime = "Arrival time must be after departure time";
        }
      }
    }
    
    // Duration Minutes: optional, but if provided must be integer >= 0, reasonable max (e.g., 1440 = 24 hours)
    if (form.durationMinutes !== "" && form.durationMinutes !== null && form.durationMinutes !== undefined) {
      const durationNum = Number(form.durationMinutes);
      if (isNaN(durationNum)) {
        e.durationMinutes = "Duration must be a valid number";
      } else if (!Number.isInteger(durationNum)) {
        e.durationMinutes = "Duration must be an integer (minutes)";
      } else if (durationNum < 0) {
        e.durationMinutes = "Duration must be 0 or greater";
      } else if (durationNum > 1440) {
        e.durationMinutes = "Duration must be 1440 minutes (24 hours) or less";
      }
    }
    
    // Price: optional, but if provided must be >= 0, max 2 decimal places
    if (form.price !== "" && form.price !== null && form.price !== undefined) {
      const priceNum = Number(form.price);
      if (isNaN(priceNum)) {
        e.price = "Price must be a valid number";
      } else if (priceNum < 0) {
        e.price = "Price must be 0 or greater";
      } else {
        // Check decimal places (max 2)
        const priceStr = form.price.toString();
        const decimalPlaces = (priceStr.split('.')[1] || '').length;
        if (decimalPlaces > 2) {
          e.price = "Price can have at most 2 decimal places";
        }
      }
    }
    
    // Schedule Info: optional, but if provided max length
    if (form.scheduleInfo && form.scheduleInfo.trim()) {
      const scheduleTrimmed = form.scheduleInfo.trim();
      if (scheduleTrimmed.length > 500) {
        e.scheduleInfo = "Schedule info must be 500 characters or less";
      }
    }
    
    // Flight Type: optional, but if provided max length
    if (form.flightType && form.flightType.trim()) {
      const flightTypeTrimmed = form.flightType.trim();
      if (flightTypeTrimmed.length > 100) {
        e.flightType = "Flight type must be 100 characters or less";
      }
    }
    
    // Image URL: optional, but if provided should be valid URL format
    if (form.imageURL && form.imageURL.trim()) {
      const imageURLTrimmed = form.imageURL.trim();
      if (imageURLTrimmed.length > 500) {
        e.imageURL = "Image URL must be 500 characters or less";
      } else {
        // Basic URL validation
        try {
          new URL(imageURLTrimmed);
        } catch {
          // If it's not a full URL, check if it's a relative path or just a filename
          if (!imageURLTrimmed.startsWith('/') && !imageURLTrimmed.match(/^[a-zA-Z0-9._-]+$/)) {
            e.imageURL = "Please enter a valid URL or file path";
          }
        }
      }
    }
    
    // Status: required, must be 0 or 1
    if (form.status === "" || form.status === null || form.status === undefined) {
      e.status = "Status is required";
    } else {
      const statusNum = Number(form.status);
      if (isNaN(statusNum) || (statusNum !== 0 && statusNum !== 1)) {
        e.status = "Status must be Active (1) or Inactive (0)";
      }
    }
    
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

  // ============================
  // LOAD STATISTICS
  // ============================
  const loadStats = async () => {
    try {
      // Load all flights to calculate stats
      const res = await searchFlights({
        page: 0,
        size: 1000, // Get all for stats
        keyword: undefined,
        status: undefined,
        fromCityID: undefined,
        toCityID: undefined,
      });

      const allItems = res.items || [];
      const totalCount = allItems.length;
      const active = allItems.filter((item) => item.status === 1).length;
      const inactive = totalCount - active;

      setStats({
        total: totalCount,
        active,
        inactive,
      });
    } catch (err) {
      console.error("Failed to load stats", err);
    }
  };

  useEffect(() => {
    // load cities and first page
    getAllCities()
      .then((list) => setCities(list))
      .catch(() => {});
    loadFlights();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setTimeout(loadFlights, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, size, statusFilter, fromCityFilter, toCityFilter]);

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
      loadStats();
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
      loadStats();
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Total Flights</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-lg">
              <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Active Flights</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600 mb-1">Inactive Flights</p>
              <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
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
      <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
        {/* Showing info */}
        <p className="text-sm text-neutral-600 font-medium">
          {total === 0
            ? "No flights"
            : `Showing ${page * size + 1}–${Math.min((page + 1) * size, total)} of ${total} flights`}
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
            {totalPages > 0 && (() => {
              const pages = [];
              const maxVisible = 7;
              
              if (totalPages <= maxVisible) {
                for (let i = 0; i < totalPages; i++) {
                  pages.push(i);
                }
              } else {
                pages.push(0);
                if (page <= 3) {
                  for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                  }
                  pages.push('...');
                  pages.push(totalPages - 1);
                } else if (page >= totalPages - 4) {
                  pages.push('...');
                  for (let i = totalPages - 5; i < totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  pages.push('...');
                  for (let i = page - 1; i <= page + 1; i++) {
                    pages.push(i);
                  }
                  pages.push('...');
                  pages.push(totalPages - 1);
                }
              }
              
              return pages.map((pageNum, idx) => {
                if (pageNum === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="px-2 text-neutral-400">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={pageNum}
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
              });
            })()}
            
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
