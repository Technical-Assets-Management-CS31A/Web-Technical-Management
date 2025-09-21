import { FaArrowCircleLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe]">
            <h1 className="text-6xl text-[#64748b] font-bold mb-8">ACLC College of Mandaue</h1>
            <h2 className="text-3xl text-[#64748b] font-bold mb-8">Technical Assets Management</h2>
            <h3 className="text-6xl font-extrabold text-[#eb2525] mb-4">404</h3>
            <p className="text-xl text-[#64748b] mb-4">Page Not Found</p>
            <p className="text-xl text-[#64748b] mb-8">The page you are looking for does not exist.</p>
            <Link
                to="/home/dashboard"
                className="flex flex-row justify-center items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-150"
            >
                <FaArrowCircleLeft className="text-xl" />Go Back to Dashboard
            </Link>
        </div>
    );
}