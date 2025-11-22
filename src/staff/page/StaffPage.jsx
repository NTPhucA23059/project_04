import { useState } from "react";
import StaffLayout from "../component/StaffLayout";
import Dashboard from "../component/dashboard/Dashboard";


export default function StaffPage() {
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
        <StaffLayout activeTab={activeTab} setActiveTab={setActiveTab}>
            {renderContent()}
        </StaffLayout>
    );
}

