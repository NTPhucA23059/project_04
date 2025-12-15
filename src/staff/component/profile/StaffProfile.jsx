import React, { useState, useEffect } from "react";
import { getCurrentProfile, updateProfile, changePassword } from "../../../services/staff/profileStaffService";
import { toast } from "../../shared/toast/toast";

export default function StaffProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [contact, setContact] = useState({
    email: "",
    phone: "",
    nationality: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCurrentProfile();
      setProfile(data);
      setContact({
        email: data.email || "",
        phone: data.phone || "",
        nationality: data.nationality || "",
      });
    } catch (err) {
      console.error("Error loading profile:", err);
      setError(err.message || "Failed to load profile");
      toast.error(err.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async () => {
    try {
      setSaving(true);
      setError("");
      const updateData = {
        fullName: profile.fullName,
        email: contact.email,
        phone: contact.phone,
        nationality: contact.nationality,
        gender: profile.gender || "",
      };
      const updated = await updateProfile(updateData);
      setProfile(updated.profile || updated);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.message || "Failed to change password");
      toast.error(err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-neutral-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 font-medium">{error}</p>
        <button
          onClick={loadProfile}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Generate avatar from initials
  const getAvatarUrl = () => {
    if (profile.fullName) {
      const initials = profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=F97316&color=fff&size=128`;
    }
    return "https://i.pravatar.cc/150?img=15";
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-4 md:items-center">
        <img
          src={getAvatarUrl()}
          alt="avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-primary-200"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900">{profile.fullName || profile.username || "Staff"}</h1>
          <p className="text-sm text-neutral-600 font-medium">
            {profile.roleName || "Staff"} {profile.roleDescription ? `• ${profile.roleDescription}` : ""}
          </p>
          <p className="text-sm text-neutral-500">Username: {profile.username}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm w-full md:w-auto">
          <Stat label="Account ID" value={profile.accountID || "—"} />
          <Stat label="Status" value={profile.status === 1 ? "Active" : "Inactive"} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-neutral-900 text-lg border-b border-primary-200 pb-2">Personal Information</h3>
          <InfoRow label="Full Name" value={profile.fullName || "—"} />
          <InfoRow label="Username" value={profile.username || "—"} />
          <InfoRow label="Role" value={profile.roleName || "—"} />
          <InfoRow label="Role Description" value={profile.roleDescription || "—"} />
          <InfoRow label="Gender" value={profile.gender || "—"} />
          <InfoRow label="Nationality" value={profile.nationality || "—"} />
          <InfoRow label="Citizen Card" value={profile.citizenCard || "—"} />
          <InfoRow label="Status" value={profile.status === 1 ? "Active" : "Inactive"} />
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-neutral-900 text-lg border-b border-primary-200 pb-2">Contact Information</h3>
          <EditRow
            label="Email"
            value={contact.email}
            onChange={(v) => setContact({ ...contact, email: v })}
          />
          <EditRow
            label="Phone"
            value={contact.phone}
            onChange={(v) => setContact({ ...contact, phone: v })}
          />
          <EditRow
            label="Nationality"
            value={contact.nationality}
            onChange={(v) => setContact({ ...contact, nationality: v })}
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveContact}
              disabled={saving}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 text-sm font-semibold shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-neutral-900 text-lg border-b border-primary-200 pb-2">Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="border border-neutral-200 rounded-lg p-4 bg-primary-50/30">
            <p className="font-semibold text-neutral-900">Change Password</p>
            <p className="text-xs text-neutral-600 mt-1">Update your account password.</p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="mt-3 px-4 py-2 rounded-lg border border-primary-300 bg-white text-primary-700 hover:bg-primary-50 font-medium transition"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl border border-neutral-200">
            <h3 className="text-xl font-bold text-neutral-900 mb-5 border-b border-primary-200 pb-3">
              Change Password
            </h3>
            
            <div className="space-y-4">
              <EditRow
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(v) => setPasswordData({ ...passwordData, currentPassword: v })}
              />
              <EditRow
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(v) => setPasswordData({ ...passwordData, newPassword: v })}
              />
              <EditRow
                label="Confirm New Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(v) => setPasswordData({ ...passwordData, confirmPassword: v })}
              />
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setError("");
                }}
                className="px-5 py-2.5 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-200 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-lg hover:from-primary-700 hover:to-primary-600 shadow-md transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-center shadow-sm">
      <div className="text-lg font-bold text-primary-700">{value}</div>
      <div className="text-xs text-neutral-600 font-medium mt-1">{label}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm border-b border-neutral-100 py-2.5 last:border-b-0">
      <span className="text-neutral-600 font-medium">{label}</span>
      <span className="font-semibold text-neutral-900">{value || "—"}</span>
    </div>
  );
}

function EditRow({ label, value, onChange, type = "text" }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-neutral-700 font-medium">{label}</span>
      <input
        type={type}
        className="border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

