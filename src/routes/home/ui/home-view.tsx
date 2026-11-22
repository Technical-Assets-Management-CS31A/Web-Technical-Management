import { Outlet } from "@tanstack/react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../../components/Sidebar";
import AdminNotificationListener from "../../../components/AdminNotificationListener";

type HomeViewProps = {
  isStaff: boolean;
  isSidebarExpanded: boolean;
};

/** The signed-in layout: sidebar, toasts and the page outlet. No data fetching here. */
export default function HomeView({ isStaff, isSidebarExpanded }: HomeViewProps) {
  return (
    <div className="layout-container relative flex min-h-screen w-full">
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

      {/* Live event listener for staff and admins only */}
      {isStaff && <AdminNotificationListener />}

      <Sidebar />

      {/* Left margin leaves room for the fixed sidebar */}
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
