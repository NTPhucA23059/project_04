import {
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  UserCircleIcon,
  TagIcon,
  MapPinIcon,
  ClockIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import logo from "../../../assets/img/logo.png";
export default function AdminSidebar({ isOpen, activeTab, setActiveTab }) {
  const navItems = [
    { id: "dashboard", name: "Dashboard", icon: HomeIcon },
    { id: "manage-users", name: "User Management", icon: UserGroupIcon },
    {
      id: "manage-authorization",
      name: "User Authorization",
      icon: ShieldCheckIcon,
    },
 
    { id: "admin-profile", name: "Profile", icon: UserCircleIcon },
  ];

  return (
    <aside
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } fixed top-0 left-0 z-40 h-full w-64 bg-white text-blue-900 border-r border-gray-200 shadow-sm transform transition-transform duration-300`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-8 h-20">
        <img src={logo} alt="logo" className="h-40 w-40 " />
      </div>
      {/* Navigation */}
      <nav className="mt-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-5 py-2.5 text-sm font-medium rounded-md transition-all duration-200
                  ${
                    activeTab === item.id
                      ? "bg-blue-200 text-blue-900 font-semibold"
                      : "bg-white text-blue-900 hover:bg-blue-50"
                  }`}
              >
                <item.icon
                  className={`w-5 h-5 mr-3 ${
                    activeTab === item.id ? "text-blue-800" : "text-blue-700"
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
