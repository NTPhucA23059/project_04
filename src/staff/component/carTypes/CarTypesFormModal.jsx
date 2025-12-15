import React, { useEffect, useState } from "react";

export default function CarTypesFormModal({
  open,
  onClose,
  initial,
  onSave,
  existing,
}) {
  const [form, setForm] = useState({
    typeCode: "",
    typeName: "",
    description: "",
    status: 1,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        typeCode: initial.typeCode || "",
        typeName: initial.typeName || "",
        description: initial.description || "",
        status: initial.status ?? 1,
      });
    } else {
      setForm({
        typeCode: "",
        typeName: "",
        description: "",
        status: 1,
      });
    }
    setErrors({});
  }, [initial, open]);

  const validate = () => {
    const e = {};

    if (!form.typeCode.trim()) e.typeCode = "Type Code is required.";
    else if (!/^[A-Z_]+$/.test(form.typeCode.trim()))
      e.typeCode = "Type Code must be uppercase with '_' only.";

    if (!form.typeName.trim()) e.typeName = "Type Name is required.";
    else if (!/^Xe\s+\d+\s+chỗ$/i.test(form.typeName.trim()))
      e.typeName = "Format must be: Xe 4 chỗ";

    if (form.description.length > 255)
      e.description = "Description must be under 255 characters.";

    if (![0, 1].includes(Number(form.status)))
      e.status = "Invalid status value";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({
      typeCode: form.typeCode.trim(),
      typeName: form.typeName.trim(),
      description: form.description.trim(),
      status: Number(form.status),
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 shadow-2xl border border-neutral-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-500 hover:text-neutral-700 transition text-xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-neutral-900 mb-5 border-b border-primary-200 pb-3">
          {initial ? "Edit Car Type" : "Add Car Type"}
        </h2>

        <div className="space-y-3">

          {/* Type Code */}
          <div>
            <label className="text-sm font-medium">Type Code</label>
            <input
              value={form.typeCode}
              onChange={(e) => {
                const v = e.target.value.toUpperCase();
                if (/^[A-Z_]*$/.test(v))
                  setForm({ ...form, typeCode: v });
              }}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition"
            />
            {errors.typeCode && <p className="text-xs text-red-600">{errors.typeCode}</p>}
          </div>

          {/* Type Name */}
          <div>
            <label className="text-sm font-medium">Type Name</label>
            <input
              value={form.typeName}
              onChange={(e) => setForm({ ...form, typeName: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition"
              placeholder="Xe 4 chỗ"
            />
            {errors.typeName && <p className="text-xs text-red-600">{errors.typeName}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition"
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: Number(e.target.value) })
              }
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
            {errors.status && <p className="text-xs text-red-600">{errors.status}</p>}
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-neutral-200 gap-3">
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
            {initial ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
