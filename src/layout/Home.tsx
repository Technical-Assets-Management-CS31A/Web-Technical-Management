import Sidebar from "../components/Sidebar"
import { Outlet } from "react-router-dom"
import "../../public/css/layout.css"

export default function Home() {
    return (
        <div className="layout-container">
            {/* Sidebar component for navigation */}
            <section>
                <Sidebar />
            </section>

            {/* Main content area */}
            <main>
                <Outlet />
            </main>
        </div>
    )
}
