import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { removeToken } from "../token";

interface RouteProps {
  children: React.ReactNode;
}

export const PublicRoute = ({ children }: RouteProps) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/home/dashboard" replace /> : <>{children}</>;
};

export const ProtectedRoute = ({ children }: RouteProps) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen bg-white">
    <span className="w-12 h-12 border-4 border-orange-500 border-b-transparent rounded-full inline-block box-border animate-spin"></span>
  </div>

  if (!isAuthenticated) {
    removeToken();
    return <Navigate to="/" replace />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};
