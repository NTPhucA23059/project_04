import { useState } from "react";
import AdminHeader from "./header/AdminHeader";
import AdminSidebar from "./sidebar/AdminSidebar";
import AdminFooter from "./footer/AdminFooter";
import GlobalToast from "../shared/toast/GlobalToast";


export default function AdminLayout({ children, activeTab, setActiveTab }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                {/* Sidebar */}
                <AdminSidebar
                    isOpen={isSidebarOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* Nội dung chính */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <AdminHeader setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />
                    <main className="pt-20 px-6 flex-1 pb-20 min-h-screen">{children}</main>
                    <GlobalToast />
                </div>
            </div>

            {/* Footer chiếm toàn bộ chiều rộng màn hình */}
            <AdminFooter />

            {/* Nút mở sidebar trên mobile */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed bottom-6 right-6 lg:hidden bg-blue-700 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition z-50"
            >
                {isSidebarOpen ? "✖" : "☰"}
            </button>
        </>
    );
}
