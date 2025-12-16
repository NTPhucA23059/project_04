import React, { useState, useEffect } from "react";
import { toast } from "../../shared/toast/toast";

export default function ScheduleFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  tourDetailID,
  existingSchedules = [],
}) {
  const [form, setForm] = useState({
    dayNumber: "",
    title: "",
    summary: "",
    notes: "",
    items: [],
  });

  const [errors, setErrors] = useState({});

  // Load data when editing
  useEffect(() => {
    if (initial) {
      // Khi edit, giữ nguyên dayNumber nhưng không cho sửa
      setForm({
        dayNumber: initial?.dayNumber ?? initial?.DayNumber ?? "",
        title: initial?.title ?? initial?.Title ?? "",
        summary: initial?.summary ?? initial?.Summary ?? "",
        notes: initial?.notes ?? initial?.Notes ?? "",
        items: initial?.items || [],
      });
    } else {
      // Tự động tính số ngày tiếp theo (bắt đầu từ 1)
      const maxDay = existingSchedules.length > 0
        ? Math.max(...existingSchedules.map(s => s.dayNumber || s.DayNumber || 0))
        : 0;
      
      setForm({
        dayNumber: maxDay + 1, // Tự động tăng từ 1, 2, 3...
        title: "",
        summary: "",
        notes: "",
        items: [],
      });
    }
    setErrors({});
  }, [initial, open, existingSchedules]);

  // ============================
  // VALIDATION
  // ============================
  const validate = () => {
    const e = {};

    if (!form.dayNumber || form.dayNumber === "") {
      e.dayNumber = "Day number is required";
    } else {
      const dayNum = Number(form.dayNumber);
      if (isNaN(dayNum) || dayNum < 1) {
        e.dayNumber = "Day number must be positive";
      }
    }

    if (form.title && form.title.length > 255) {
      e.title = "Title must not exceed 255 characters";
    }

    if (form.summary && form.summary.length > 1000) {
      e.summary = "Summary must not exceed 1000 characters";
    }

    if (form.notes && form.notes.length > 1000) {
      e.notes = "Notes must not exceed 1000 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    if (!tourDetailID) {
      toast.error("Tour Detail ID is required");
      return;
    }
    
    const payload = {
      tourDetailID: Number(tourDetailID),
      dayNumber: Number(form.dayNumber),
      title: form.title?.trim() || null,
      summary: form.summary?.trim() || null,
      notes: form.notes?.trim() || null,
      items: form.items || [],
    };
    
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-neutral-900 mb-5 border-b border-primary-200 pb-3">
          {initial ? "Edit Schedule Day" : "Add Schedule Day"}
        </h2>

        <div className="space-y-4">
          {/* Day Number */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Day Number <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              readOnly
              disabled
              className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-neutral-50 text-neutral-600 cursor-not-allowed ${
                errors.dayNumber ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.dayNumber}
            />
            {errors.dayNumber && (
              <p className="text-red-600 text-xs mt-1">{errors.dayNumber}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Day Title
            </label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.title ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Day 1: Departure - Da Nang - Ba Na Hills"
            />
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Summary
            </label>
            <textarea
              rows={4}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition resize-none ${
                errors.summary ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="Brief summary of main activities for the day..."
            />
            {errors.summary && (
              <p className="text-red-600 text-xs mt-1">{errors.summary}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Notes
            </label>
            <textarea
              rows={3}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition resize-none ${
                errors.notes ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Special notes about weather, conditions, requirements..."
            />
            {errors.notes && (
              <p className="text-red-600 text-xs mt-1">{errors.notes}</p>
            )}
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
            {initial ? "Save Changes" : "Add Day"}
          </button>
        </div>
      </div>
    </div>
  );
}





