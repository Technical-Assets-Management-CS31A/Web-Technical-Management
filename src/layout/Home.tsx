import Sidebar from "../components/Sidebar"
import { Outlet } from "react-router-dom"

export default function Home() {
    return (
        <div className="layout-container relative flex h-[100vh] w-full">
            {/* Sidebar component for navigation */}
            <Sidebar />
            {/* Main content area */}
            <Outlet />
        </div>
    )
}
