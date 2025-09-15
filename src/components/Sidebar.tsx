import { NavLink } from "react-router-dom";
import logo from "../assets/img/aclcLogo.webp";
import { CiLogout } from "react-icons/ci";
import { removeToken } from "../utils/token";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
    const navigate = useNavigate();

    const logoutUser = async () => {
        await removeToken();
        navigate("/");
    };

    return (
        <aside className="animate-fadeIn h-screen w-[300px] bg-white border-r border-[#e5e7eb] flex flex-col justify-between shadow-xl left-0 top-0 z-30">
            {/* Logo and Title */}
            <div className="flex flex-col items-center py-8">
                <img src={logo} alt="Logo" className="w-20 h-20 mb-2" />
                <span className="text-[#2563eb] font-extrabold text-xl tracking-widest">ACLC</span>
            </div>
            {/* Navigation */}
            <nav className="flex-1">
                <ul className="flex flex-col gap-2 px-4">
                    <li>
                        <NavLink
                            to="dashboard"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all duration-150 ${isActive
                                    ? "bg-[#2563eb] text-white shadow"
                                    : "text-[#334155] hover:bg-[#f1f5f9] hover:text-[#2563eb]"
                                }`
                            }
                        >
                            <span>Dashboard</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="inventory-list"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all duration-150 ${isActive
                                    ? "bg-[#2563eb] text-white shadow"
                                    : "text-[#334155] hover:bg-[#f1f5f9] hover:text-[#2563eb]"
                                }`
                            }
                        >
                            <span>Inventory List</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="staff"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all duration-150 ${isActive
                                    ? "bg-[#2563eb] text-white shadow"
                                    : "text-[#334155] hover:bg-[#f1f5f9] hover:text-[#2563eb]"
                                }`
                            }
                        >
                            <span>Your Staff</span>
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="history-list"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-base transition-all duration-150 ${isActive
                                    ? "bg-[#2563eb] text-white shadow"
                                    : "text-[#334155] hover:bg-[#f1f5f9] hover:text-[#2563eb]"
                                }`
                            }
                        >
                            <span>Your History</span>
                        </NavLink>
                    </li>
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