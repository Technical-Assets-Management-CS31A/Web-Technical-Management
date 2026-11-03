import Sidebar from "../components/Sidebar";
import { Outlet } from "@tanstack/react-router";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminNotificationListener from "../components/AdminNotificationListener";
import { UserData } from "../utils/usersData/userData";

function HomeContent() {
  const { isSidebarExpanded } = useSidebar();
  const userData = UserData();

  // Instructors get their notices on the mobile app; staff dashboards get live SignalR events.
  const isStaff = !!userData.role && userData.role !== "INSTRUCTOR";

  return (
    <div className="layout-container relative flex min-h-screen w-full">
      {/* Toast notifications container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={4}
        style={{ zIndex: 9999, minWidth: 320 }}
      />

      {/* Mount live event listener for staff and admins only */}
      {isStaff && <AdminNotificationListener />}

      {/* Sidebar component for navigation */}
      <Sidebar />
      {/* Main content area with left margin to account for fixed sidebar */}
      <main
        className={`flex-1 w-full transition-all duration-300 ${
          isSidebarExpanded ? "lg:ml-[270px]" : "lg:ml-[75px]"
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <SidebarProvider>
      <HomeContent />
    </SidebarProvider>
  );
}
