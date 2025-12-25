import React, { useState, useEffect } from "react";

export default function SeasonFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  list = [],
}) {
  const [form, setForm] = useState({
    SeasonCode: "",
    SeasonName: "",
    StartMonth: 1,
    EndMonth: 12,
    Description: "",
    Status: 1,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        SeasonCode: initial.SeasonCode ?? "",
        SeasonName: initial.SeasonName ?? "",
        StartMonth: initial.StartMonth ?? 1,
        EndMonth: initial.EndMonth ?? 12,
        Description: initial.Description ?? "",
        Status: initial.Status ?? 1,
      });
    } else {
      setForm({
        SeasonCode: "",
        SeasonName: "",
        StartMonth: 1,
        EndMonth: 12,
        Description: "",
        Status: 1,
      });
    }
  }, [initial]);

  // ================= VALIDATE =================
  const validate = () => {
    const e = {};

    // SeasonCode – A-Z + 0-9 + _
    if (!form.SeasonCode.trim()) {
      e.SeasonCode = "Season code is required";
    } else if (!/^[A-Z0-9_]+$/.test(form.SeasonCode)) {
      e.SeasonCode = "Only uppercase letters, numbers and '_' are allowed";
    } else if (
      list.some(
        (i) =>
          i.SeasonCode === form.SeasonCode &&
          i.SeasonID !== (initial?.SeasonID ?? 0)
      )
    ) {
      e.SeasonCode = "Season code already exists";
    }

    // SeasonName – KHÔNG CHỨA SỐ
    if (!form.SeasonName.trim()) {
      e.SeasonName = "Season name is required";
    } else if (/\d/.test(form.SeasonName)) {
      e.SeasonName = "Season name cannot contain numbers";
    }

    // StartMonth
    if (form.StartMonth < 1 || form.StartMonth > 12) {
      e.StartMonth = "Start month must be between 1 and 12";
    }

    // EndMonth
    if (form.EndMonth < 1 || form.EndMonth > 12) {
      e.EndMonth = "End month must be between 1 and 12";
    }

    // Description
    if (!form.Description.trim()) {
      e.Description = "Description is required";
    } else if (form.Description.length < 10) {
      e.Description = "Description must be at least 10 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-2xl border border-neutral-200">
        <h2 className="text-xl font-bold text-neutral-900 mb-5 border-b border-primary-200 pb-3">
          {initial ? "Edit Season" : "Add Season"}
        </h2>

        {/* Season Code */}
        <div className="mb-3">
          <label className="text-sm font-medium">Season Code</label>
          <input
            type="text"
            value={form.SeasonCode}
            onChange={(e) => {
              const value = e.target.value.toUpperCase();
              if (/^[A-Z0-9_]*$/.test(value)) {
                setForm({ ...form, SeasonCode: value });
              }
            }}
            className={`w-full border rounded-lg px-3 py-2 mt-1.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
              errors.SeasonCode ? "border-red-500" : "border-neutral-200"
            }`}
          />
          {errors.SeasonCode && (
            <p className="text-xs text-red-600">{errors.SeasonCode}</p>
          )}
        </div>

        {/* Season Name */}
        <div className="mb-3">
          <label className="text-sm font-medium">Season Name</label>
          <input
            type="text"
            value={form.SeasonName}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[A-Za-zÀ-ỹ\s]*$/.test(value)) {
                setForm({ ...form, SeasonName: value });
              }
            }}
            className={`w-full border rounded-lg px-3 py-2 mt-1 ${errors.SeasonName ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.SeasonName && (
            <p className="text-xs text-red-600">{errors.SeasonName}</p>
          )}
        </div>

        {/* Start Month */}
        <div className="mb-3">
          <label className="text-sm font-medium">Start Month</label>
          <input
            type="number"
            min={1}
            max={12}
            value={form.StartMonth}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < 1 || value > 12) return;
              setForm({ ...form, StartMonth: value });
            }}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
          {errors.StartMonth && (
            <p className="text-xs text-red-600">{errors.StartMonth}</p>
          )}
        </div>

        {/* End Month */}
        <div className="mb-3">
          <label className="text-sm font-medium">End Month</label>
          <input
            type="number"
            min={1}
            max={12}
            value={form.EndMonth}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value < 1 || value > 12) return;
              setForm({ ...form, EndMonth: value });
            }}
            className="w-full border rounded-lg px-3 py-2 mt-1"
          />
          {errors.EndMonth && (
            <p className="text-xs text-red-600">{errors.EndMonth}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={form.Description}
            onChange={(e) =>
              setForm({ ...form, Description: e.target.value })
            }
            className={`w-full border rounded-lg px-3 py-2 mt-1 ${errors.Description ? "border-red-500" : "border-gray-300"
              }`}
          />
          {errors.Description && (
            <p className="text-xs text-red-600">{errors.Description}</p>
          )}
        </div>

        {/* Status */}
        <div className="mb-3">
          <label className="text-sm font-medium">Status</label>
          <select
            value={form.Status}
            onChange={(e) =>
              setForm({ ...form, Status: Number(e.target.value) })
            }
            className={`w-full border rounded-lg px-3 py-2 mt-1 ${errors.Status ? "border-red-500" : "border-gray-300"
              }`}
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>

          {errors.Status && (
            <p className="text-xs text-red-600">{errors.Status}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-200 transition font-medium"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 shadow-md transition font-semibold"
          >
            {initial ? "Save Changes" : "Add Season"}
          </button>
        </div>


      </div>
    </div>
  );
}
