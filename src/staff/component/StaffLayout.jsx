import { useState } from "react";
import StaffHeader from "./header/StaffHeader";
import StaffSidebar from "./sidebar/StaffSidebar";
import StaffFooter from "./footer/StaffFooter";
import GlobalToast from "../shared/toast/GlobalToast";


export default function StaffLayout({ children, activeTab, setActiveTab }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                {/* Sidebar */}
                <StaffSidebar
                    isOpen={isSidebarOpen}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                {/* Nội dung chính */}
                <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
                    <StaffHeader setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />
                    <main className="pt-20 px-6 flex-1 pb-20 min-h-screen">{children}</main>
                    <GlobalToast />
                </div>
            </div>

            {/* Footer chiếm toàn bộ chiều rộng màn hình */}
            <StaffFooter />

            {/* Nút mở sidebar trên mobile */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="fixed bottom-6 right-6 lg:hidden bg-green-700 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition z-50"
            >
                {isSidebarOpen ? "✖" : "☰"}
            </button>
        </>
    );
}

