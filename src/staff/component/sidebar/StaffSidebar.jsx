import { useState } from "react";
import {
  PresentationChartLineIcon,
  PresentationChartBarIcon,
  ChartPieIcon,
  TagIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon,
  CalendarDaysIcon,
  MapIcon,
  UserCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  PaperAirplaneIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";

export default function StaffSidebar({ isOpen, activeTab, setActiveTab }) {
  // State để quản lý các nhóm mở/đóng
  const [openGroups, setOpenGroups] = useState({
    overview: false,
    tour: false,
    vehicle: false,
    hotel: false,
    operations: false,
    schedule: false,
  });

  const toggleGroup = (groupKey) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const navGroups = [
    {
      key: "overview",
      title: "Dashboard",
      collapsible: true,
      items: [
        { id: "dashboard", name: "Overview", icon: PresentationChartLineIcon },
        { id: "salesTours", name: "Tour Sales Analysis", icon: PresentationChartBarIcon },
        { id: "salesCars", name: "Car Rental Sales Analysis", icon: ChartPieIcon }
      ],
    },
    {
      key: "tour",
      title: "Tour Management",
      collapsible: true,
      items: [
        { id: "categoriesTour", name: "Categories", icon: TagIcon },
        { id: "seasons", name: "Seasons", icon: CalendarDaysIcon },
        { id: "cities", name: "Cities", icon: BuildingOfficeIcon },
        { id: "attractions", name: "Attractions", icon: MapPinIcon },
        { id: "tours", name: "Tours", icon: MapIcon },
        { id: "tourSchedules", name: "Tour Schedules", icon: CalendarIcon },
        { id: "bookings", name: "Bookings", icon: ClipboardDocumentCheckIcon }

      ],
    },
    {
      key: "vehicle",
      title: "Vehicle Management",
      collapsible: true,
      items: [
        { id: "carTypes", name: "Car Types", icon: RectangleStackIcon },
        { id: "cars", name: "Cars", icon: TruckIcon },
        { id: "carBookings", name: "Car Bookings", icon: ClipboardDocumentCheckIcon },

      ],
    },
    {
      key: "hotel & flight",
      title: "Hotel Management",
      collapsible: true,
      items: [
        { id: "hotels", name: "Hotels", icon: BuildingOfficeIcon },
        { id: "hotelAmenities", name: "Amenities", icon: StarIcon },
        { id: "nearbyAttractions", name: "Nearby Attractions", icon: MapPinIcon },
        { id: "flights", name: "Flights", icon: PaperAirplaneIcon }

      ],
    },
    {
      key: "operations",
      title: "Operations",
      collapsible: true,
      items: [
        { id: "refunds", name: "Refunds", icon: ArrowPathIcon },
        { id: "invoices", name: "Invoices", icon: DocumentTextIcon },
      ],
    },
    {
      key: "account",
      title: "Account",
      collapsible: false,
      items: [
        { id: "profile", name: "Profile", icon: UserCircleIcon },
      ],
    },
  ];

  return (
    <aside
      className={`${isOpen ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 z-40 h-full w-72 bg-white text-neutral-900 
         border-r border-neutral-200 shadow-xl transform transition-transform duration-300 overflow-y-auto`}
    >
      {/* Logo Section */}
      <div className="h-20 px-6 flex items-center justify-between bg-gradient-to-r from-primary-50 to-accent-50 border-b border-primary-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md ring-2 ring-primary-100">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-neutral-900">Staff Portal</span>
            <span className="text-xs text-neutral-600 font-medium">Management System</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-4 py-6 space-y-5 bg-white">
        {navGroups.map((group) => {
          const isGroupOpen = !group.collapsible || openGroups[group.key];
          const hasActiveItem = group.items.some((item) => activeTab === item.id);

          return (
            <div key={group.key}>
              {/* Group Header */}
              {group.collapsible ? (
                <button
                  onClick={() => toggleGroup(group.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 mb-2 rounded-lg transition-all duration-200 ${hasActiveItem
                    ? "bg-primary-50 text-primary-700 border border-primary-200 shadow-sm"
                    : "text-neutral-600 hover:text-primary-700 hover:bg-primary-50/50"
                    }`}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    {isGroupOpen ? (
                      <ChevronDownIcon className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                    {group.title}
                  </h3>
                </button>
              ) : (
                <h3 className="px-3 mb-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}

              {/* Group Items */}
              {isGroupOpen && (
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                            ${isActive
                              ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/40"
                              : "text-neutral-700 hover:bg-primary-50 hover:text-primary-700"
                            }`}
                        >
                          <item.icon
                            className={`w-5 h-5 mr-3 transition-transform ${isActive
                              ? "text-white"
                              : "text-neutral-500 group-hover:text-primary-600"
                              } ${isActive ? "scale-110" : ""}`}
                          />
                          <span className="flex-1 text-left">{item.name}</span>
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white ml-auto"></div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
