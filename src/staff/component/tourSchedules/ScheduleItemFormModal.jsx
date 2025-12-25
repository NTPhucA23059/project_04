import React, { useState, useEffect } from "react";
import { getAllAttractions } from "../../../services/staff/attractionStaffService";
import { toast } from "../../shared/toast/toast";

export default function ScheduleItemFormModal({
  open,
  onClose,
  onSubmit,
  initial,
  existingItems = [],
  scheduleID,
  allowedCityIDs = [], // Danh sách cityID được phép (từ tour cities)
}) {
  const [form, setForm] = useState({
    timeInfo: "",
    activity: "",
    transportation: "",
    sortOrder: "",
    attractionID: null,
  });

  const [errors, setErrors] = useState({});
  const [attractions, setAttractions] = useState([]);
  const [loadingAttractions, setLoadingAttractions] = useState(false);

  // Load attractions when modal opens or allowedCityIDs changes
  useEffect(() => {
    if (open) {
      loadAttractions();
    }
  }, [open, allowedCityIDs]);

  const loadAttractions = async () => {
    setLoadingAttractions(true);
    try {
      const data = await getAllAttractions();
      // Filter: chỉ lấy attractions có status = 1 và thuộc các thành phố được phép
      let filtered = data.filter(a => a.status === 1) || [];
      
      // Nếu có allowedCityIDs, chỉ hiển thị attractions thuộc các thành phố đó
      if (allowedCityIDs && allowedCityIDs.length > 0) {
        filtered = filtered.filter(a => {
          const cityID = a.cityID || a.CityID;
          return cityID && allowedCityIDs.includes(cityID);
        });
      }
      
      setAttractions(filtered);
    } catch (err) {
      console.error("Failed to load attractions:", err);
      toast.error("Failed to load attractions");
    } finally {
      setLoadingAttractions(false);
    }
  };

  // Load data when editing
  useEffect(() => {
    if (initial) {
      setForm({
        timeInfo: initial?.timeInfo || "",
        activity: initial?.activity || "",
        transportation: initial?.transportation || "",
        sortOrder: initial?.sortOrder || "",
        attractionID: initial?.attractionID || null,
      });
    } else {
      // Tự động tính thứ tự tiếp theo (bắt đầu từ 1)
      const maxOrder = existingItems.length > 0
        ? Math.max(...existingItems.map(i => i.sortOrder || i.SortOrder || 0))
        : 0;
      
      setForm({
        timeInfo: "",
        activity: "",
        transportation: "",
        sortOrder: maxOrder + 1, // Tự động tăng từ 1, 2, 3...
        attractionID: null,
      });
    }
    setErrors({});
  }, [initial, open, existingItems]);

  // Helper function to parse timeInfo to comparable value (minutes from midnight)
  const parseTimeToMinutes = (timeInfo) => {
    if (!timeInfo || timeInfo.trim() === "") return null;

    // Handle text-based time slots
    const textSlots = {
      "Morning": 360,      // 6:00 AM
      "Afternoon": 780,    // 1:00 PM
      "Evening": 1080,     // 6:00 PM
      "Night": 1320,       // 10:00 PM
      "Full Day": 0,       // Start of day
    };
    
    if (textSlots[timeInfo] !== undefined) {
      return textSlots[timeInfo];
    }

    // Handle time range format "HH:mm - HH:mm"
    const match = timeInfo.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      const startHour = parseInt(match[1], 10);
      const startMin = parseInt(match[2], 10);
      return startHour * 60 + startMin; // Convert to minutes from midnight
    }

    return null;
  };

  // ============================
  // VALIDATION
  // ============================
  const validate = () => {
    const e = {};

    // Activity validation (required)
    if (!form.activity || form.activity.trim() === "") {
      e.activity = "Activity is required";
    } else if (form.activity.trim().length < 3) {
      e.activity = "Activity must be at least 3 characters";
    } else if (form.activity.trim().length > 500) {
      e.activity = "Activity must not exceed 500 characters";
    }

    // Sort Order validation
    if (!form.sortOrder || form.sortOrder === "") {
      e.sortOrder = "Sort order is required";
    } else {
      const order = Number(form.sortOrder);
      if (isNaN(order) || order < 1) {
        e.sortOrder = "Sort order must be positive";
      } else {
        // Check duplicate sortOrder (skip current item when editing)
        if (existingItems && existingItems.length > 0) {
          const initialItemID = initial?.itemID || initial?.ItemID;
          const duplicateOrder = existingItems.some(
            (item) => {
              const itemID = item.itemID || item.ItemID;
              // Skip current item when editing
              return itemID !== initialItemID && (item.sortOrder || item.SortOrder) === order;
            }
          );
          if (duplicateOrder) {
            e.sortOrder = `Sort order ${order} already exists. Please choose a different order.`;
          }
        }
      }
    }

    // Time Info validation (required)
    if (!form.timeInfo || form.timeInfo.trim() === "") {
      e.timeInfo = "Time slot is required";
    } else {
      const currentTimeInfo = form.timeInfo.trim();

      // Check duplicate timeInfo
      if (existingItems && existingItems.length > 0) {
        const initialItemID = initial?.itemID || initial?.ItemID;
        const duplicateTime = existingItems.some(
          (item) => {
            const itemID = item.itemID || item.ItemID;
            // Skip current item when editing
            const itemTimeInfo = (item.timeInfo || item.TimeInfo || "").trim();
            return itemID !== initialItemID && itemTimeInfo === currentTimeInfo && itemTimeInfo !== "";
          }
        );
        if (duplicateTime) {
          e.timeInfo = `Time slot "${currentTimeInfo}" already exists. Please choose a different time slot.`;
        } else {
          // Check time order: giờ sau phải lớn hơn giờ trước
          const currentTimeMinutes = parseTimeToMinutes(currentTimeInfo);
          const currentOrder = Number(form.sortOrder);

          if (currentTimeMinutes !== null) {
            // Check if there's an item with lower sortOrder that has later time
            const hasEarlierOrderWithLaterTime = existingItems.some((item) => {
              const itemID = item.itemID || item.ItemID;
              if (itemID === initialItemID) return false; // Skip current item when editing

              const itemOrder = Number(item.sortOrder || item.SortOrder);
              const itemTimeInfo = (item.timeInfo || item.TimeInfo || "").trim();
              const itemTimeMinutes = parseTimeToMinutes(itemTimeInfo);

              if (itemTimeMinutes === null) return false; // Skip items without timeInfo

              // If item has lower sortOrder but later time, it's invalid
              return itemOrder < currentOrder && itemTimeMinutes > currentTimeMinutes;
            });

            if (hasEarlierOrderWithLaterTime) {
              e.timeInfo = "Time slot must be in chronological order. Earlier activities must have earlier times.";
            } else {
              // Check if there's an item with higher sortOrder that has earlier time
              const hasLaterOrderWithEarlierTime = existingItems.some((item) => {
                const itemID = item.itemID || item.ItemID;
                if (itemID === initialItemID) return false; // Skip current item when editing

                const itemOrder = Number(item.sortOrder || item.SortOrder);
                const itemTimeInfo = (item.timeInfo || item.TimeInfo || "").trim();
                const itemTimeMinutes = parseTimeToMinutes(itemTimeInfo);

                if (itemTimeMinutes === null) return false; // Skip items without timeInfo

                // If item has higher sortOrder but earlier time, it's invalid
                return itemOrder > currentOrder && itemTimeMinutes < currentTimeMinutes;
              });

              if (hasLaterOrderWithEarlierTime) {
                e.timeInfo = "Time slot must be in chronological order. Later activities must have later times.";
              }
            }
          }
        }
      }
    }

    // Transportation validation (required)
    if (!form.transportation || form.transportation.trim() === "") {
      e.transportation = "Transportation is required";
    } else if (form.transportation.trim().length > 100) {
      e.transportation = "Transportation must not exceed 100 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const payload = {
      timeInfo: form.timeInfo.trim(),
      activity: form.activity.trim(),
      transportation: form.transportation.trim(),
      sortOrder: Number(form.sortOrder),
      attractionID: form.attractionID || null,
    };
    
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-neutral-200 p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-neutral-900 mb-5 border-b border-primary-200 pb-3">
          {initial ? "Edit Activity" : "Add Activity"}
        </h2>

        <div className="space-y-4">
          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Sort Order <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              readOnly
              disabled
              className={`w-full border rounded-lg px-3 py-2.5 text-sm bg-neutral-50 text-neutral-600 cursor-not-allowed ${
                errors.sortOrder ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.sortOrder}
            />
            {errors.sortOrder && (
              <p className="text-red-600 text-xs mt-1">{errors.sortOrder}</p>
            )}
          </div>

          {/* Time Info */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Time Slot <span className="text-red-500">*</span>
            </label>
            <select
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.timeInfo ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.timeInfo}
              onChange={(e) => {
                setForm({ ...form, timeInfo: e.target.value });
                // Clear error when user changes time
                if (errors.timeInfo) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.timeInfo;
                    return next;
                  });
                }
              }}
            >
              <option value="">-- Select time slot --</option>
              <option value="05:00 - 07:00">05:00 - 07:00</option>
              <option value="07:00 - 08:00">07:00 - 08:00</option>
              <option value="08:00 - 09:00">08:00 - 09:00</option>
              <option value="09:00 - 10:00">09:00 - 10:00</option>
              <option value="10:00 - 11:00">10:00 - 11:00</option>
              <option value="11:00 - 12:00">11:00 - 12:00</option>
              <option value="12:00 - 13:00">12:00 - 13:00</option>
              <option value="13:00 - 14:00">13:00 - 14:00</option>
              <option value="14:00 - 15:00">14:00 - 15:00</option>
              <option value="15:00 - 16:00">15:00 - 16:00</option>
              <option value="16:00 - 17:00">16:00 - 17:00</option>
              <option value="17:00 - 18:00">17:00 - 18:00</option>
              <option value="18:00 - 19:00">18:00 - 19:00</option>
              <option value="19:00 - 20:00">19:00 - 20:00</option>
              <option value="20:00 - 21:00">20:00 - 21:00</option>
              <option value="21:00 - 22:00">21:00 - 22:00</option>
              <option value="22:00 - 23:00">22:00 - 23:00</option>
              <option value="Morning">Morning</option>
              <option value="Afternoon">Afternoon</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
              <option value="Full Day">Full Day</option>
            </select>
            {errors.timeInfo && (
              <p className="text-red-600 text-xs mt-1">{errors.timeInfo}</p>
            )}
          </div>

          {/* Activity */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Activity <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition resize-none ${
                errors.activity ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.activity}
              onChange={(e) => {
                setForm({ ...form, activity: e.target.value });
                // Clear error when user types
                if (errors.activity) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.activity;
                    return next;
                  });
                }
              }}
              placeholder="Describe the activity in detail..."
            />
            {errors.activity && (
              <p className="text-red-600 text-xs mt-1">{errors.activity}</p>
            )}
          </div>

          {/* Transportation */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Transportation <span className="text-red-500">*</span>
            </label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.transportation ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.transportation}
              onChange={(e) => {
                setForm({ ...form, transportation: e.target.value });
                // Clear error when user types
                if (errors.transportation) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.transportation;
                    return next;
                  });
                }
              }}
              placeholder="e.g., Bus, Train, Plane, Walking..."
              maxLength={100}
            />
            {errors.transportation && (
              <p className="text-red-600 text-xs mt-1">{errors.transportation}</p>
            )}
          </div>

          {/* Attraction */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Attraction (Optional)
            </label>
            <select
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.attractionID ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.attractionID || ""}
              onChange={(e) => setForm({ ...form, attractionID: e.target.value ? Number(e.target.value) : null })}
              disabled={loadingAttractions}
            >
              <option value="">-- Select attraction --</option>
              {attractions.length === 0 ? (
                <option value="" disabled>
                  {allowedCityIDs && allowedCityIDs.length > 0 
                    ? "No attractions available in tour cities"
                    : "Please select a tour first"}
                </option>
              ) : (
                attractions.map((attr) => (
                  <option key={attr.attractionID} value={attr.attractionID}>
                    {attr.name || attr.attractionName} {attr.cityName ? `(${attr.cityName})` : ""}
                  </option>
                ))
              )}
            </select>
            {errors.attractionID && (
              <p className="text-red-600 text-xs mt-1">{errors.attractionID}</p>
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
            {initial ? "Save Changes" : "Add Activity"}
          </button>
        </div>
      </div>
    </div>
  );
}
