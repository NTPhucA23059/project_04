import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  FunnelIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { apiFetch } from "../../../services/admin/client";
import { toast } from "../../shared/toast/toast";
import { useConfirm } from "../../shared/confirm/useConfirm";
import ConfirmDialog from "../../shared/confirm/ConfirmDialog";

// Component to display detail row
function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-medium text-gray-700">{label}</span>
      <span className="text-gray-900">{value || "-"}</span>
    </div>
  );
}

export default function ManageSystemUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [roles, setRoles] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  const { confirm, dialog, handleConfirm, handleCancel } = useConfirm();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    citizenCard: "",
    gender: "",
    roleID: "",
    status: 1,
  });

  // Fetch Roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await apiFetch("/admin/roles");
        setRoles(rolesData || []);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };
    fetchRoles();
  }, []);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        params.set("page", "0");
        params.set("size", "100");

        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        }

        const data = await apiFetch(`/admin/accounts?${params.toString()}`);

        const mapped =
          data?.users?.map((u) => ({
            id: u.accountID,
            FullName: u.fullName,
            Username: u.username,
            Email: u.email,
            Phone: u.phone,
            Nationality: u.nationality,
            CitizenCard: u.citizenCard,
            Gender: u.gender,
            Status: u.status === 1 ? "active" : "inactive",
            RoleID: u.role?.roleID,
            RoleName: u.role?.roleName || "",
            CreatedAt: u.createdAt,
            LastLogin: u.lastLogin,
          })) ?? [];

        setUsers(mapped);
      } catch (err) {
        setError(err.message || "Failed to load user list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm]);

  // Filter
  const filteredUsers = users.filter((user) => {
    const matchesRole =
      filterRole === "all" || user.RoleID === Number(filterRole);
    return matchesRole;
  });

  // Handlers
  const handleAddUser = () => {
    setFormData({
      username: "",
      password: "",
      fullName: "",
      email: "",
      phone: "",
      nationality: "",
      citizenCard: "",
      gender: "",
      roleID: "",
      status: 1,
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.Username,
      password: "", // Don't show password when editing
      fullName: user.FullName,
      email: user.Email,
      phone: user.Phone || "",
      nationality: user.Nationality || "",
      citizenCard: user.CitizenCard || "",
      gender: user.Gender || "",
      roleID: user.RoleID || "",
      status: user.Status === "active" ? 1 : 0,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = await confirm({
      title: "Delete User",
      message: "Are you sure you want to delete this user? This action cannot be undone.",
      type: "danger"
    });
    
    if (!confirmed) return;

    try {
      await apiFetch(`/admin/accounts/${userId}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("User deleted successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const validateForm = () => {
    const errors = {};

    if (showAddModal) {
      if (!formData.username?.trim()) {
        errors.username = "Username is required";
      }
      if (!formData.password?.trim()) {
        errors.password = "Password is required";
      } else if (formData.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
    }

    if (!formData.fullName?.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setFormErrors({});

    try {
      if (showAddModal) {
        // Create new user
        const createData = {
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          nationality: formData.nationality || null,
          citizenCard: formData.citizenCard || null,
          gender: formData.gender || null,
          roleId: formData.roleID || null, // Include roleId in create request
        };

        await apiFetch("/admin/accounts", {
          method: "POST",
          body: JSON.stringify(createData),
        });

        // Refresh users list
        const params = new URLSearchParams();
        params.set("page", "0");
        params.set("size", "100");
        const data = await apiFetch(`/admin/accounts?${params.toString()}`);
        const mapped =
          data?.users?.map((u) => ({
            id: u.accountID,
            FullName: u.fullName,
            Username: u.username,
            Email: u.email,
            Phone: u.phone,
            Nationality: u.nationality,
            CitizenCard: u.citizenCard,
            Gender: u.gender,
            Status: u.status === 1 ? "active" : "inactive",
            RoleID: u.role?.roleID,
            RoleName: u.role?.roleName || "",
            CreatedAt: u.createdAt,
            LastLogin: u.lastLogin,
          })) ?? [];
        setUsers(mapped);

        setShowAddModal(false);
        toast.success("User added successfully!");
      } else if (showEditModal) {
        // Update existing user
        const updateData = {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          nationality: formData.nationality || null,
          gender: formData.gender || null,
          status: formData.status,
        };

        await apiFetch(`/admin/accounts/${selectedUser.id}`, {
          method: "PUT",
          body: JSON.stringify(updateData),
        });

        // Update role if changed
        if (formData.roleID && formData.roleID !== selectedUser.RoleID) {
          await apiFetch(`/admin/accounts/${selectedUser.id}/role`, {
            method: "PATCH",
            body: JSON.stringify({ roleId: formData.roleID }),
          });
        }

        // Refresh users list
        const params = new URLSearchParams();
        params.set("page", "0");
        params.set("size", "100");
        const data = await apiFetch(`/admin/accounts?${params.toString()}`);
        const mapped =
          data?.users?.map((u) => ({
            id: u.accountID,
            FullName: u.fullName,
            Username: u.username,
            Email: u.email,
            Phone: u.phone,
            Nationality: u.nationality,
            CitizenCard: u.citizenCard,
            Gender: u.gender,
            Status: u.status === 1 ? "active" : "inactive",
            RoleID: u.role?.roleID,
            RoleName: u.role?.roleName || "",
            CreatedAt: u.createdAt,
            LastLogin: u.lastLogin,
          })) ?? [];
        setUsers(mapped);

        setShowEditModal(false);
        setSelectedUser(null);
        toast.success("User updated successfully!");
      }
    } catch (err) {
      setFormErrors({ submit: err.message || "An error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <UserGroupIcon className="h-8 w-8" />
              <h1 className="text-2xl font-bold">
                System User Management
              </h1>
            </div>
            <p className="text-sm opacity-90">
              Manage and track all users in the system
            </p>
          </div>
          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <PlusIcon className="h-5 w-5" /> Add User
          </button>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
            >
              <option value="all">All Roles</option>
              {roles.map((role) => (
                <option key={role.roleID} value={role.roleID}>
                  {role.roleName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE (RÚT GỌN) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {error && <div className="px-6 pt-4 text-sm text-red-600">{error}</div>}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Full Name
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    Loading data...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <span className="ml-3 font-medium">{user.FullName}</span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.Email}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.Username}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.RoleName || "N/A"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.Status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.Status}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {/* VIEW DETAIL */}
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                          title="View details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>

                        {/* EDIT */}
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>

                        {/* DELETE */}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL XEM CHI TIẾT */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-3xl w-full rounded-2xl p-8 shadow-2xl relative">
            {/* Close Button */}
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition text-xl"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-6 border-b pb-5 mb-6">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-800">
                  {selectedUser.FullName}
                </h2>
                <p className="text-gray-500 text-sm">{selectedUser.Email}</p>
              </div>

              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {selectedUser.RoleName || "N/A"}
              </span>
            </div>

            {/* Body */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-5 text-[15px]">
              <DetailRow label="Username" value={selectedUser.Username} />
              <DetailRow label="Phone" value={selectedUser.Phone} />

              <DetailRow label="Nationality" value={selectedUser.Nationality} />
              <DetailRow label="ID Card" value={selectedUser.CitizenCard} />

              <DetailRow label="Gender" value={selectedUser.Gender} />

              <DetailRow
                label="Status"
                value={
                  selectedUser.Status === 1 ? "Active" : "Inactive"
                }
              />

              <DetailRow
                label="Created Date"
                value={
                  selectedUser.CreatedAt
                    ? new Date(selectedUser.CreatedAt).toLocaleString("en-US")
                    : "—"
                }
              />

              <DetailRow
                label="Last Login"
                value={
                  selectedUser.LastLogin
                    ? new Date(selectedUser.LastLogin).toLocaleString("en-US")
                    : "—"
                }
              />
            </div>

            {/* Footer */}
            <div className="mt-10 text-right">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD / EDIT */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 my-4">
            <h2 className="text-xl font-bold mb-4">
              {showAddModal ? "Add New User" : "Edit User"}
            </h2>

            {formErrors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {formErrors.submit}
              </div>
            )}

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {showAddModal && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className={`w-full border rounded-lg px-3 py-2 ${
                        formErrors.username ? "border-red-500" : ""
                      }`}
                      placeholder="Enter username"
                    />
                    {formErrors.username && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={`w-full border rounded-lg px-3 py-2 ${
                        formErrors.password ? "border-red-500" : ""
                      }`}
                      placeholder="Enter password (minimum 6 characters)"
                    />
                    {formErrors.password && (
                      <p className="text-xs text-red-500 mt-1">
                        {formErrors.password}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className={`w-full border rounded-lg px-3 py-2 ${
                    formErrors.fullName ? "border-red-500" : ""
                  }`}
                  placeholder="Enter full name"
                />
                {formErrors.fullName && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`w-full border rounded-lg px-3 py-2 ${
                    formErrors.email ? "border-red-500" : ""
                  }`}
                  placeholder="Enter email"
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) =>
                      setFormData({ ...formData, nationality: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="Enter nationality"
                  />
                </div>

                {showAddModal && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      ID Card
                    </label>
                    <input
                      type="text"
                      value={formData.citizenCard}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          citizenCard: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="Enter ID card number"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Role
                </label>
                <select
                  value={formData.roleID}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roleID: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                  className={`w-full border rounded-lg px-3 py-2 ${
                    formErrors.roleID ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select role</option>
                  {roles.map((role) => (
                    <option key={role.roleID} value={role.roleID}>
                      {role.roleName} - {role.description || ""}
                    </option>
                  ))}
                </select>
                {formErrors.roleID && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.roleID}
                  </p>
                )}
              </div>

              {showEditModal && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setFormErrors({});
                }}
                className="flex-1 border rounded-lg px-4 py-2 hover:bg-gray-50 transition"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={isSaving}
                className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Processing..." : showAddModal ? "Add" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
      />
    </div>
  );
}
