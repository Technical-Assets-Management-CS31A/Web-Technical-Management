import { useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { AddStaff } from "../components/AddStaff";

const demoStaff = [
  { id: 1, firstname: "Alice", lastname: "Johnson", role: "Intern", status: "Active" },
  { id: 2, firstname: "Bob", lastname: "Smith", role: "Intern", status: "Inactive" },
  { id: 3, firstname: "Charlie", lastname: "Brown", role: "Intern", status: "Active" },
  { id: 4, firstname: "Diana", lastname: "Lopez", role: "Intern", status: "Active" },
  { id: 5, firstname: "Edward", lastname: "Williams", role: "Intern", status: "Inactive" },
  { id: 6, firstname: "Edward", lastname: "Williams", role: "Intern", status: "Inactive" },
  { id: 7, firstname: "Edward", lastname: "Williams", role: "Intern", status: "Inactive" },
  { id: 8, firstname: "Edward", lastname: "Williams", role: "Intern", status: "Inactive" },
  { id: 9, firstname: "Edward", lastname: "Williams", role: "Intern", status: "Inactive" },
];

function toStatusSlug(status: string) {
  const s = String(status || "").toLowerCase();
  if (s.includes("active")) return "active";
  if (s.includes("inactive")) return "inactive";
  return "default";
}

export default function Staff() {
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [searchStaff, setSearchStaff] = useState("");

  const filteredStaff = demoStaff.filter(
    (staff) =>
      staff.firstname.toLowerCase().includes(searchStaff.toLowerCase()) ||
      staff.lastname.toLowerCase().includes(searchStaff.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchStaff.toLowerCase())
  );

  return (
    // Main Container
    <div className="animate-fadeIn min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-[90%] bg-white/90 shadow-2xl rounded-3xl p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1e293b] mb-2 tracking-tight drop-shadow">Staff Management</h1>
            <span className="text-lg text-[#64748b] font-medium">
              Manage your staff members efficiently. Search and update staff records.
            </span>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-150"
            type="button"
            onClick={() => setIsAddStaffOpen((prev) => !prev)}
          >
            <FaPlus /> New Staff
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center mb-6 w-full max-w-md bg-[#f1f5f9] rounded-xl shadow-inner px-4 py-2">
          <FaSearch className="text-xl text-[#64748b] mr-3" />
          <input
            className="w-full bg-transparent p-1 border-none outline-none text-lg text-[#222] placeholder-[#94a3b8]"
            type="search"
            name="searchStaff"
            placeholder="Search staff..."
            onChange={(e) => setSearchStaff(e.target.value)}
          />
        </div>

        {/* Staff Table */}
        <div className="h-[60vh] overflow-x-auto rounded-2xl shadow-lg bg-white/95">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">ID</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Firstname</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Lastname</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Role</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-[#f1f5f9] transition-colors">
                  <td className="py-3 px-6">{staff.id}</td>
                  <td className="py-3 px-6">{staff.firstname}</td>
                  <td className="py-3 px-6">{staff.lastname}</td>
                  <td className="py-3 px-6">{staff.role}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${toStatusSlug(staff.status) === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Description */}
        <p className="mt-6 text-[#64748b] text-sm text-center">
          <span className="font-semibold">Description:</span> Each row represents a staff member. <em>Role</em> shows their assigned role. <em>Status</em> indicates whether the staff is active or inactive.
        </p>
      </div>
      {isAddStaffOpen && <AddStaff />}
    </div>
  );
}