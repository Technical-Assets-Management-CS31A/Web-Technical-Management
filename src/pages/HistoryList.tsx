import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import { SelectHistoryStatus } from "../components/SelectHistoryStatus";
import HistoryListSkeletonLoader from "../loader/HistoryListSkeletonLoader";
import { useQuery } from "@tanstack/react-query";
import { useBorrowedItemsQuery } from "../query/get/useBorrwedItemsQuery";
import type { THistoryBorrwedItems } from "../types/types";

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

export default function HistoryList({
  title = "Borrowing History",
  description = "This table lists item borrowing events, including the condition reported and the current status.",
}) {
  const [searchItem, setSearchItem] = useState<string>("");
  const [borrowedItem, setBorrowedItem] = useState<THistoryBorrwedItems[]>([
    {
      id: 1,
      ItemName: "HDMI",
      Borrowed_id: "BRW-0001",
      Teacher: "John Doe",
      Room: "Slab2",
      Occupied: "Cortes",
      Event_Date: "2025-08-18T09:30:00",
      Condition: "Good",
      Status: "Returned",
    },
    {
      id: 2,
      ItemName: "HDMI",
      Borrowed_id: "BRW-0004",
      Teacher: "Michael Brown",
      Room: "Slab2",
      Occupied: "Cortes",
      Event_Date: "2025-08-21T10:00:00",
      Condition: "Damaged port",
      Status: "Lost",
    },
    {
      id: 3,
      ItemName: "HDMI",
      Borrowed_id: "BRW-0004",
      Teacher: "Michael Brown",
      Room: "Slab2",
      Occupied: "Cortes",
      Event_Date: "2025-08-21T10:00:00",
      Condition: "Damaged port",
      Status: "Lost",
    },
    {
      id: 4,
      ItemName: "HDMI",
      Borrowed_id: "BRW-0004",
      Teacher: "Michael Brown",
      Room: "Slab2",
      Occupied: "Cortes",
      Event_Date: "2025-08-21T10:00:00",
      Condition: "Damaged port",
      Status: "Lost",
    },
    {
      id: 5,
      ItemName: "HDMI",
      Borrowed_id: "BRW-0004",
      Teacher: "Michael Brown",
      Room: "Slab2",
      Occupied: "Cortes",
      Event_Date: "2025-08-21T10:00:00",
      Condition: "Damaged port",
      Status: "Lost",
    },
    {
      id: 6,
      ItemName: "HDMI",
      Borrowed_id: "BRW-0004",
      Teacher: "Michael Brown",
      Room: "Slab2",
      Occupied: "Cortes",
      Event_Date: "2025-08-21T10:00:00",
      Condition: "Damaged port",
      Status: "Lost",
    },
    {
      id: 7,
      ItemName: "HDMI",
      Borrowed_id: "BRW-0004",
      Teacher: "Michael Brown",
      Room: "Slab2",
      Occupied: "Cortes",
      Event_Date: "2025-08-21T10:00:00",
      Condition: "Damaged port",
      Status: "Lost",
    },
    {
      id: 8,
      ItemName: "HDMI",
      Borrowed_id: "BRW-0004",
      Teacher: "Michael Brown",
      Room: "Slab2",
      Occupied: "Cortes",
      Event_Date: "2025-08-21T10:00:00",
      Condition: "Damaged port",
      Status: "Lost",
    },
    {
      id: 9,
      ItemName: "HDMI",
      Borrowed_id: "BRW-0004",
      Teacher: "Michael Brown",
      Room: "Slab2",
      Occupied: "Cortes",
      Event_Date: "2025-08-21T10:00:00",
      Condition: "Damaged port",
      Status: "Lost",
    },
    {
      id: 10,
      ItemName: "HDMI",
      Borrowed_id: "BRW-0004",
      Teacher: "Michael Brown",
      Room: "Slab2",
      Occupied: "Cortes",
      Event_Date: "2025-08-21T10:00:00",
      Condition: "Damaged port",
      Status: "Lost",
    },
  ])
  const [selectedStatus, setSelectedStatus] = useState<string>("all");


  const { data, isPending } = useQuery(useBorrowedItemsQuery())

  useEffect(() => {
    if (data) setBorrowedItem(data)
  }, [data])

  if (isPending) {
    return <HistoryListSkeletonLoader />;
  }

  const filteredItems = borrowedItem.filter((item) => {
    const matchesSearch =
      item.Teacher.toLowerCase().includes(searchItem.toLowerCase()) ||
      item.ItemName.toLowerCase().includes(searchItem.toLowerCase()) ||
      item.Borrowed_id.toLowerCase().includes(searchItem.toLowerCase()) ||
      item.Room.toLowerCase().includes(searchItem.toLowerCase()) ||
      item.Occupied.toLowerCase().includes(searchItem.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || toStatusSlug(item.Status) === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    // Main Container
    <div className="animate-fadeIn min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-[90%] bg-white/90 shadow-2xl rounded-3xl p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1e293b] mb-2 tracking-tight drop-shadow">
              {title}
            </h1>
            <span className="text-lg text-[#64748b] font-medium">
              {description}
            </span>
          </div>
        </div>
        <div className="flex flex-row justify-end gap-2 mb-6">
          {/* Select History Component*/}
          <SelectHistoryStatus onChangeStatus={setSelectedStatus} />
          {/* Search Bar Component */}
          <SearchBar
            onChangeValue={(value) => setSearchItem(value)}
            name={"Search History"}
            placeholder={"Search by Teacher"}
          />
        </div>

        <div className="h-[60vh] overflow-x-auto rounded-2xl shadow-lg bg-white/95">
          {/* Table Container */}
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  ID
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Item Name
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Borrowed ID
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Teacher
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Room
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Occupied By
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Condition
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Event Date
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-[#f1f5f9] transition-colors  odd:bg-white even:bg-[#f8fafc]"
                >
                  <td className="py-3 px-6">{r.id}</td>
                  <td className="py-3 px-6">{r.ItemName}</td>
                  <td className="py-3 px-6">{r.Borrowed_id}</td>
                  <td className="py-3 px-6">{r.Teacher}</td>
                  <td className="py-3 px-6">{r.Room}</td>
                  <td className="py-3 px-6">{r.Occupied}</td>
                  <td className="py-3 px-6">{r.Condition}</td>
                  <td className="py-3 px-6">{formatDate(r.Event_Date)}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${toStatusSlug(r.Status) === "returned"
                        ? "bg-green-100 text-green-700"
                        : toStatusSlug(r.Status) === "borrowed"
                          ? "bg-blue-100 text-blue-700"
                          : toStatusSlug(r.Status) === "overdue"
                            ? "bg-yellow-100 text-yellow-700"
                            : toStatusSlug(r.Status) === "lost"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {r.Status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Description */}
        <p className="mt-6 text-[#64748b] text-sm text-center">
          <span className="font-semibold">Description:</span> Each row
          represents one history event. <em>Event Date</em> shows when it
          occurred. <em>Condition</em> is the item state reported at that time.{" "}
          <em>Status</em> reflects the latest known state for that borrow
          record.
        </p>
      </div>
    </div>
  );
}
