import { 
  BellIcon, 
  Bars3Icon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

export default function StaffHeader({ setIsSidebarOpen, isSidebarOpen }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef(null);

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

  return (
    <header 
      className={`fixed top-0 right-0 z-30 bg-white border-b border-neutral-200 shadow-sm transition-all duration-300 ${
        isSidebarOpen ? 'lg:left-72' : 'lg:left-0'
      }`}
    >
      <div className="flex items-center justify-between px-6 h-20">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-primary-50 text-neutral-700 transition-all duration-200 hover:scale-105"
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          {/* Search Bar */}
          <div className={`hidden md:flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-200 ${
            searchFocused ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-neutral-200 bg-neutral-50'
          }`}>
            <MagnifyingGlassIcon className={`w-5 h-5 transition-colors ${
              searchFocused ? 'text-primary-600' : 'text-neutral-400'
            }`} />
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="bg-transparent border-none outline-none text-sm text-neutral-700 placeholder-neutral-400 w-64"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2.5 rounded-lg hover:bg-primary-50 text-neutral-700 transition-all duration-200 hover:scale-105 group">
            <BellIcon className="w-6 h-6 group-hover:text-primary-600 transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200 group"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md ring-2 ring-primary-100">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-neutral-900">Staff User</p>
                <p className="text-xs text-neutral-500">Online</p>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-neutral-500 transition-transform duration-200 ${
                userMenuOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden z-50">
                <div className="p-4 border-b border-neutral-100 bg-gradient-to-r from-primary-50 to-accent-50">
                  <p className="text-sm font-semibold text-neutral-900">Staff User</p>
                  <p className="text-xs text-neutral-600 mt-0.5">staff@example.com</p>
                </div>
                <div className="py-2">
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 transition-colors"
                    onClick={() => {
                      setUserMenuOpen(false);
                      // Navigate to profile
                    }}
                  >
                    <UserCircleIcon className="w-5 h-5 text-neutral-400" />
                    Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-primary-50 transition-colors"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-neutral-400" />
                    Settings
                  </button>
                  <div className="border-t border-neutral-100 my-1"></div>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => {
                      setUserMenuOpen(false);
                      // Handle logout
                    }}
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
