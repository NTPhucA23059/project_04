import { BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { logout } from "../../../services/common/authService";
import { getCurrentUser } from "../../../services/common/authService";

export default function AdminHeader({ setIsSidebarOpen, isSidebarOpen, setActiveTab }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const userMenuRef = useRef(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setUserMenuOpen(false);
    if (setActiveTab) {
      setActiveTab("admin-profile");
    }
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    logout();
    window.location.href = "/login";
  };




  return (
    <header className={`fixed top-0 right-0 z-30 bg-blue-100 text-blue-900 border-b border-blue-200 shadow-sm transition-all duration-300 ${isSidebarOpen ? 'lg:left-64' : 'lg:left-0'}`}>
      <div className="flex items-center justify-between px-6 h-16">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md hover:bg-blue-200 text-blue-800 transition"
          title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3"></div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-blue-200 relative transition">
            <BellIcon className="w-6 h-6 text-blue-800" />
            <span className="absolute top-1 right-1 bg-yellow-400 w-2 h-2 rounded-full"></span>
          </button>

          <div className="relative" ref={userMenuRef}>
            <img
              src="https://i.pravatar.cc/40"
              alt="avatar"
              className="w-9 h-9 rounded-full border-2 border-white cursor-pointer shadow-sm"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            />

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-700 rounded-md shadow-lg z-50 border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-100 bg-blue-50">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.fullName || user?.username || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {user?.email || user?.username || "admin@example.com"}
                  </p>
                </div>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-md transition-colors"
                  onClick={handleProfileClick}
                >
                  Profile
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Settings
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 rounded-b-md transition-colors"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
