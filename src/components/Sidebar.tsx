import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/img/aclcLogo.webp";
import { CiLogout, CiSettings, CiUser } from "react-icons/ci";
import { GiArchiveRegister } from "react-icons/gi";
import { MdHistory, MdInventory, MdDashboardCustomize } from "react-icons/md";
import { removeToken } from "../utils/token";
import { useState, useEffect } from "react";
import SidebarSkeletonLoader from "../loader/SidebarSkeletonLoader";

export default function Sidebar() {
  const navigate = useNavigate();
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);

  const sideBarList = [
    { label: "Dashboard", link: "dashboard", icon: MdDashboardCustomize },
    { label: "Inventory List", link: "inventory-list", icon: GiArchiveRegister },
    { label: "User Management", link: "user-management", icon: CiUser },
    { label: "Your History", link: "history-list", icon: MdHistory },
    { label: "Your Archive", link: "archive-table", icon: MdInventory},
    { label: "Your Settings", link: "settings", icon: CiSettings }, 
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSidebarLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const logoutUser = async () => {
    removeToken();
    navigate("/");
  };

  if (isSidebarLoading) {
    return <SidebarSkeletonLoader />;
  }

  return (
    <aside className="group animate-fadeIn h-screen w-[75px] hover:w-[250px] transition-all duration-300 bg-white border-r border-[#e5e7eb] flex flex-col justify-between shadow-xl left-0 top-0 z-30">
      {/* Logo and Title */}
      <div className="flex flex-col items-center py-8">
        <img
          src={logo}
          alt="Logo"
          className="w-12 h-12 mb-2 transition-all duration-300 group-hover:w-20 group-hover:h-20"
        />
        <span className="text-[#2563eb] font-extrabold text-xl tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          ACLC
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="flex flex-col gap-2 px-2">
          {sideBarList.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-3 rounded-lg font-medium text-base transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600 text-white shadow"
                      : "text-gray-500 hover:bg-[#f1f5f9] hover:text-[#2563eb]"
                  }`
                }
              >
                <item.icon className="text-2xl min-w-[30px] group-hover:min-w-[25px] group-hover:text-2xl"/>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {item.label}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <footer className="px-2 py-6 border-t border-gray-200">
        <button
          onClick={logoutUser}
          type="button"
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg font-medium text-base text-[#ef4444] hover:bg-[#fee2e2] hover:text-[#b91c1c] transition-all duration-150"
        >
          <CiLogout className="text-2xl min-w-[24px] flex-shrink-0" />
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Logout
          </span>
        </button>
      </footer>
    </aside>
  );
}
