import { useState, useEffect } from "react";
import {
  UserCircleIcon,
  CameraIcon,
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { getCurrentProfile, updateProfile, changePassword } from "../../../services/admin/profileAdminService";

export default function ManageAdminProfile() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    gender: "",
    username: "",
    roleName: "",
  });

  const [originalProfileData, setOriginalProfileData] = useState({});

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError("");
      try {
        const data = await getCurrentProfile();
        setProfileData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          nationality: data.nationality || "",
          gender: data.gender || "",
          username: data.username || "",
          roleName: data.roleName || "",
        });
        setOriginalProfileData({
          fullName: data.fullName || "",
          email: data.email || "",
          phone: data.phone || "",
          nationality: data.nationality || "",
          gender: data.gender || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load profile information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    if (passwordErrors[name]) {
      setPasswordErrors({ ...passwordErrors, [name]: "" });
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Please enter current password";
    }
    if (!passwordData.newPassword) {
      errors.newPassword = "Please enter new password";
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (passwordData.currentPassword && passwordData.newPassword === passwordData.currentPassword) {
      errors.newPassword = "New password must be different from current password";
    }
    if (!passwordData.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Confirm password does not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updateData = {
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone || null,
        nationality: profileData.nationality || null,
        gender: profileData.gender || null,
      };

      await updateProfile(updateData);

      setOriginalProfileData({
        fullName: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        nationality: profileData.nationality,
        gender: profileData.gender,
      });

      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileData({
      ...profileData,
      fullName: originalProfileData.fullName,
      email: originalProfileData.email,
      phone: originalProfileData.phone,
      nationality: originalProfileData.nationality,
      gender: originalProfileData.gender,
    });
    setIsEditing(false);
    setError("");
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) return;

    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload = {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      };

      const response = await changePassword(payload);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      setSuccessMessage(response.message || "Password changed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to change password");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <UserCircleIcon className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Profile Management</h1>
        </div>
        <p className="text-sm opacity-90">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* Avatar */}
            <div className="text-center mb-6">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full border-4 border-blue-100 mx-auto bg-blue-100 flex items-center justify-center">
                  <UserCircleIcon className="h-20 w-20 text-blue-600" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-4">
                {profileData.fullName || profileData.username}
              </h2>
              <p className="text-sm text-gray-600">{profileData.email}</p>
              {profileData.roleName && (
                <span className="inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {profileData.roleName}
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  activeTab === "profile"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Personal Information
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  activeTab === "password"
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          {activeTab === "profile" ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Personal Information
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={profileData.username}
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Username cannot be changed
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCircleIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isEditing
                          ? "border-gray-300"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isEditing
                          ? "border-gray-300"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isEditing
                          ? "border-gray-300"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nationality
                    </label>
                    <input
                      type="text"
                      name="nationality"
                      value={profileData.nationality}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isEditing
                          ? "border-gray-300"
                          : "border-gray-200 bg-gray-50"
                      }`}
                      placeholder="Enter nationality"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={profileData.gender}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isEditing
                          ? "border-gray-300"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <LockClosedIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">
                  Change Password
                </h3>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      passwordErrors.currentPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter current password"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      passwordErrors.newPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      passwordErrors.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Re-enter new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Processing..." : "Change Password"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
