import React from "react";
import TourCitiesSection from "./TourCitiesSection";
import TourDetailsSection from "./TourDetailsSection";

export default function TourFormModal({
  open,
  editing,
  form,
  errors,
  categories,
  saving,
  tourCities = [],
  tourDetails = [],
  onClose,
  onChange,
  onSave,
  onMainImageChange,
  onAddGallery,
  onRemoveImage,
  onTourCityAdd,
  onTourCityUpdate,
  onTourCityDelete,
  onTourDetailAdd,
  onTourDetailUpdate,
  onTourDetailDelete,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-90">
              {editing ? "Update tour" : "Create tour"}
            </p>
            <h3 className="text-lg font-semibold">
              {editing ? `Editing ${form.tourCode || "tour"}` : "Add new tour"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl leading-none"
          >
            ✖
          </button>
        </div>

        <div className="p-6 space-y-5 bg-neutral-50 overflow-y-auto">
          {/* Basic info + images */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-neutral-800 mb-3">Tour frame</p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500">Tour Code</label>
                  <input
                    className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                      errors.tourCode ? "border-red-500" : "border-neutral-200"
                    }`}
                    value={form.tourCode}
                    onChange={(e) =>
                      onChange({ ...form, tourCode: e.target.value })
                    }
                    placeholder="e.g. TOUR001"
                  />
                  {errors.tourCode && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.tourCode}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Tour Name</label>
                  <input
                    className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                      errors.tourName ? "border-red-500" : "border-neutral-200"
                    }`}
                    value={form.tourName}
                    onChange={(e) =>
                      onChange({ ...form, tourName: e.target.value })
                    }
                    placeholder="Amazing Vietnam"
                  />
                  {errors.tourName && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.tourName}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500">Country</label>
                    <input
                      className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                      value={form.nation}
                      onChange={(e) =>
                        onChange({ ...form, nation: e.target.value })
                      }
                      placeholder="Vietnam"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500">
                      Duration
                    </label>
                    <input
                      className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                      value={form.duration}
                      onChange={(e) =>
                        onChange({ ...form, duration: e.target.value })
                      }
                      placeholder="3 days 2 nights"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-neutral-500">
                    Starting Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                      errors.startingLocation
                        ? "border-red-500"
                        : "border-neutral-200"
                    }`}
                    value={form.startingLocation}
                    onChange={(e) =>
                      onChange({
                        ...form,
                        startingLocation: e.target.value,
                      })
                    }
                    placeholder="Hanoi"
                  />
                  {errors.startingLocation && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.startingLocation}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Category</label>
                  <select
                    className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                      errors.categoryID
                        ? "border-red-500"
                        : "border-neutral-200"
                    }`}
                    value={form.categoryID}
                    onChange={(e) =>
                      onChange({ ...form, categoryID: e.target.value })
                    }
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.categoryID} value={c.categoryID}>
                        {c.categoryName}
                      </option>
                    ))}
                  </select>
                  {errors.categoryID && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.categoryID}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-neutral-500">Status</label>
                  <select
                    className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                    value={form.status}
                    onChange={(e) =>
                      onChange({ ...form, status: e.target.value })
                    }
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-neutral-800 mb-3">Images</p>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500">
                    Main Image
                  </label>
                  <div className="border-2 border-dashed border-neutral-200 rounded-lg p-3 bg-neutral-50">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={onMainImageChange}
                    />
                    {form.tourImg && (
                      <img
                        src={form.tourImg}
                        className="h-28 mt-2 rounded-lg border object-cover w-full"
                      />
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-neutral-500">
                    Gallery Images
                  </label>
                  <div className="border-2 border-dashed border-neutral-200 rounded-lg p-3 bg-neutral-50">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={onAddGallery}
                    />
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={img.imageUrl || img}
                            className="h-20 w-full object-cover rounded border"
                          />
                          <button
                            type="button"
                            onClick={() => onRemoveImage(img, i)}
                            className="hidden group-hover:flex absolute top-1 right-1 h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white text-xs shadow-lg"
                            aria-label="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tour Cities & Details - chỉ hiển thị khi đang edit */}
          {editing && editing.tourID && (
            <div className="space-y-4">
              <TourCitiesSection
                tourID={editing.tourID}
                cities={[]}
                tourCities={tourCities}
                onAdd={onTourCityAdd}
                onUpdate={onTourCityUpdate}
                onDelete={onTourCityDelete}
              />
              <TourDetailsSection
                tourID={editing.tourID}
                tourDetails={tourDetails}
                onAdd={onTourDetailAdd}
                onUpdate={onTourDetailUpdate}
                onDelete={onTourDetailDelete}
              />
            </div>
          )}

          {/* Process hint */}
          {!editing && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-4 py-3">
              After creating the tour frame, you can configure route cities and
              departures in the edit mode.
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="border border-neutral-300 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-60"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


