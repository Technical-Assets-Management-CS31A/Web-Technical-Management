import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

const getAccessTokenKey = () => {
  const key = import.meta.env.VITE_ACCESS_TOKEN_KEY;
  if (!key) {
    console.warn(
      "⚠️ Environment variable 'VITE_ACCESS_TOKEN_KEY' is undefined. Using fallback key 'accessToken'."
    );
    return "accessToken";
  }
  return key;
};

interface RouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: RouteProps) => {
  const key = getAccessTokenKey();
  const token = Cookies.get(key);

  if (token) {
    console.log(`🔒 Token found under key '${key}'. Redirecting to dashboard.`);
    return <Navigate to="/home/dashboard" replace />;
  }

  console.log(`🟢 No token found under key '${key}'. Allowing public access.`);
  return <>{children}</>;
};

export const ProtectedRoute = ({ children }: RouteProps) => {
  const key = getAccessTokenKey();
  const token = Cookies.get(key);

  if (!token) {
    console.log(`🚫 Missing or invalid token under key '${key}'. Redirecting to login.`);
    return <Navigate to="/" replace />;
  }

  console.log(`✅ Valid token found under key '${key}'. Access granted.`);
  return <>{children}</>;
};
