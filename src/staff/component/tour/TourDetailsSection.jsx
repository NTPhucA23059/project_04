import React from "react";
import { getAllSeasons } from "../../../services/staff/seasonStaffService";

export default function TourDetailsSection({
  tourID,
  tourDetails,
  tourDuration = null,
  onAdd,
  onUpdate,
  onDelete,
}) {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [editingID, setEditingID] = React.useState(null);
  const [form, setForm] = React.useState({
    departureDate: "",
    arrivalDate: "",
    numberOfGuests: "",
    minimumNumberOfGuests: "",
    unitPrice: "",
    status: 1,
    seasonID: "",
  });
  const [seasons, setSeasons] = React.useState([]);
  const [errors, setErrors] = React.useState({});

  React.useEffect(() => {
    getAllSeasons()
      .then((res) => {
        const list = res?.items || res || [];
        setSeasons(list);
      })
      .catch(() => setSeasons([]));
  }, []);

  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split("T")[0];
  };

  const getMinDepartureDate = () => {
    const minDate = new Date();
    minDate.setHours(0, 0, 0, 0);
    minDate.setDate(minDate.getDate() + 5); // Thêm 5 ngày
    return minDate.toISOString().split("T")[0];
  };

  const calculateArrivalDate = (departureDate, duration) => {
    if (!departureDate || !duration || duration <= 0) return "";

    const departure = new Date(departureDate);
    if (isNaN(departure.getTime())) return "";

    const arrival = new Date(departure);
    arrival.setDate(arrival.getDate() + duration - 1); 

    return arrival.toISOString().split("T")[0];
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.departureDate) {
      newErrors.departureDate = "Departure date is required";
    } else {
      const departure = new Date(form.departureDate);
      const minDate = new Date(getMinDepartureDate());
      const today = new Date(getTodayDate());

      if (departure < today) {
        newErrors.departureDate = "Departure date cannot be in the past";
      }
      else if (departure < minDate) {
        const daysFromToday = Math.ceil((departure - today) / (1000 * 60 * 60 * 24));
        newErrors.departureDate = `Departure date must be at least 5 days from today. Selected date is only ${daysFromToday} day(s) away.`;
      }
    }

    if (!form.arrivalDate) {
      newErrors.arrivalDate = "Arrival date is required";
    } else if (form.departureDate) {
      const departure = new Date(form.departureDate);
      const arrival = new Date(form.arrivalDate);

      if (arrival < departure) {
        newErrors.arrivalDate = "Arrival date cannot be before departure date";
      }

      // Chỉ validate arrival date với tour duration nếu không có tourDuration (vì nếu có tourDuration thì đã auto-calculate rồi)
      if (!tourDuration && form.departureDate) {
        // Có thể thêm validation khác nếu cần
      }
    }

    // Validate Number of Guests
    if (form.numberOfGuests) {
      const numGuests = Number(form.numberOfGuests);
      if (isNaN(numGuests) || numGuests < 1) {
        newErrors.numberOfGuests = "Number of guests must be at least 1";
      }
    }

    // Validate Minimum Number of Guests
    if (form.minimumNumberOfGuests) {
      const minGuests = Number(form.minimumNumberOfGuests);
      if (isNaN(minGuests) || minGuests < 1) {
        newErrors.minimumNumberOfGuests = "Minimum guests must be at least 1";
      } else if (form.numberOfGuests) {
        const numGuests = Number(form.numberOfGuests);
        if (numGuests > 0 && minGuests > numGuests) {
          newErrors.minimumNumberOfGuests = "Minimum guests cannot exceed number of guests";
        }
      }
    }

    // Validate Unit Price
    if (!form.unitPrice) {
      newErrors.unitPrice = "Unit price is required";
    } else {
      const price = Number(form.unitPrice);
      if (isNaN(price) || price <= 0) {
        newErrors.unitPrice = "Unit price must be greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDepartureDateChange = (value) => {
    setErrors({ ...errors, departureDate: "" });

    if (tourDuration && tourDuration > 0 && value) {
      const calculatedArrival = calculateArrivalDate(value, tourDuration);
      setForm({
        ...form,
        departureDate: value,
        arrivalDate: calculatedArrival,
      });
    } else {
      setForm({ ...form, departureDate: value });
    }
  };

  const handleAdd = () => {
    if (!validateForm()) {
      return;
    }

    onAdd(tourID, {
      ...form,
      numberOfGuests: Number(form.numberOfGuests) || null,
      minimumNumberOfGuests: Number(form.minimumNumberOfGuests) || null,
      unitPrice: Number(form.unitPrice),
      status: Number(form.status),
      seasonID: form.seasonID ? Number(form.seasonID) : null,
    });
    setForm({
      departureDate: "",
      arrivalDate: "",
      numberOfGuests: "",
      minimumNumberOfGuests: "",
      unitPrice: "",
      status: 1,
      seasonID: "",
    });
    setErrors({});
    setShowAddForm(false);
  };

  const handleUpdate = (detail) => {
    setEditingID(detail.tourDetailID);
    setForm({
      departureDate: detail.departureDate
        ? detail.departureDate.substring(0, 10)
        : "",
      arrivalDate: detail.arrivalDate
        ? detail.arrivalDate.substring(0, 10)
        : "",
      numberOfGuests: detail.numberOfGuests || "",
      minimumNumberOfGuests: detail.minimumNumberOfGuests || "",
      unitPrice: detail.unitPrice || "",
      status: detail.status ?? 1,
      seasonID: detail.seasonID || "",
    });
    setErrors({});
  };

  const handleSaveUpdate = () => {
    if (!validateForm()) {
      return;
    }

    onUpdate(editingID, {
      ...form,
      numberOfGuests: Number(form.numberOfGuests) || null,
      minimumNumberOfGuests: Number(form.minimumNumberOfGuests) || null,
      unitPrice: Number(form.unitPrice),
      status: Number(form.status),
      seasonID: form.seasonID ? Number(form.seasonID) : null,
    });
    setEditingID(null);
    setForm({
      departureDate: "",
      arrivalDate: "",
      numberOfGuests: "",
      minimumNumberOfGuests: "",
      unitPrice: "",
      status: 1,
      seasonID: "",
    });
    setErrors({});
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <p className="font-semibold text-neutral-800">Departures</p>
        {!showAddForm && !editingID && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm font-medium"
          >
            + Add Departure
          </button>
        )}
      </div>

      {/* Tour duration info */}
      {tourDuration && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-xs text-blue-800">
            <span className="font-medium">Tour Duration:</span> {tourDuration} days
            {" • "}
            <span className="text-xs">Arrival date will be calculated automatically</span>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingID) && (
        <div className="mb-4 p-3 border border-primary-200 rounded-lg bg-primary-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-neutral-500">
                Departure Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={getMinDepartureDate()}
                className={`w-full border px-2 py-1.5 rounded text-sm ${
                  errors.departureDate ? "border-red-500" : "border-neutral-200"
                }`}
                value={form.departureDate}
                onChange={(e) => handleDepartureDateChange(e.target.value)}
              />
              {errors.departureDate && (
                <p className="text-xs text-red-500 mt-1">{errors.departureDate}</p>
              )}
              <p className="text-xs text-neutral-400 mt-1">
                Must be at least 5 days from today
              </p>
            </div>
            <div>
              <label className="text-xs text-neutral-500">
                Arrival Date <span className="text-red-500">*</span>
            
              </label>
              <input
                type="date"
                min={form.departureDate || getTodayDate()}
                className={`w-full border px-2 py-1.5 rounded text-sm ${
                  tourDuration ? "bg-neutral-100 cursor-not-allowed" : ""
                } ${errors.arrivalDate ? "border-red-500" : "border-neutral-200"}`}
                value={form.arrivalDate}
                onChange={(e) => {
                  if (!tourDuration) {
                    setForm({ ...form, arrivalDate: e.target.value });
                    setErrors({ ...errors, arrivalDate: "" });
                  }
                }}
                disabled={!!tourDuration}
                title={tourDuration ? "Arrival date is automatically calculated from departure date + tour duration" : ""}
              />
              {errors.arrivalDate && (
                <p className="text-xs text-red-500 mt-1">{errors.arrivalDate}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-neutral-500">Number of Guests</label>
              <input
                type="number"
                min="1"
                className={`w-full border px-2 py-1.5 rounded text-sm ${
                  errors.numberOfGuests ? "border-red-500" : "border-neutral-200"
                }`}
                value={form.numberOfGuests}
                onChange={(e) => {
                  setForm({ ...form, numberOfGuests: e.target.value });
                  setErrors({ ...errors, numberOfGuests: "" });
                }}
                placeholder="Optional"
              />
              {errors.numberOfGuests && (
                <p className="text-xs text-red-500 mt-1">{errors.numberOfGuests}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-neutral-500">Min Guests</label>
              <input
                type="number"
                min="1"
                className={`w-full border px-2 py-1.5 rounded text-sm ${
                  errors.minimumNumberOfGuests ? "border-red-500" : "border-neutral-200"
                }`}
                value={form.minimumNumberOfGuests}
                onChange={(e) => {
                  setForm({
                    ...form,
                    minimumNumberOfGuests: e.target.value,
                  });
                  setErrors({ ...errors, minimumNumberOfGuests: "" });
                }}
                placeholder="Optional"
              />
              {errors.minimumNumberOfGuests && (
                <p className="text-xs text-red-500 mt-1">{errors.minimumNumberOfGuests}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-neutral-500">
                Unit Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className={`w-full border px-2 py-1.5 rounded text-sm ${
                  errors.unitPrice ? "border-red-500" : "border-neutral-200"
                }`}
                value={form.unitPrice}
                onChange={(e) => {
                  setForm({ ...form, unitPrice: e.target.value });
                  setErrors({ ...errors, unitPrice: "" });
                }}
                placeholder="0.00"
              />
              {errors.unitPrice && (
                <p className="text-xs text-red-500 mt-1">{errors.unitPrice}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-neutral-500">Season</label>
              <select
                className="w-full border border-neutral-200 px-2 py-1.5 rounded text-sm"
                value={form.seasonID}
                onChange={(e) =>
                  setForm({ ...form, seasonID: e.target.value || "" })
                }
              >
                <option value="">-- No season / Default --</option>
                {seasons.map((s) => (
                  <option key={s.seasonID} value={s.seasonID}>
                    {s.seasonName || s.name}{" "}
                    {s.month
                      ? `(Month ${s.month})`
                      : s.startMonth && s.endMonth
                      ? `(${s.startMonth}-${s.endMonth})`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500">Status</label>
              <select
                className="w-full border border-neutral-200 px-2 py-1.5 rounded text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={editingID ? handleSaveUpdate : handleAdd}
              className="px-3 py-1.5 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
            >
              {editingID ? "Save" : "Add"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingID(null);
                setForm({
                  departureDate: "",
                  arrivalDate: "",
                  numberOfGuests: "",
                  minimumNumberOfGuests: "",
                  unitPrice: "",
                  status: 1,
                  seasonID: "",
                });
                setErrors({});
              }}
              className="px-3 py-1.5 bg-neutral-200 text-neutral-700 rounded text-sm hover:bg-neutral-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List of departures */}
      {tourDetails.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-4">
          No departures added yet
        </p>
      ) : (
        <div className="space-y-2">
          {tourDetails.map((td) => (
            <div
              key={td.tourDetailID}
              className="p-3 border border-neutral-200 rounded-lg"
            >
              {editingID === td.tourDetailID ? null : (
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {td.departureDate
                        ? new Date(td.departureDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}{" "}
                      →{" "}
                      {td.arrivalDate
                        ? new Date(td.arrivalDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                    </div>
                    <div className="text-xs text-neutral-600 mt-1">
                      Guests: {td.numberOfGuests} (Min: {td.minimumNumberOfGuests}) • Price: ${Number(td.unitPrice).toLocaleString()} • Status:{" "}
                      {td.status === 1 ? "Active" : "Inactive"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(td)}
                      className="px-2 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(td.tourDetailID)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
