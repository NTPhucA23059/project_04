import { BellIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";

export default function StaffHeader({ setIsSidebarOpen, isSidebarOpen }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
    <header className={`fixed top-0 right-0 z-30 bg-green-100 text-green-900 border-b border-green-200 shadow-sm transition-all duration-300 ${isSidebarOpen ? 'lg:left-64' : 'lg:left-0'}`}>
      <div className="flex items-center justify-between px-6 h-16">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md hover:bg-green-200 text-green-800 transition"
          title={isSidebarOpen ? "Đóng sidebar" : "Mở sidebar"}
        >
          <Bars3Icon className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3"></div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-green-200 relative transition">
            <BellIcon className="w-6 h-6 text-green-800" />
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
              <div className="absolute right-0 mt-2 w-40 bg-white text-gray-700 rounded-md shadow-lg z-50">
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 rounded-t-md"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Hồ sơ cá nhân
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  Cài đặt
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 rounded-b-md"

                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

