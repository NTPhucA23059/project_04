import React, { useState, useEffect } from "react";

export default function CategoryFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  list = [],
}) {
  const [form, setForm] = useState({
    CategoryCode: "",
    CategoryName: "",
    Description: "",
    Status: 1,
  });

  const [errors, setErrors] = useState({});

  // Load data when editing
  useEffect(() => {
    if (initial) {
      setForm({
        CategoryCode: initial?.CategoryCode ?? "",
        CategoryName: initial?.CategoryName ?? "",
        Description: initial?.Description ?? "",
        Status: initial?.Status ?? 1,
      });
    } else {
      setForm({
        CategoryCode: "",
        CategoryName: "",
        Description: "",
        Status: 1,
      });
    }
  }, [initial]);



  // ============================
  // VALIDATION
  // ============================
  const validate = () => {
    const e = {};
    const listSafe = list ?? [];

    // --- CategoryCode ---
    if (!form.CategoryCode.trim()) {
      e.CategoryCode = "Category code is required";
    } else if (form.CategoryCode.length < 3) {
      e.CategoryCode = "Code must be at least 3 characters";
    } else if (!/^[A-Z0-9_]+$/.test(form.CategoryCode)) {
      e.CategoryCode = "Only uppercase letters, numbers and _ allowed";
    } else if (
      listSafe.some(
        (i) =>
          i.CategoryCode === form.CategoryCode &&
          i.CategoryID !== (initial?.CategoryID ?? null)
      )
    ) {
      e.CategoryCode = "Category code already exists";
    }

    // --- CategoryName ---
    if (!form.CategoryName.trim()) {
      e.CategoryName = "Category name is required";
    } else if (form.CategoryName.length < 3) {
      e.CategoryName = "Name must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9 ]+$/.test(form.CategoryName)) {
      e.CategoryName = "Name cannot contain special characters";
    }

    // --- Description ---
    if (!form.Description.trim()) {
      e.Description = "Description is required";
    } else if (form.Description.length < 10) {
      e.Description = "Description must be at least 10 characters";
    } else if (!/^[a-zA-Z0-9 .,]+$/.test(form.Description)) {
      e.Description = "Description contains invalid characters";
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
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-200 p-6">

        <h2 className="text-xl font-bold text-neutral-900 mb-5 border-b border-primary-200 pb-3">
          {initial ? "Edit Category" : "Add New Category"}
        </h2>

        {/* Category Code */}
        <div className="mb-3">
          <label className="text-sm font-medium">Category Code</label>
          <input
            className={`w-full border rounded-lg px-3 py-2 mt-1.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
              errors.CategoryCode ? "border-red-500" : "border-neutral-200"
            }`}
            value={form.CategoryCode}
            onChange={(e) =>
              setForm({ ...form, CategoryCode: e.target.value.toUpperCase() })
            }
          />
          {errors.CategoryCode && (
            <p className="text-red-600 text-xs">{errors.CategoryCode}</p>
          )}
        </div>

        {/* Category Name */}
        <div className="mb-3">
          <label className="text-sm font-medium">Category Name</label>
          <input
            className={`w-full border rounded-lg px-3 py-2 mt-1 ${errors.CategoryName ? "border-red-500" : "border-gray-300"
              }`}
            value={form.CategoryName}
            onChange={(e) =>
              setForm({ ...form, CategoryName: e.target.value })
            }
          />
          {errors.CategoryName && (
            <p className="text-red-600 text-xs">{errors.CategoryName}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-3">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className={`w-full border rounded-lg px-3 py-2 mt-1 ${errors.Description ? "border-red-500" : "border-gray-300"
              }`}
            value={form.Description}
            onChange={(e) =>
              setForm({ ...form, Description: e.target.value })
            }
          ></textarea>
          {errors.Description && (
            <p className="text-red-600 text-xs">{errors.Description}</p>
          )}
        </div>
        {/* Status */}
        <div className="mb-3">
          <label className="text-sm font-medium">Status</label>
          <select
            className={`w-full border rounded-lg px-3 py-2 mt-1`}
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
            {initial ? "Save Changes" : "Add Category"}
          </button>
        </div>
      </div>
    </div>
  );
}
