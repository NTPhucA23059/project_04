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
    Description: "",
    Address: "",
    Rating: "",
    ImageUrl: "",
    Status: 1,
  });

  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (initial) {
      setForm({
        CityID: initial?.CityID ?? "",
        Name: initial?.Name ?? "",
        Description: initial?.Description ?? "",
        Address: initial?.Address ?? "",
        Rating: initial?.Rating ?? "",
        ImageUrl: initial?.ImageUrl ?? "",
        Status: initial?.Status ?? 1,
      });
      setImagePreview(initial?.ImageUrl || null);
      setImageFile(null);
    } else {
      setForm({
        CityID: "",
        Name: "",
        Description: "",
        Address: "",
        Rating: "",
        ImageUrl: "",
        Status: 1,
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setErrors({});
  }, [initial, open]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, ImageUrl: "Please select an image file" });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, ImageUrl: "Image size must not exceed 5MB" });
        return;
      }
      
      setImageFile(file);
      setErrors({ ...errors, ImageUrl: null });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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

    // --- Description --- (optional but validate if provided)
    if (form.Description && form.Description.length > 5000) {
      e.Description = "Description cannot exceed 5000 characters";
    }

    // --- Address --- (optional)
    if (form.Address && form.Address.length > 255) {
      e.Address = "Address cannot exceed 255 characters";
    }

    // --- Rating --- (optional, but validate range if provided)
    if (form.Rating && form.Rating !== "") {
      const rating = Number(form.Rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        e.Rating = "Rating must be between 0 and 5";
      }
    }

    // --- ImageUrl --- (optional, but validate format if provided)
    if (form.ImageUrl && form.ImageUrl.length > 255) {
      e.ImageUrl = "Image URL cannot exceed 255 characters";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    
    const payload = {
      ...form,
      CityID: Number(form.CityID),
      Rating: form.Rating ? Number(form.Rating) : null,
    };
    
    // Pass image file separately
    onSubmit(payload, imageFile);
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

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition resize-none ${
                errors.Description ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.Description}
              onChange={(e) => setForm({ ...form, Description: e.target.value })}
              placeholder="Detailed description about the attraction..."
            />
            {errors.Description && (
              <p className="text-red-600 text-xs mt-1">{errors.Description}</p>
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

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Rating (0-5)
            </label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                errors.Rating ? "border-red-500" : "border-neutral-200"
              }`}
              value={form.Rating}
              onChange={(e) => setForm({ ...form, Rating: e.target.value })}
              placeholder="E.g: 4.5"
            />
            {errors.Rating && (
              <p className="text-red-600 text-xs mt-1">{errors.Rating}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Image
            </label>
            <div className="space-y-2">
              <div className="border-2 border-dashed border-neutral-200 rounded-lg p-4 bg-neutral-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {errors.ImageUrl && (
                  <p className="text-red-600 text-xs mt-1">{errors.ImageUrl}</p>
                )}
                <p className="text-xs text-neutral-500 mt-2">
                  Supported: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
              
              {/* Image Preview */}
              {(imagePreview || form.ImageUrl) && (
                <div className="mt-3">
                  <p className="text-xs text-neutral-600 mb-2">Preview:</p>
                  <div className="relative inline-block">
                    <img
                      src={imagePreview || form.ImageUrl}
                      alt="Preview"
                      className="h-32 w-auto rounded-lg border border-neutral-200 object-cover"
                    />
                    {imageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setForm({ ...form, ImageUrl: "" });
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
              
              {/* Fallback: URL input (optional) */}
              <div className="mt-2">
                <label className="block text-xs text-neutral-500 mb-1">
                  Or enter image URL (if not uploading file):
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition ${
                    errors.ImageUrl ? "border-red-500" : "border-neutral-200"
                  }`}
                  value={form.ImageUrl}
                  onChange={(e) => {
                    setForm({ ...form, ImageUrl: e.target.value });
                    if (e.target.value) {
                      setImageFile(null);
                      setImagePreview(e.target.value);
                    }
                  }}
                  placeholder="E.g: /images/ba-na-hills.jpg or https://..."
                />
              </div>
            </div>
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


