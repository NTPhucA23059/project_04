import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminApp from "./admin/AdminApp";
import StaffApp from "./staff/StaffApp";
import CustomerApp from "./customer/CustomerApp";

export default function App() {
  return (
    <Routes>
      {/* Staff - phải đặt trước Customer để match đúng */}
      <Route path="/staff/*" element={<StaffApp />} />

      {/* Admin - phải đặt trước Customer để match đúng */}
      <Route path="/admin/*" element={<AdminApp />} />

      {/* Customer - catch-all route cho tất cả các route khác */}
      <Route path="/*" element={<CustomerApp />} />
    </Routes>
  );
}
