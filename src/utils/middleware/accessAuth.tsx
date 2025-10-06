import { Navigate } from "react-router-dom";
import { getToken } from "../token";
import { removeToken } from "../token";

// Helper to get the key safely and warn if missing
const getAccessTokenKey = () => {
  const key = import.meta.env.VITE_ACCESS_TOKEN;

  if (!key) {
    console.warn(
      "⚠️ Environment variable 'VITE_ACCESS_TOKEN' is undefined. Using fallback key 'accessToken'.",
    );
    return "accessToken";
  }

  return key;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const key = getAccessTokenKey();
  const token = getToken();

  if (!token) {
    console.log(
      `🟢 No token found under key '${key}'. Allowing public access.`,
    );
    return <>{children}</>;
  }

  console.log(
    `🔒 Token found under key '${key}'. Redirecting to /home/dashboard.`,
  );
  return <Navigate to="/home/dashboard" replace />;
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const key = getAccessTokenKey();
  const token = getToken();

  if (!key || !token || token === "undefined" || token === "null") {
    console.error("🚫 Invalid or missing token. Logging out.");
    removeToken();
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
