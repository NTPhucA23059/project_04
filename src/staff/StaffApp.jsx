import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StaffPage from "./page/StaffPage";

export default function StaffApp() {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is logged in and has STAFF role
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");



    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);

        const roleName = user?.roleName || user?.role?.roleName || "";
        const normalizedRole = (roleName || "").toString().toUpperCase().trim();



        // If not STAFF, redirect based on role
        if (normalizedRole !== "STAFF") {
          console.log("Not STAFF, redirecting...");
          if (normalizedRole === "ADMIN") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/";
          }
          return;
        }


        setIsAuthorized(true);
      } catch (e) {
        console.error("Error parsing user data:", e);
        window.location.href = "/login";
      }
    } else {
      setIsAuthorized(true);
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <StaffPage />;
}



