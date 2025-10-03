import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import { SelectHistoryStatus } from "../components/SelectHistoryStatus";
import HistoryListSkeletonLoader from "../loader/HistoryListSkeletonLoader";
import { useQuery } from "@tanstack/react-query";
import { useBorrowedItemsQuery } from "../query/get/useBorrwedItemsQuery";
import type { THistoryBorrwedItems } from "../types/types";
import HistoryTable from "../components/HistoryTable";
import ErrorTable from "../components/ErrorTables";

const toStatusSlug = (status: string) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("return")) return "returned";
  if (s.includes("overdue")) return "overdue";
  if (s.includes("lost")) return "lost";
  if (s.includes("borrow")) return "borrowed";
  return "default";
};

export default function HistoryList({
  title = "Borrowing History",
  description = "This table lists item borrowing events, including the condition reported and the current status.",
}) {
  const [searchItem, setSearchItem] = useState<string>("");
  const [borrowedItem, setBorrowedItem] = useState<THistoryBorrwedItems[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredItems = borrowedItem.filter((item) => {
    const matchesSearch = item.ItemName.toLowerCase().includes(
      searchItem.toLowerCase(),
    );

    const matchesStatus =
      selectedStatus === "all" || toStatusSlug(item.Status) === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const { data, isPending, isError } = useQuery(useBorrowedItemsQuery());

  useEffect(() => {
    if (data) setBorrowedItem(data);
  }, [data]);

  if (isPending) {
    return <HistoryListSkeletonLoader />;
  }

  return (
    <div className="animate-fadeIn min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-[90%] bg-white/90 shadow-md rounded-3xl p-8 relative">
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
            placeholder={"Search by Borrowed Item"}
          />
        </div>

        <div className="h-[60vh] overflow-x-auto rounded-2xl shadow-lg bg-white/95">
          {/* Table Container */}
          {isError ? (
            <ErrorTable />
          ) : (
            <table className="w-full border-collapse text-left">
              <>
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
                  {filteredItems.map((item: THistoryBorrwedItems) => (
                    <>
                      {/* History Table Component */}
                      <HistoryTable
                        id={item.id}
                        ItemName={item.ItemName}
                        Borrowed_id={item.Borrowed_id}
                        Teacher={item.Teacher}
                        Room={item.Room}
                        Occupied={item.Occupied}
                        Condition={item.Condition}
                        Event_Date={item.Event_Date}
                        Status={toStatusSlug(item.Status)}
                        filteredItems={filteredItems}
                      />
                    </>
                  ))}
                </tbody>
              </>
            </table>
          )}
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
