import React from "react";

export default function FlightFormModal({
  open,
  editing,
  form,
  errors,
  cities,
  saving,
  imageFile,
  onClose,
  onChange,
  onImageChange,
  onSave,
}) {
  const [imagePreview, setImagePreview] = React.useState(null);

  React.useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(imageFile);
    } else if (form.imageURL) {
      setImagePreview(form.imageURL);
    } else {
      setImagePreview(null);
    }
  }, [imageFile, form.imageURL]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must not exceed 5MB");
        return;
      }
      onImageChange(file);
    }
  };
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-primary-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-90">
              {editing ? "Update flight" : "Create flight"}
            </p>
            <h3 className="text-lg font-semibold">
              {editing
                ? `Editing ${form.flightCode || "flight"}`
                : "Add new flight"}
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
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-neutral-800 mb-3">Basic info</p>
              <div className="space-y-3">
                {!editing && (
                  <div>
                    <label className="text-xs text-neutral-500">
                      Flight Code
                    </label>
                    <input
                      className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                        errors.flightCode
                          ? "border-red-500"
                          : "border-neutral-200"
                      }`}
                      value={form.flightCode}
                      onChange={(e) =>
                        onChange({ ...form, flightCode: e.target.value })
                      }
                      placeholder="e.g. VN123"
                    />
                    {errors.flightCode && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.flightCode}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="text-xs text-neutral-500">Airline</label>
                  <input
                    className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                      errors.airline ? "border-red-500" : "border-neutral-200"
                    }`}
                    value={form.airline}
                    onChange={(e) =>
                      onChange({ ...form, airline: e.target.value })
                    }
                    placeholder="e.g. Vietnam Airlines"
                  />
                  {errors.airline && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.airline}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500">
                      From City
                    </label>
                    <select
                      className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                        errors.fromCityID
                          ? "border-red-500"
                          : "border-neutral-200"
                      }`}
                      value={form.fromCityID}
                      onChange={(e) =>
                        onChange({ ...form, fromCityID: e.target.value })
                      }
                    >
                      <option value="">-- Select --</option>
                      {cities.map((c) => (
                        <option key={c.cityID} value={c.cityID}>
                          {c.cityName}
                        </option>
                      ))}
                    </select>
                    {errors.fromCityID && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.fromCityID}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500">To City</label>
                    <select
                      className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                        errors.toCityID
                          ? "border-red-500"
                          : "border-neutral-200"
                      }`}
                      value={form.toCityID}
                      onChange={(e) =>
                        onChange({ ...form, toCityID: e.target.value })
                      }
                    >
                      <option value="">-- Select --</option>
                      {cities.map((c) => (
                        <option key={c.cityID} value={c.cityID}>
                          {c.cityName}
                        </option>
                      ))}
                    </select>
                    {errors.toCityID && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.toCityID}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <p className="font-semibold text-neutral-800 mb-3">
                Schedule & pricing
              </p>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-neutral-500">
                    Departure Time
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                      errors.departureTime
                        ? "border-red-500"
                        : "border-neutral-200"
                    }`}
                    value={form.departureTime}
                    onChange={(e) =>
                      onChange({ ...form, departureTime: e.target.value })
                    }
                  />
                  {errors.departureTime && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.departureTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-neutral-500">
                    Arrival Time
                  </label>
                  <input
                    type="datetime-local"
                    className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                      errors.arrivalTime
                        ? "border-red-500"
                        : "border-neutral-200"
                    }`}
                    value={form.arrivalTime}
                    onChange={(e) =>
                      onChange({ ...form, arrivalTime: e.target.value })
                    }
                  />
                  {errors.arrivalTime && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.arrivalTime}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-500">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                        errors.durationMinutes
                          ? "border-red-500"
                          : "border-neutral-200"
                      }`}
                      value={form.durationMinutes}
                      onChange={(e) =>
                        onChange({
                          ...form,
                          durationMinutes: e.target.value,
                        })
                      }
                      min={0}
                    />
                    {errors.durationMinutes && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.durationMinutes}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500">Price</label>
                    <input
                      type="number"
                      className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                        errors.price ? "border-red-500" : "border-neutral-200"
                      }`}
                      value={form.price}
                      onChange={(e) =>
                        onChange({ ...form, price: e.target.value })
                      }
                      min={0}
                      step="0.01"
                    />
                    {errors.price && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-500">Flight Type</label>
                  <input
                    className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
                    value={form.flightType}
                    onChange={(e) =>
                      onChange({ ...form, flightType: e.target.value })
                    }
                    placeholder="e.g. Economy, Business"
                  />
                </div>

                <div>
                  <label className="text-xs text-neutral-500">Status</label>
                  <select
                    className={`w-full border px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500 ${
                      errors.status ? "border-red-500" : "border-neutral-200"
                    }`}
                    value={form.status}
                    onChange={(e) =>
                      onChange({ ...form, status: e.target.value })
                    }
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                  {errors.status && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.status}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-neutral-800 mb-3">
              Schedule notes
            </p>
            <textarea
              className="w-full border border-neutral-200 px-3 py-2 rounded-lg mt-1 focus:ring-2 focus:ring-primary-500"
              rows={4}
              value={form.scheduleInfo}
              onChange={(e) =>
                onChange({ ...form, scheduleInfo: e.target.value })
              }
              placeholder="Notes about flight schedule, stops, etc."
            />
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <p className="font-semibold text-neutral-800 mb-3">Image</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Supported: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              {imagePreview && (
                <div className="mt-3">
                  <p className="text-xs text-neutral-600 mb-2">Preview:</p>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-32 w-auto rounded-lg border border-neutral-200 object-cover"
                    />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          onImageChange(null);
                          onChange({ ...form, imageURL: "" });
                        }}
                        className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center rounded-full bg-red-600 text-white text-xs shadow-lg hover:bg-red-700"
                        title="Remove image"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  Or enter image URL:
                </label>
                <input
                  type="text"
                  className="w-full border border-neutral-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  value={form.imageURL}
                  onChange={(e) => {
                    onChange({ ...form, imageURL: e.target.value });
                    if (e.target.value) {
                      onImageChange(null);
                    }
                  }}
                  placeholder="E.g: /uploads/flights/image.jpg or https://..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="border border-neutral-300 px-4 py-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




