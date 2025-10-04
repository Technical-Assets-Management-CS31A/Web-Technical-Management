import { NavLink } from "react-router-dom";
import logo from "../assets/img/aclcLogo.webp";
import { CiLogout } from "react-icons/ci";
import { CiSettings } from "react-icons/ci";
import { MdHistory } from "react-icons/md";
import { CiUser } from "react-icons/ci";
import { MdInventory } from "react-icons/md";
import { MdOutlineDashboard } from "react-icons/md";
import { removeToken } from "../utils/token";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import SidebarSkeletonLoader from "../loader/SidebarSkeletonLoader";

export default function Sidebar() {
  const navigate = useNavigate();
  const [isSidebarLoading, setIsSidebarLoading] = useState(true);

  const sideBarList = [
    { label: "Dashboard", link: "dashboard", icon: MdOutlineDashboard },
    { label: "Inventory List", link: "inventory-list", icon: MdInventory },
    { label: "User Management", link: "user-management", icon: CiUser },
    { label: "Your History", link: "history-list", icon: MdHistory },
    { label: "Settings", link: "settings", icon: CiSettings },
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
    <aside className="animate-fadeIn h-screen w-[300px] bg-white border-r border-[#e5e7eb] flex flex-col justify-between shadow-xl left-0 top-0 z-30">
      {/* Logo and Title */}
      <div className="flex flex-col items-center py-8">
        <img src={logo} alt="Logo" className="w-20 h-20 mb-2" />
        <span className="text-[#2563eb] font-extrabold text-xl tracking-widest">
          ACLC
        </span>
      </div>
      {/* Navigation */}
      <nav className="flex-1">
        <ul className="flex flex-col gap-2 px-4">
          {sideBarList.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all duration-150 ${
                    isActive
                      ? "bg-[#2563eb] text-white shadow"
                      : "text-[#334155] hover:bg-[#f1f5f9] hover:text-[#2563eb]"
                  }`
                }
              >
                {item.icon && <item.icon className="text-xl" />}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      {/* Logout */}
      <footer className="px-4 py-8">
        <button
          onClick={logoutUser}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#f1f5f9] text-[#ef4444] font-bold rounded-lg shadow cursor-pointer hover:bg-[#fee2e2] hover:text-[#b91c1c] transition-all duration-150"
        >
          <CiLogout className="text-xl" />
          Logout
        </button>
      </footer>
    </aside>
  );
}
