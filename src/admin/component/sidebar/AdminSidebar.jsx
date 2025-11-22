import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  FolderIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  TruckIcon,
  UserCircleIcon,
  BanknotesIcon,
  GiftIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import logo from "../../../assets/logo.png";
export default function AdminSidebar({ isOpen, activeTab, setActiveTab }) {
  const navItems = [
    { id: "dashboard", name: "Tổng quan", icon: HomeIcon },
    
  ];

  return (
    <aside
      className={`${isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 z-40 h-full w-64 bg-white text-blue-900 border-r border-gray-200 shadow-sm transform transition-transform duration-300`}
    >
      {/* Logo */}
      <div className="h-16 px-4 flex items-center bg-white border-b border-gray-200">
        <img src={logo} alt="logo" className="h-40 w-40" />
      </div>

      {/* Navigation */}
      <nav className="mt-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                  ${activeTab === item.id
                    ? "bg-blue-200 text-blue-900 font-semibold"
                    : "bg-white text-blue-900 hover:bg-blue-50"
                  }`}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 ${activeTab === item.id ? "text-blue-800" : "text-blue-700"
                    }`}
                />
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
