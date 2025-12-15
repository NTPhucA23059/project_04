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
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";
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

  const [openDetail, setOpenDetail] = useState(false);
  const [detailFlight, setDetailFlight] = useState(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

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
    setOpenModal(true);
  };

  const handleOpenEdit = (f) => {
    setEditing(f);
    setForm(toForm(f));
    setErrors({});
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
        await createFlight(payload);
        toast.success("Flight created successfully");
      } else {
        await updateFlight(editing.flightID, payload);
        toast.success("Flight updated successfully");
      }
      setOpenModal(false);
      setEditing(null);
      setForm(emptyForm);
      loadFlights();
    } catch (err) {
      console.error("Save flight error:", err);
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (f) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Flight",
      message: `Are you sure you want to delete flight ${f.flightCode}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          setSaving(true);
          await deleteFlight(f.flightID);
          toast.success("Flight deleted successfully");
          loadFlights();
        } catch (err) {
          console.error("Delete flight error:", err);
          toast.error(err.message || "Delete failed");
        } finally {
          setSaving(false);
        }
      },
    });
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
        onClose={() => setOpenModal(false)}
        onChange={setForm}
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
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={() => {
          if (confirmDialog.onConfirm) {
            confirmDialog.onConfirm();
          }
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
      />
    </div>
  );
}
