/**
 * HYVE Authentication & Session Utilities
 */

export const clearAuthSession = () => {
  try {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("user_id");
    localStorage.removeItem("email");
  } catch (err) {
    console.error("Error clearing session:", err);
  }
};

export const performLogout = (navigate) => {
  clearAuthSession();
  if (typeof navigate === "function") {
    navigate("/auth/signin");
  } else if (typeof window !== "undefined") {
    window.location.href = "/auth/signin";
  }
};
