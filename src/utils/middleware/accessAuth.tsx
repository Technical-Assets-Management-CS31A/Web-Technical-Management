import { Navigate } from "react-router-dom"
import { getToken } from "../token"


export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const token = getToken()
    return token ? <Navigate to="/home/dashboard" replace /> : <>{children}</>
}

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const token = getToken()
    return token ? <>{children}</> : <Navigate to="/" replace />
}