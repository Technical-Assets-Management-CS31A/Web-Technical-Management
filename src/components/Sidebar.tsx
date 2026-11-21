import { Link, useNavigate } from "@tanstack/react-router";
import logo from "../assets/newAclcLogo.webp";
import { CiLogout, CiUser } from "react-icons/ci";
import { GiArchiveRegister } from "react-icons/gi";
import {
  MdHistory,
  MdDashboardCustomize,
  MdAssessment,
  MdMeetingRoom,
  MdReportProblem,
  MdGavel,
} from "react-icons/md";
import { BsPersonCircle, BsClipboardCheck, BsPersonBadge } from "react-icons/bs";
import { FaWifi } from "react-icons/fa";
import { useState, useEffect } from "react";
import SidebarSkeletonLoader from "./SidebarSkeletonLoader";
import { useSidebar } from "../context/SidebarContext";
import { useActiveBorrowCount } from "../hooks/useActiveBorrowCount";
import { useOpenAnomalyCount } from "../hooks/useOpenAnomalyCount";
import { useLogoutUser } from "../hooks/authHooks";
import type { IconType } from "react-icons";
import { Loader2 } from "lucide-react";

type NavLink = {
  label: string;
  link: string;
  icon: IconType;
  badge?: number;
};

export default function Sidebar() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSidebarLoading, setIsSidebarLoading] = useState<boolean>(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { mutate, isPending } = useLogoutUser();
  const { setIsSidebarExpanded } = useSidebar();
  const activeBorrowCount = useActiveBorrowCount();
  const openAnomalyCount = useOpenAnomalyCount();

  const primaryLinks: NavLink[] = [
    { label: "Dashboard", link: "/home/dashboard", icon: MdDashboardCustomize },
    { label: "Assets", link: "/home/inventory-list", icon: GiArchiveRegister },
  ];

  const operationalLinks: NavLink[] = [
    { label: "Loans", link: "/home/loans", icon: BsClipboardCheck, badge: activeBorrowCount },
    { label: "Anomalies", link: "/home/anomalies", icon: MdReportProblem, badge: openAnomalyCount },
    { label: "Violations", link: "/home/violations", icon: MdGavel },
    { label: "Counter", link: "/home/rfid-controller", icon: FaWifi },
  ];

  const administrativeLinks: NavLink[] = [
    { label: "People", link: "/home/user-management", icon: CiUser },
    { label: "Auth cards", link: "/home/auth-cards", icon: BsPersonBadge },
    { label: "Rooms & stations", link: "/home/rooms", icon: MdMeetingRoom },
    { label: "Reports", link: "/home/reports", icon: MdAssessment },
    { label: "Activity logs", link: "/home/activity-logs", icon: MdHistory },
  ];

  const bottomLinks: NavLink[] = [
    { label: "Profile", link: "/home/settings", icon: BsPersonCircle },
  ];

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsSidebarLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sign out right away; the overlay stays up for at least a moment so it does not just flash.
  const logoutUser = () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    const minimumShown = new Promise((resolve) => setTimeout(resolve, 800));
    mutate(undefined, {
      // The token is cleared either way, so leave for the login page even when the server call fails.
      onSettled: (_data, err) => {
        if (err) console.error(err.message);
        void minimumShown.then(() => navigate({ to: "/" }));
      },
    });
  };

  if (isSidebarLoading) return <SidebarSkeletonLoader />;

  const navLinkBase =
    "relative flex items-center gap-3 px-1.5 py-1.5 [@media(max-height:760px)]:py-1 [@media(max-height:680px)]:py-0.5 rounded-lg font-medium text-[13px] tracking-wide text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors duration-200";
  // The left bar marks the current page even when the rail is collapsed to icons.
  const navLinkActive =
    "active !bg-blue-600 !text-white shadow-sm shadow-blue-600/30 before:absolute before:-left-2 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-1 before:rounded-r-full before:bg-blue-600";
  const iconWrap =
    "flex items-center justify-center w-7 h-7 rounded-md shrink-0 bg-slate-100 group-hover:bg-blue-50 [.active_&]:!bg-white/20";

  const SectionLabel = ({ label, first = false }: { label: string; first?: boolean }) => (
    <li
      className={`relative flex items-end px-2 pb-1 ${first ? "h-6" : "h-8 [@media(max-height:760px)]:h-6 [@media(max-height:680px)]:h-4"}`}
    >
      {!first && (
        <span aria-hidden className="absolute left-1.5 bottom-2.5 w-7 h-px bg-slate-200 transition-opacity duration-200 group-hover:opacity-0" />
      )}
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap">
        {label}
      </span>
    </li>
  );

  const NavItem = ({
    item,
    badgeColor = "orange",
    onClick,
    alwaysShowLabel = false,
  }: {
    item: NavLink;
    badgeColor?: "orange" | "green";
    onClick?: () => void;
    alwaysShowLabel?: boolean;
  }) => {
    const bgBadge = badgeColor === "green" ? "bg-emerald-500 shadow-emerald-500/30" : "bg-orange-500 shadow-orange-500/30";
    return (
      <li>
        <Link
          to={item.link}
          onClick={onClick}
          className={`${navLinkBase} group`}
          activeProps={{ className: `${navLinkBase} ${navLinkActive} group` }}
        >
          <span className={`${iconWrap} relative`}>
            <item.icon className="text-[16px] text-slate-500 group-hover:text-blue-600 [.active_&]:!text-white" />
            {item.badge !== undefined && item.badge > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-0.5 text-[9px] font-bold text-white ${bgBadge} rounded-full ring-2 ring-slate-50 shadow-md ${alwaysShowLabel ? "" : "lg:group-hover:hidden"}`}>
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
          </span>
          <span className={`whitespace-nowrap flex-1 ${alwaysShowLabel ? "" : "opacity-0 transition-opacity duration-300 lg:group-hover:opacity-100"}`}>
            {item.label}
          </span>
          {item.badge !== undefined && item.badge > 0 && !alwaysShowLabel && (
            <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold text-white ${bgBadge} rounded-full hidden lg:group-hover:inline-flex shadow-sm`}>
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
          {item.badge !== undefined && item.badge > 0 && alwaysShowLabel && (
            <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold text-white ${bgBadge} rounded-full shadow-sm`}>
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </Link>
      </li>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        aria-label="Sidebar"
        className="hidden fixed top-0 left-0 z-50 flex-col justify-between h-screen overflow-hidden bg-white border-r border-slate-200 shadow-sm transition-all duration-300 lg:flex group animate-fadeIn w-[68px] hover:w-[260px]"
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 h-16 shrink-0 px-3 border-b border-slate-100">
          <img src={logo} alt="Logo" className="rounded-full w-10 h-10 shrink-0 ring-1 ring-slate-200" />
          <div className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p className="text-sm font-bold tracking-widest text-blue-600 uppercase leading-tight">ACLC</p>
            <p className="text-[11px] text-slate-400 font-medium leading-tight">College of Mandaue</p>
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Main" className="flex-1 min-h-0 overflow-hidden px-2 py-2">
          <ul className="flex flex-col gap-1 [@media(max-height:680px)]:gap-0.5">
            <SectionLabel label="Main" first />
            {primaryLinks.map((item) => (
              <NavItem key={item.label} item={item} badgeColor="orange" />
            ))}

            <SectionLabel label="Operations" />
            {operationalLinks.map((item) => (
              <NavItem key={item.label} item={item} badgeColor="green" />
            ))}

            <SectionLabel label="Administration" />
            {administrativeLinks.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}

            <SectionLabel label="Account" />
            {bottomLinks.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <footer className="shrink-0 px-2 py-1.5 border-t border-slate-100">
          <button
            type="button"
            onClick={logoutUser}
            disabled={isPending}
            className="flex gap-3 items-center py-1.5 px-1.5 w-full rounded-lg text-[13px] font-medium tracking-wide text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 disabled:opacity-50"
          >
            <span className="flex items-center justify-center w-7 h-7 rounded-md shrink-0 bg-red-50">
              <CiLogout className="text-[16px] text-red-500" />
            </span>
            <span className="whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              Sign Out
            </span>
          </button>
        </footer>
      </aside>

      {/* Mobile Toggle */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-all duration-200"
          aria-label="Toggle mobile menu"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/*  Mobile Overlay  */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-slate-900/40 backdrop-blur-sm"
          onClick={closeMobileMenu}
        />
      )}

      {/*  Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="flex fixed inset-y-0 left-0 z-50 flex-col w-68 max-w-[85vw] bg-white border-r border-slate-200 shadow-xl lg:hidden animate-slideIn overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
            <img src={logo} alt="Logo" className="w-10 h-10 rounded-full ring-1 ring-slate-200" />
            <div>
              <p className="text-sm font-bold text-slate-900 tracking-wide">ACLC</p>
              <p className="text-[11px] text-slate-400 font-medium">College of Mandaue</p>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2">
            <ul className="flex flex-col gap-0.5">
              {/* Section: Main */}
              <li className="px-2.5 pt-2 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Main</span>
              </li>
              {primaryLinks.map((item) => (
                <NavItem key={item.label} item={item} badgeColor="orange" onClick={closeMobileMenu} alwaysShowLabel />
              ))}

              {/* Section: Operations */}
              <li className="px-2.5 pt-3 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Operations</span>
              </li>
              {operationalLinks.map((item) => (
                <NavItem key={item.label} item={item} badgeColor="green" onClick={closeMobileMenu} alwaysShowLabel />
              ))}

              {/* Divider */}
              <li className="my-1.5 px-2">
                <div className="h-px bg-slate-100" />
              </li>

              {/* Section: Administration */}
              <li className="px-2.5 pt-1 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Administration</span>
              </li>
              {administrativeLinks.map((item) => (
                <NavItem key={item.label} item={item} onClick={closeMobileMenu} alwaysShowLabel />
              ))}

              {/* Section: Account */}
              <li className="px-2.5 pt-3 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</span>
              </li>
              {bottomLinks.map((item) => (
                <NavItem key={item.label} item={item} onClick={closeMobileMenu} alwaysShowLabel />
              ))}
            </ul>
          </nav>

          <footer className="p-2 border-t border-slate-100">
            <button
              type="button"
              onClick={logoutUser}
              disabled={isPending}
              className="flex gap-2.5 items-center py-2 px-2.5 w-full rounded-lg text-[13px] font-medium tracking-wide text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-md bg-red-50">
                <CiLogout className="text-[17px] text-red-500" />
              </span>
              Sign Out
            </button>
          </footer>
        </div>
      )}

      {/* Sign-out screen */}
      {isLoggingOut && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white px-6 animate-fadeIn"
        >
          <img src={logo} alt="" className="h-12 w-12 rounded-full ring-1 ring-slate-200" />
          <p className="mt-6 flex items-center gap-2 text-base font-semibold text-slate-900">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            Signing out…
          </p>
          <p className="mt-1.5 text-sm text-slate-500">You'll be taken back to the sign-in page.</p>
        </div>
      )}
    </>
  );
}
