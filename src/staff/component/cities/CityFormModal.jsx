import React, { useState, useEffect } from "react";

export default function CityFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  list = [],
}) {
  const [form, setForm] = useState({
    CityCode: "",
    CityName: "",
    Country: "Việt Nam",
    Description: "",
    Status: 1,
  });

  const [errors, setErrors] = useState({});

  // Load data when editing
  useEffect(() => {
    if (initial) {
      setForm({
        CityCode: initial?.CityCode ?? "",
        CityName: initial?.CityName ?? "",
        Country: initial?.Country ?? "Việt Nam",
        Description: initial?.Description ?? "",
        Status: initial?.Status ?? 1,
      });
    } else {
      setForm({
        CityCode: "",
        CityName: "",
        Country: "Việt Nam",
        Description: "",
        Status: 1,
      });
    }
    setErrors({});
  }, [initial, open]);

  // ============================
  // VALIDATION
  // ============================
  const validate = () => {
    const e = {};
    const listSafe = list ?? [];

    // --- CityCode ---
    if (!form.CityCode.trim()) {
      e.CityCode = "City code is required";
    } else if (form.CityCode.length < 2) {
      e.CityCode = "Code must be at least 2 characters";
    } else if (!/^[A-Z0-9_]+$/.test(form.CityCode)) {
      e.CityCode = "Only uppercase letters, numbers and _ allowed";
    } else if (
      listSafe.some(
        (i) =>
          i.CityCode === form.CityCode &&
          i.CityID !== (initial?.CityID ?? null)
      )
    ) {
      e.CityCode = "City code already exists";
    }

    // --- CityName ---
    if (!form.CityName.trim()) {
      e.CityName = "City name is required";
    } else if (form.CityName.length < 2) {
      e.CityName = "Name must be at least 2 characters";
    }

    // --- Country ---
    if (!form.Country.trim()) {
      e.Country = "Country is required";
    }

    // --- Description --- (optional but validate if provided)
    if (form.Description && form.Description.length > 255) {
      e.Description = "Description cannot exceed 255 characters";
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
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-200 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-neutral-900 mb-5 border-b border-primary-200 pb-3">
          {initial ? "Edit City" : "Add New City"}
        </h2>

        {/* City Code */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            City Code <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
              errors.CityCode ? "border-red-500" : "border-neutral-200"
            }`}
            value={form.CityCode}
            onChange={(e) =>
              setForm({ ...form, CityCode: e.target.value.toUpperCase() })
            }
            placeholder="E.g: HCM, HN, DN"
            disabled={!!initial} // Disable when editing
          />
          {errors.CityCode && (
            <p className="text-red-600 text-xs mt-1">{errors.CityCode}</p>
          )}
        </div>

        {/* City Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            City Name <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
              errors.CityName ? "border-red-500" : "border-neutral-200"
            }`}
            value={form.CityName}
            onChange={(e) =>
              setForm({ ...form, CityName: e.target.value })
            }
            placeholder="E.g: Ho Chi Minh City"
          />
          {errors.CityName && (
            <p className="text-red-600 text-xs mt-1">{errors.CityName}</p>
          )}
        </div>

        {/* Country */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Country <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
              errors.Country ? "border-red-500" : "border-neutral-200"
            }`}
            value={form.Country}
            onChange={(e) =>
              setForm({ ...form, Country: e.target.value })
            }
            placeholder="E.g: Vietnam"
          />
          {errors.Country && (
            <p className="text-red-600 text-xs mt-1">{errors.Country}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Description
          </label>
          <textarea
            rows={3}
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition resize-none ${
              errors.Description ? "border-red-500" : "border-neutral-200"
            }`}
            value={form.Description}
            onChange={(e) =>
              setForm({ ...form, Description: e.target.value })
            }
            placeholder="Brief description about the city..."
          />
          {errors.Description && (
            <p className="text-red-600 text-xs mt-1">{errors.Description}</p>
          )}
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-neutral-700 mb-1.5">
            Status
          </label>
          <select
            className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition"
            value={form.Status}
            onChange={(e) =>
              setForm({ ...form, Status: Number(e.target.value) })
            }
          >
            <option value={1}>Active</option>
            <option value={0}>Inactive</option>
          </select>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
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
            {initial ? "Save Changes" : "Add City"}
          </button>
        </div>
      </div>
    </div>
  );
}


