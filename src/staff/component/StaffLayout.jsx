import { useState } from "react";
import StaffHeader from "./header/StaffHeader";
import StaffSidebar from "./sidebar/StaffSidebar";
import StaffFooter from "./footer/StaffFooter";
import GlobalToast from "../shared/toast/GlobalToast";

export default function StaffLayout({ children, activeTab, setActiveTab }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <>
      <div className="flex min-h-screen bg-neutral-50">
        {/* Sidebar */}
        <StaffSidebar
          isOpen={isSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isSidebarOpen ? "lg:ml-72" : "lg:ml-0"
          }`}
        >
          <StaffHeader
            setIsSidebarOpen={setIsSidebarOpen}
            isSidebarOpen={isSidebarOpen}
          />
          <main className="pt-20 px-6 lg:px-8 xl:px-12 flex-1 pb-24 min-h-screen bg-neutral-50">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
          <GlobalToast />
        </div>
      </div>

      {/* Footer */}
      <StaffFooter />

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed bottom-6 right-6 lg:hidden bg-gradient-to-r from-primary-600 to-primary-500 text-white p-4 rounded-full shadow-2xl hover:shadow-primary-500/50 hover:scale-110 transition-all duration-300 z-50"
      >
        {isSidebarOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
    </>
  );
}
