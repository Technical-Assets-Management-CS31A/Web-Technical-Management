import { Link } from "@tanstack/react-router";
import { ArrowLeft, PackageSearch } from "lucide-react";
import logo from "../assets/newAclcLogo.webp";

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-12">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-900/30 translate-x-1/3 translate-y-1/3" />
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-blue-50/20" />
        <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-50/15" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full border border-white/5" />
      </div>

      <div className="relative z-10 w-full max-w-xl animate-fadeInUp">
        {/* Card */}
        <div className="relative rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-2xl shadow-blue-900/20 overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-blue-50/80" />
            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-50/60" />
          </div>

          <div className="relative">
            {/* Brand */}
            <div className="flex flex-col items-center text-center mb-8">
              <img
                src={logo}
                alt="ACLC Logo"
                className="h-16 w-16 rounded-full object-cover shadow-lg mb-4"
              />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                ACLC College of Mandaue
              </p>
              <p className="text-sm font-medium text-slate-400 mt-1">
                Technical Equipment Borrowing System
              </p>
            </div>

            {/* 404 hero */}
            <div className="relative flex flex-col items-center mb-8">
              <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
                <span className="text-[9rem] sm:text-[11rem] font-black text-blue-600/5 leading-none tracking-tighter">
                  404
                </span>
              </div>

              <div className="relative flex items-center justify-center h-24 w-24 rounded-2xl bg-blue-50 border border-slate-200 mb-5">
                <PackageSearch className="h-11 w-11 text-blue-600" strokeWidth={1.5} />
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400/60 opacity-75" />
                  <span className="relative inline-flex h-5 w-5 rounded-full bg-rose-500 border-2 border-white" />
                </span>
              </div>

              <h1 className="text-7xl sm:text-8xl font-black tracking-tighter leading-none text-blue-600">
                404
              </h1>
              <h2 className="mt-3 text-xl sm:text-2xl font-extrabold text-slate-900">
                Page not found
              </h2>
              <p className="mt-2 max-w-sm text-sm sm:text-base text-slate-400 font-medium leading-relaxed">
                This route isn&apos;t in our inventory. The page may have been
                moved, archived, or never existed.
              </p>
            </div>

            {/* Quick tips */}
            <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                "Check the URL for typos",
                "Use the sidebar to navigate",
                "Return to the dashboard",
              ].map((tip) => (
                <div
                  key={tip}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-xs font-semibold text-slate-500"
                >
                  {tip}
                </div>
              ))}
            </div>

            <Link
              to="/home/dashboard"
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-bold tracking-wide shadow-md shadow-blue-200 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back to Continue
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-blue-100/75 font-medium">
          © 2025 ACLC College of Mandaue · Technical Equipment Borrowing System
        </p>
      </div>
    </div>
  );
}
