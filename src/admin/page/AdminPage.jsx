import { useState } from "react";
import AdminLayout from "../component/AdminLayout";
import Dashboard from "../component/dashboard/Dashboard";


export default function AdminPage() {
    const [activeTab, setActiveTab] = useState("dashboard");

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <Dashboard />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </AdminLayout>
    );
}
