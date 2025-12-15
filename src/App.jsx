import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminApp from "./admin/AdminApp";
import StaffApp from "./staff/StaffApp";
import CustomerApp from "./customer/CustomerApp";

export default function App() {
  return (
    <Routes>
      <Route path="/staff/*" element={<StaffApp />} />
      <Route path="/admin/*" element={<AdminApp />} />
      <Route path="/*" element={<CustomerApp />} />
    </Routes>
  );
}
