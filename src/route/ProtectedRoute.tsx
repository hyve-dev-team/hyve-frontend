import React, { JSX } from "react";
import { Navigate } from "react-router-dom";
import { clearAuthSession } from "../utils/auth";
import { hyveError } from "../utils/hyveToast";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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
    console.warn("Failed to parse user session in ProtectedRoute:", err);
  }

  const role = (localStorage.getItem("userRole") || user?.role || "").toLowerCase();

  // If a landlord tries to enter the tenant dashboard/routes, log them out
  if (role === "landlord") {
    clearAuthSession();
    hyveError("Access Denied", "Landlord accounts cannot access the tenant portal. You have been logged out.");
    return <Navigate to="/auth/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
