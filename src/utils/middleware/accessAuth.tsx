import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";

interface RouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: RouteProps) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/home/dashboard" replace /> : <>{children}</>;
};

export const ProtectedRoute = ({ children }: RouteProps) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};
