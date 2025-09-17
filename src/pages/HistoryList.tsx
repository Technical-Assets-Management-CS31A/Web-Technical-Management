import { FaSearch } from "react-icons/fa";
import { useState } from "react";

function formatDate(d: string | Date) {
  try {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
}

function toStatusSlug(status: string) {
  const s = String(status || "").toLowerCase();
  if (s.includes("return")) return "returned";
  if (s.includes("overdue")) return "overdue";
  if (s.includes("lost")) return "lost";
  if (s.includes("borrow")) return "borrowed";
  return "default";
}

const demoRows = [
  { id: 1, name: "HDMI", borrowedId: "BRW-0001", teacher: "John Doe", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-18T09:30:00", condition: "Good", status: "Returned" },
  { id: 2, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 3, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 4, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 5, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 6, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 7, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 8, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 9, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 10, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
];

export default function HistoryList({
  title = "Borrowing History",
  description = "This table lists item borrowing events, including the condition reported and the current status.",
}) {
  const [searchItem, setSearchItem] = useState<string>("");

  const filteredItems = demoRows.filter(item =>
    item.teacher.toLowerCase().includes(searchItem.toLowerCase())
  );

  return (
    // Main Container
    < div className="animate-fadeIn min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col items-center py-10 px-2" >
      <div className="w-full max-w-[90%] bg-white/90 shadow-2xl rounded-3xl p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1e293b] mb-2 tracking-tight drop-shadow">{title}</h1>
            <span className="text-lg text-[#64748b] font-medium">{description}</span>
          </div>
        </div>
        <div className="flex items-center mb-6 w-full max-w-md bg-[#f1f5f9] rounded-xl shadow-inner px-4 py-2">
          <FaSearch className="text-xl text-[#64748b] mr-3" />
          <input
            className="w-full bg-transparent p-1 border-none outline-none text-lg text-[#222] placeholder-[#94a3b8]"
            type="search"
            name="searchItem"
            placeholder="Search by Teacher..."
            onChange={(e) => setSearchItem(e.target.value)}
          />
        </div>
        <div className="h-[60vh] overflow-x-auto rounded-2xl shadow-lg bg-white/95">
          {/* Table Container */}
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">ID</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Item Name</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Borrowed ID</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Teacher</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Room</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Occupied By</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Condition</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Event Date</th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((r) => (
                <tr key={r.id} className="hover:bg-[#f1f5f9] transition-colors  odd:bg-white even:bg-[#f8fafc]">
                  <td className="py-3 px-6">{r.id}</td>
                  <td className="py-3 px-6">{r.name}</td>
                  <td className="py-3 px-6">{r.borrowedId}</td>
                  <td className="py-3 px-6">{r.teacher}</td>
                  <td className="py-3 px-6">{r.room}</td>
                  <td className="py-3 px-6">{r.occupied_by}</td>
                  <td className="py-3 px-6">{r.condition}</td>
                  <td className="py-3 px-6">{formatDate(r.eventDate)}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${toStatusSlug(r.status) === "returned"
                        ? "bg-green-100 text-green-700"
                        : toStatusSlug(r.status) === "borrowed"
                          ? "bg-blue-100 text-blue-700"
                          : toStatusSlug(r.status) === "overdue"
                            ? "bg-yellow-100 text-yellow-700"
                            : toStatusSlug(r.status) === "lost"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Description */}
        <p className="mt-6 text-[#64748b] text-sm text-center">
          <span className="font-semibold">Description:</span> Each row represents one history event. <em>Event Date</em> shows when it occurred. <em>Condition</em> is the item state reported at that time. <em>Status</em> reflects the latest known state for that borrow record.
        </p>
      </div>
    </ div>
  );
}