import React, { JSX } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: JSX.Element;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // const token = localStorage.getItem("token");
  // const userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData') as string) : null;
  // const token = userData ? userData.token : null;

  // // Optional: Check if token is expired (if your backend sets exp claim in JWT)
  // if (!token) {
  //   console.warn("🚫 No token found — redirecting to login");
  //   return <Navigate to="/auth/signin/user" replace />;
  // }

  // // If you want to decode and verify token expiration:
  // try {
  //   const [, payloadBase64] = token.split(".");
  //   const payload = JSON.parse(atob(payloadBase64));
  //   const now = Math.floor(Date.now() / 1000);

  //   if (payload.exp && payload.exp < now) {
  //     console.warn("⏳ Token expired — clearing and redirecting");
  //     localStorage.removeItem("userData");
  //     return <Navigate to='/auth/signin/user' replace />;
  //   }
  // } catch (err) {
  //   console.error("Invalid token:", err);
  //   localStorage.removeItem("userData");
  //   return <Navigate to="/auth/signin/user" replace />;
  // }

  // ✅ Token valid — grant access
  return children;
};

export default ProtectedRoute;
