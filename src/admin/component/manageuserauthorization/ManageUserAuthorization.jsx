import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { apiFetch } from "../../../services/admin/client";
import { toast } from "../../shared/toast/toast";

// Map permissions based on role
const getPermissionsByRole = (roleName) => {
  const roleUpper = roleName?.toUpperCase() || "";

  if (roleUpper.includes("ADMIN")) {
    return {
      manageUsers: true,
      manageProducts: true,
      manageOrders: true,
      manageRefunds: true,
      viewReports: true,
      systemSettings: true,
    };
  } else if (roleUpper.includes("STAFF")) {
    return {
      manageUsers: false,
      manageProducts: true,
      manageOrders: true,
      manageRefunds: true,
      viewReports: true,
      systemSettings: false,
    };
  } else {
    return {
      manageUsers: false,
      manageProducts: false,
      manageOrders: false,
      manageRefunds: false,
      viewReports: false,
      systemSettings: false,
    };
  }
};

export default function ManageUserAuthorization() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch users and roles
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();
        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        }

        const [usersData, rolesData] = await Promise.all([
          apiFetch(`/admin/user-authorization/users?${params.toString()}`),
          apiFetch("/admin/roles"),
        ]);

        const mappedUsers =
          usersData?.map((u) => ({
            id: u.accountID,
            accountID: u.accountID,
            name: u.fullName,
            email: u.email,
            phone: u.phone,
            role: u.roleName,
            roleID: u.roleID,
            roleDescription: u.roleDescription,
            status: u.status,
            permissions: getPermissionsByRole(u.roleName),
          })) || [];

        setUsers(mappedUsers);
        setRoles(rolesData || []);
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

  const permissionLabels = {
    manageUsers: "Manage Users",
    manageProducts: "Manage Products",
    manageOrders: "Manage Orders",
    manageRefunds: "Manage Refunds",
    viewReports: "View Reports",
    systemSettings: "System Settings",
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const handleRoleChange = async (newRoleId) => {
    if (!selectedUser) return;

    setIsSaving(true);
    try {
      const updatedUser = await apiFetch(
        `/admin/user-authorization/users/${selectedUser.accountID}/role`,
        {
          method: "PUT",
          body: JSON.stringify({ roleId: newRoleId }),
        }
      );

      // Update local state
      const newRole = roles.find((r) => r.roleID === newRoleId);
      const updatedPermissions = getPermissionsByRole(newRole?.roleName);

      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                roleID: newRoleId,
                role: newRole?.roleName || user.role,
                permissions: updatedPermissions,
              }
            : user
        )
      );

      setSelectedUser({
        ...selectedUser,
        roleID: newRoleId,
        role: newRole?.roleName || selectedUser.role,
        permissions: updatedPermissions,
      });

      toast.success("Role updated successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to update role");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheckIcon className="h-8 w-8" />
          <h1 className="text-2xl font-bold">User Authorization Management</h1>
        </div>
        <p className="text-sm opacity-90">
          Configure and manage access permissions for each user in the system
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="mb-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-8 text-gray-500">
                  Loading data...
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No users found
                </div>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedUser?.id === user.id
                        ? "bg-blue-50 border-blue-300"
                        : "bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex text-xs px-2 py-0.5 rounded-full ${
                              user.role?.toUpperCase().includes("ADMIN")
                                ? "bg-purple-100 text-purple-800"
                                : user.role?.toUpperCase().includes("STAFF")
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <UserGroupIcon className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Authorization: {selectedUser.name}
                  </h2>
                </div>
                <p className="text-sm text-gray-600">{selectedUser.email}</p>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Role:
                  </label>
                  <select
                    value={selectedUser.roleID || ""}
                    onChange={(e) => handleRoleChange(Number(e.target.value))}
                    disabled={isSaving}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {roles.map((role) => (
                      <option key={role.roleID} value={role.roleID}>
                        {role.roleName} - {role.description || ""}
                      </option>
                    ))}
                  </select>
                  {selectedUser.roleDescription && (
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedUser.roleDescription}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Access Permissions List (based on role)
                </h3>

                {Object.entries(permissionLabels).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {selectedUser.permissions?.[key] ? (
                        <CheckCircleIcon className="h-6 w-6 text-green-500" />
                      ) : (
                        <XCircleIcon className="h-6 w-6 text-gray-300" />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{label}</div>
                        <div className="text-xs text-gray-500">
                          {selectedUser.permissions?.[key]
                            ? "Permission granted"
                            : "Permission not granted"}
                        </div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600">
                      {selectedUser.permissions?.[key] ? "Yes" : "No"}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  <strong>Note:</strong> Access permissions are automatically granted based
                  on role. To change permissions, please change the user's role above.
                </p>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <ShieldCheckIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a user to manage authorization
              </h3>
              <p className="text-sm text-gray-500">
                Please select a user from the list on the left to view and
                edit access permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
