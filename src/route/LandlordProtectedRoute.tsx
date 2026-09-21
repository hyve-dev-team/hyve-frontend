import React, { JSX } from "react";
import { Navigate } from "react-router-dom";
import { clearAuthSession } from "../utils/auth";
import { hyveError } from "../utils/hyveToast";

interface LandlordProtectedRouteProps {
  children: JSX.Element;
}

const LandlordProtectedRoute: React.FC<LandlordProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token") || localStorage.getItem("authToken");

  if (!token) {
    return <Navigate to="/auth/signin" replace />;
  }

  let user = null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (err) {
    console.warn("Failed to parse user session in LandlordProtectedRoute:", err);
  }

  const role = (localStorage.getItem("userRole") || user?.role || "").toLowerCase();

  // If a tenant / student tries to enter the landlord dashboard/routes, log them out
  if (role !== "landlord" && role !== "admin") {
    clearAuthSession();
    hyveError("Access Denied", "Tenant accounts cannot access the landlord portal. You have been logged out.");
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
};

export default LandlordProtectedRoute;
