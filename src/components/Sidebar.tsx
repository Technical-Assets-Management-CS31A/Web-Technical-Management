import { NavLink } from "react-router-dom";
import logo from "../assets/img/aclcLogo.webp";
import "../../public/css/sidebar.css";
import { CiLogout } from "react-icons/ci";

export default function Sidebar() {
    return (
        <div className="sidebar-container">
            <div className="logo-container">
                <img src={logo} alt="Logo" />
            </div>
            <div className="category-list-container">
                <ul className="category-list">
                    <li className="category-item">
                        <NavLink
                            to="dashboard"
                            style={({ isActive }) => ({
                                color: isActive ? "white" : "rgba(255, 255, 255, 0.563)",
                                fontWeight: isActive ? "bold" : "normal",
                                transform: isActive ? "scale(1.2)" : "scale(1)",
                            })}
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    <li className="category-item">
                        <NavLink
                            to="inventory-list"
                            style={({ isActive }) => ({
                                color: isActive ? "white" : "rgba(255, 255, 255, 0.563)",
                                fontWeight: isActive ? "bold" : "normal",
                                transform: isActive ? "scale(1.2)" : "scale(1)",

                            })}
                        >
                            Inventory List
                        </NavLink>
                    </li>
                    <li className="category-item">
                        <NavLink
                            to="item-list"
                            style={({ isActive }) => ({
                                color: isActive ? "white" : "rgba(255, 255, 255, 0.563)",
                                fontWeight: isActive ? "bold" : "normal",
                                transform: isActive ? "scale(1.2)" : "scale(1)",
                            })}
                        >
                            Item List
                        </NavLink>
                    </li>
                    <li className="category-item">
                        <NavLink
                            to="staff"
                            style={({ isActive }) => ({
                                color: isActive ? "white" : "rgba(255, 255, 255, 0.563)",
                                fontWeight: isActive ? "bold" : "normal",
                                transform: isActive ? "scale(1.2)" : "scale(1)",
                            })}
                        >
                            Staff
                        </NavLink>
                    </li>
                    <li className="category-item">
                        <NavLink
                            to="history-list"
                            style={({ isActive }) => ({
                                color: isActive ? "white" : "rgba(255, 255, 255, 0.563)",
                                fontWeight: isActive ? "bold" : "normal",
                                transform: isActive ? "scale(1.2)" : "scale(1)",
                            })}
                        >
                            History
                        </NavLink>
                    </li>
                </ul>
            </div>
            <div className="footer-container">
                <div className="logout-container">
                    <button type="submit" className="logout-button">
                        <CiLogout className="logout-icon" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
