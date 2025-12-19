import { useState } from "react";
import AdminLayout from "../component/AdminLayout";
import Dashboard from "../component/dashboard/Dashboard";
import ManageSystemUsers from "../component/managesystemusers/ManageSystemUsers";
import ManageUserAuthorization from "../component/manageuserauthorization/ManageUserAuthorization";
import ManageAdminProfile from "../component/manageadminprofile/ManageAdminProfile";
import PackageSalesAnalysis from "../component/salesAnalysis/PackageSalesAnalysis";
import CarRentalSalesAnalysis from "../component/salesAnalysis/CarRentalSalesAnalysis";


export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "manage-users":
        return <ManageSystemUsers />;
      case "manage-authorization":
        return <ManageUserAuthorization />;
      case "admin-profile":
        return <ManageAdminProfile />;
      case "salesTours":
        return <PackageSalesAnalysis />;
      case "salesCars":
        return <CarRentalSalesAnalysis />;
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
