import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

interface AdminProtectedRouteProps {
  children: JSX.Element;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/auth/signin" replace />;
  }

  // Allow access if user is logged in
  return children;
};

export default AdminProtectedRoute;
