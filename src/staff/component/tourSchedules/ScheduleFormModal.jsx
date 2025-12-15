import React, { useState, useEffect } from "react";

export default function ScheduleFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  tourDetailID,
  existingSchedules = [],
}) {
  const [form, setForm] = useState({
    DayNumber: "",
    Title: "",
    MealInfo: "",
    Summary: "",
    Accommodation: "",
    CheckInTime: "",
    CheckOutTime: "",
    Notes: "",
  });

  const [errors, setErrors] = useState({});

  // Load data when editing
  useEffect(() => {
    if (initial) {
      setForm({
        DayNumber: initial?.DayNumber ?? "",
        Title: initial?.Title ?? "",
        MealInfo: initial?.MealInfo ?? "",
        Summary: initial?.Summary ?? "",
        Accommodation: initial?.Accommodation ?? "",
        CheckInTime: initial?.CheckInTime ?? "",
        CheckOutTime: initial?.CheckOutTime ?? "",
        Notes: initial?.Notes ?? "",
      });
    } else {
      // Auto-suggest next day number
      const maxDay = existingSchedules.length > 0
        ? Math.max(...existingSchedules.map(s => s.DayNumber))
        : 0;
      
      setForm({
        DayNumber: maxDay + 1,
        Title: "",
        MealInfo: "",
        Summary: "",
        Accommodation: "",
        CheckInTime: "",
        CheckOutTime: "",
        Notes: "",
      });
    }
    setErrors({});
  }, [initial, open, existingSchedules]);

  // ============================
  // VALIDATION
  // ============================
  const validate = () => {
    const e = {};

    // --- DayNumber ---
    if (!form.DayNumber || form.DayNumber === "") {
      e.DayNumber = "Số ngày là bắt buộc";
    } else {
      const dayNum = Number(form.DayNumber);
      if (isNaN(dayNum) || dayNum < 1) {
        e.DayNumber = "Số ngày phải là số dương";
      } else {
        // Check duplicate day number (except current editing)
        const duplicate = existingSchedules.find(
          s => s.DayNumber === dayNum && s.ScheduleID !== (initial?.ScheduleID ?? null)
        );
        if (duplicate) {
          e.DayNumber = `Ngày ${dayNum} đã tồn tại trong lịch trình`;
        }
      }
    }

    // --- Title --- (optional but recommended)
    if (form.Title && form.Title.length > 255) {
      e.Title = "Tiêu đề không được vượt quá 255 ký tự";
    }

    // --- MealInfo --- (optional)
    if (form.MealInfo && form.MealInfo.length > 255) {
      e.MealInfo = "Thông tin bữa ăn không được vượt quá 255 ký tự";
    }

    // --- Summary --- (optional)
    if (form.Summary && form.Summary.length > 500) {
      e.Summary = "Tóm tắt không được vượt quá 500 ký tự";
    }

    // --- Accommodation --- (optional)
    if (form.Accommodation && form.Accommodation.length > 255) {
      e.Accommodation = "Nơi nghỉ không được vượt quá 255 ký tự";
    }

    // --- CheckInTime / CheckOutTime --- (optional)
    if (form.CheckInTime && form.CheckInTime.length > 50) {
      e.CheckInTime = "Thời gian check-in không được vượt quá 50 ký tự";
    }
    if (form.CheckOutTime && form.CheckOutTime.length > 50) {
      e.CheckOutTime = "Thời gian check-out không được vượt quá 50 ký tự";
    }

    // --- Notes --- (optional)
    if (form.Notes && form.Notes.length > 1000) {
      e.Notes = "Ghi chú không được vượt quá 1000 ký tự";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const payload = {
      ...form,
      DayNumber: Number(form.DayNumber),
    };
    
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-neutral-900 mb-5 border-b border-primary-200 pb-3">
          {initial ? "Sửa Ngày Lịch trình" : "Thêm Ngày Lịch trình Mới"}
        </h2>

        <div className="space-y-4">
          {/* Day Number */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Số ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.DayNumber ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.DayNumber}
              onChange={(e) => setForm({ ...form, DayNumber: e.target.value })}
              placeholder="VD: 1, 2, 3..."
            />
            {errors.DayNumber && (
              <p className="text-red-600 text-xs mt-1">{errors.DayNumber}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Tiêu đề ngày
            </label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.Title ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.Title}
              onChange={(e) => setForm({ ...form, Title: e.target.value })}
              placeholder="VD: Ngày 1: Khởi hành - Đà Nẵng - Bà Nà Hills"
            />
            {errors.Title && (
              <p className="text-red-600 text-xs mt-1">{errors.Title}</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              {form.Title.length}/255 ký tự
            </p>
          </div>

          {/* Meal Info */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Thông tin bữa ăn
            </label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.MealInfo ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.MealInfo}
              onChange={(e) => setForm({ ...form, MealInfo: e.target.value })}
              placeholder="VD: Sáng, Trưa, Tối hoặc Trưa, Tối"
            />
            {errors.MealInfo && (
              <p className="text-red-600 text-xs mt-1">{errors.MealInfo}</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              Ghi rõ các bữa ăn được phục vụ trong ngày
            </p>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Tóm tắt hoạt động
            </label>
            <textarea
              rows={4}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition resize-none ${
                errors.Summary ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.Summary}
              onChange={(e) => setForm({ ...form, Summary: e.target.value })}
              placeholder="Tóm tắt ngắn gọn các hoạt động chính trong ngày..."
            />
            {errors.Summary && (
              <p className="text-red-600 text-xs mt-1">{errors.Summary}</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              {form.Summary.length}/500 ký tự
            </p>
          </div>

          {/* Accommodation */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Nơi nghỉ / Khách sạn
            </label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.Accommodation ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.Accommodation}
              onChange={(e) => setForm({ ...form, Accommodation: e.target.value })}
              placeholder="VD: Khách sạn 4 sao tại Đà Nẵng hoặc Resort Bà Nà"
            />
            {errors.Accommodation && (
              <p className="text-red-600 text-xs mt-1">{errors.Accommodation}</p>
            )}
          </div>

          {/* Check-in/Check-out Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Thời gian Check-in
              </label>
              <input
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                  errors.CheckInTime ? "border-red-500" : "border-neutral-200"
                }`}
                value={form.CheckInTime}
                onChange={(e) => setForm({ ...form, CheckInTime: e.target.value })}
                placeholder="VD: 14:00 hoặc Sau 14:00"
              />
              {errors.CheckInTime && (
                <p className="text-red-600 text-xs mt-1">{errors.CheckInTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Thời gian Check-out
              </label>
              <input
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                  errors.CheckOutTime ? "border-red-500" : "border-neutral-200"
                }`}
                value={form.CheckOutTime}
                onChange={(e) => setForm({ ...form, CheckOutTime: e.target.value })}
                placeholder="VD: 12:00 hoặc Trước 12:00"
              />
              {errors.CheckOutTime && (
                <p className="text-red-600 text-xs mt-1">{errors.CheckOutTime}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Ghi chú đặc biệt
            </label>
            <textarea
              rows={3}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition resize-none ${
                errors.Notes ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.Notes}
              onChange={(e) => setForm({ ...form, Notes: e.target.value })}
              placeholder="Ghi chú về thời tiết, lưu ý đặc biệt, điều kiện tham gia..."
            />
            {errors.Notes && (
              <p className="text-red-600 text-xs mt-1">{errors.Notes}</p>
            )}
            <p className="text-xs text-neutral-500 mt-1">
              {form.Notes.length}/1000 ký tự
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-200 transition font-medium"
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 shadow-md transition font-semibold"
          >
            {initial ? "Lưu thay đổi" : "Thêm ngày"}
          </button>
        </div>
      </div>
    </div>
  );
}


