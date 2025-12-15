import React from "react";
import { getAllSeasons } from "../../../services/staff/seasonStaffService";

export default function TourDetailsSection({
  tourID,
  tourDetails,
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

  React.useEffect(() => {
    getAllSeasons()
      .then((res) => {
        const list = res?.items || res || [];
        setSeasons(list);
      })
      .catch(() => setSeasons([]));
  }, []);

  const handleAdd = () => {
    if (!form.departureDate || !form.arrivalDate || !form.unitPrice) {
      alert("Please fill required fields");
      return;
    }
    onAdd(tourID, {
      ...form,
      numberOfGuests: Number(form.numberOfGuests),
      minimumNumberOfGuests: Number(form.minimumNumberOfGuests),
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
  };

  const handleSaveUpdate = () => {
    if (!form.departureDate || !form.arrivalDate || !form.unitPrice) {
      alert("Please fill required fields");
      return;
    }
    onUpdate(editingID, {
      ...form,
      numberOfGuests: Number(form.numberOfGuests),
      minimumNumberOfGuests: Number(form.minimumNumberOfGuests),
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

      {/* Add/Edit Form */}
      {(showAddForm || editingID) && (
        <div className="mb-4 p-3 border border-primary-200 rounded-lg bg-primary-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs text-neutral-500">Departure Date</label>
              <input
                type="date"
                className="w-full border border-neutral-200 px-2 py-1.5 rounded text-sm"
                value={form.departureDate}
                onChange={(e) =>
                  setForm({ ...form, departureDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Arrival Date</label>
              <input
                type="date"
                className="w-full border border-neutral-200 px-2 py-1.5 rounded text-sm"
                value={form.arrivalDate}
                onChange={(e) =>
                  setForm({ ...form, arrivalDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Number of Guests</label>
              <input
                type="number"
                min="1"
                className="w-full border border-neutral-200 px-2 py-1.5 rounded text-sm"
                value={form.numberOfGuests}
                onChange={(e) =>
                  setForm({ ...form, numberOfGuests: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Min Guests</label>
              <input
                type="number"
                min="1"
                className="w-full border border-neutral-200 px-2 py-1.5 rounded text-sm"
                value={form.minimumNumberOfGuests}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minimumNumberOfGuests: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Unit Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border border-neutral-200 px-2 py-1.5 rounded text-sm"
                value={form.unitPrice}
                onChange={(e) =>
                  setForm({ ...form, unitPrice: e.target.value })
                }
              />
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

