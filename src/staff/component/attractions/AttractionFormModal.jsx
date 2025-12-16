import React, { useState, useEffect } from "react";

export default function AttractionFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  cities = [],

}) {
  const [form, setForm] = useState({
    CityID: "",
    Name: "",
    Address: "",
    Status: 1,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        CityID: initial?.CityID ?? "",
        Name: initial?.Name ?? "",
        Address: initial?.Address ?? "",
        Status: initial?.Status ?? 1,
      });
    } else {
      setForm({
        CityID: "",
        Name: "",
        Address: "",
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

    // --- CityID ---
    if (!form.CityID) {
      e.CityID = "Please select a city";
    }

    // --- Name ---
    if (!form.Name.trim()) {
      e.Name = "Attraction name is required";
    } else if (form.Name.length < 3) {
      e.Name = "Name must be at least 3 characters";
    }

    // --- Address --- (optional)
    if (form.Address && form.Address.length > 255) {
      e.Address = "Address cannot exceed 255 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const payload = {
      ...form,
      CityID: Number(form.CityID),
    };
    
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-neutral-900 mb-5 border-b border-primary-200 pb-3">
          {initial ? "Edit Attraction" : "Add New Attraction"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              City <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.CityID ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.CityID}
              onChange={(e) => setForm({ ...form, CityID: e.target.value })}
            >
              <option value="">-- Select City --</option>
              {cities.map((city) => (
                <option key={city.CityID} value={city.CityID}>
                  {city.CityName} ({city.CityCode})
                </option>
              ))}
            </select>
            {errors.CityID && (
              <p className="text-red-600 text-xs mt-1">{errors.CityID}</p>
            )}
          </div>

          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Attraction Name <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.Name ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.Name}
              onChange={(e) => setForm({ ...form, Name: e.target.value })}
              placeholder="E.g: Ba Na Hills"
            />
            {errors.Name && (
              <p className="text-red-600 text-xs mt-1">{errors.Name}</p>
            )}
          </div>

          {/* Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Address
            </label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.Address ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.Address}
              onChange={(e) => setForm({ ...form, Address: e.target.value })}
              placeholder="E.g: Hoa Vang, Da Nang"
            />
            {errors.Address && (
              <p className="text-red-600 text-xs mt-1">{errors.Address}</p>
            )}
          </div>

          {/* Status */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Status
            </label>
            <select
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition"
              value={form.Status}
              onChange={(e) => setForm({ ...form, Status: Number(e.target.value) })}
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
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
            {initial ? "Save Changes" : "Add Attraction"}
          </button>
        </div>
      </div>
    </div>
  );
}





