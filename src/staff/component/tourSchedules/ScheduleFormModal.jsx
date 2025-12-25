import React, { useState, useEffect } from "react";
import { toast } from "../../shared/toast/toast";

export default function ScheduleFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  tourDetailID,
  existingSchedules = [],
  actualTourDays = null, // Actual tour days calculated from departure to arrival date
  departureDate = null, // Departure date for validation
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

    // Day Number validation
    if (!form.dayNumber || form.dayNumber === "") {
      e.dayNumber = "Day number is required";
    } else {
      const dayNum = Number(form.dayNumber);
      if (isNaN(dayNum) || dayNum < 1) {
        e.dayNumber = "Day number must be positive";
      } else {
        // Check duplicate dayNumber (only for create, not edit)
        if (!initial) {
          const duplicateDay = existingSchedules.some(
            (s) => (s.dayNumber || s.DayNumber) === dayNum
          );
          if (duplicateDay) {
            e.dayNumber = `Day ${dayNum} already exists. Please choose a different day number.`;
          }

          // Check sequential days: cannot skip days (must create Day 2 before Day 3, etc.)
          if (dayNum > 1) {
            // Find previous day schedule
            const previousDaySchedule = existingSchedules.find(
              (s) => (s.dayNumber || s.DayNumber) === dayNum - 1
            );
            
            if (!previousDaySchedule) {
              e.dayNumber = `Cannot create Day ${dayNum}. Please create Day ${dayNum - 1} first. Days must be created sequentially.`;
            } else {
              // Check if previous day has at least one activity (schedule item)
              const previousDayItems = previousDaySchedule.items || previousDaySchedule.Items || [];
              if (previousDayItems.length === 0) {
                e.dayNumber = `Cannot create Day ${dayNum}. Day ${dayNum - 1} must have at least one activity before creating the next day.`;
              }
            }
          }
        }

        // Check dayNumber doesn't exceed actual tour days (from departure to arrival)
        if (actualTourDays) {
          const actualDays = Number(actualTourDays);
          if (!isNaN(actualDays) && dayNum > actualDays) {
            e.dayNumber = `Day number cannot exceed actual tour duration (${actualDays} days from departure to arrival)`;
          }
        }
      }
    }

    // Title validation (required)
    if (!form.title || form.title.trim() === "") {
      e.title = "Day title is required";
    } else if (form.title.trim().length > 255) {
      e.title = "Title must not exceed 255 characters";
    }

    // Summary validation (required)
    if (!form.summary || form.summary.trim() === "") {
      e.summary = "Summary is required";
    } else if (form.summary.trim().length > 1000) {
      e.summary = "Summary must not exceed 1000 characters";
    }

    // Notes validation (required)
    if (!form.notes || form.notes.trim() === "") {
      e.notes = "Notes is required";
    } else if (form.notes.trim().length > 1000) {
      e.notes = "Notes must not exceed 1000 characters";
    }

    // Departure date validation (only for create, not edit)
    if (!initial && departureDate) {
      const departure = new Date(departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const minDate = new Date(today);
      minDate.setDate(today.getDate() + 5); // At least 5 days from today

      if (departure < minDate) {
        const daysDiff = Math.ceil((departure - today) / (1000 * 60 * 60 * 24));
        e.departureDate = `Tour departure date must be at least 5 days from today. Selected departure is only ${daysDiff} day(s) away.`;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }
    
    if (!tourDetailID) {
      toast.error("Tour Detail ID is required");
      return;
    }
    
    const payload = {
      tourDetailID: Number(tourDetailID),
      dayNumber: Number(form.dayNumber),
      title: form.title.trim(),
      summary: form.summary.trim(),
      notes: form.notes.trim(),
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
              Day Title <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.title ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                // Clear error when user types
                if (errors.title) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.title;
                    return next;
                  });
                }
              }}
              placeholder="e.g., Day 1: Departure - Da Nang - Ba Na Hills"
              maxLength={255}
            />
            {errors.title && (
              <p className="text-red-600 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition resize-none ${
                errors.summary ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.summary}
              onChange={(e) => {
                setForm({ ...form, summary: e.target.value });
                // Clear error when user types
                if (errors.summary) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.summary;
                    return next;
                  });
                }
              }}
              placeholder="Brief summary of main activities for the day..."
              maxLength={1000}
            />
            {errors.summary && (
              <p className="text-red-600 text-xs mt-1">{errors.summary}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition resize-none ${
                errors.notes ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.notes}
              onChange={(e) => {
                setForm({ ...form, notes: e.target.value });
                // Clear error when user types
                if (errors.notes) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.notes;
                    return next;
                  });
                }
              }}
              placeholder="Special notes about weather, conditions, requirements..."
              maxLength={1000}
            />
            {errors.notes && (
              <p className="text-red-600 text-xs mt-1">{errors.notes}</p>
            )}
          </div>

          {/* Departure Date Warning (only show for create, not edit) */}
          {!initial && departureDate && errors.departureDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-amber-800 text-sm">{errors.departureDate}</p>
              </div>
            </div>
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
            {initial ? "Save Changes" : "Add Day"}
          </button>
        </div>
      </div>
    </div>
  );
}





