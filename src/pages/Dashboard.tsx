import { useMemo, useState } from "react";
import SearchBar from "../components/SearchBar";
import type { TBorrowedItems } from "../types/types";
import { useQueries } from "@tanstack/react-query";
import { useBorrowedItemsQuery } from "../query/get/useBorrwedItemsQuery";
import { DashboardSkeletonLoader } from "../loader/DashboardSkeletonLoader";
import { useUserQuery } from "../query/get/useUserQuery";
import DashboardBadges from "../components/DashboardBadges";
import ErrorTable from "../components/ErrorTables";
import Pagination from "../components/Pagination";
import RecentBorrowedItemsTable from "../components/RecentBorrowedItemsTable";

export default function Dashboard() {
  // const [borrowItems, setBorrowItems] = useState<TBorrowedItems[]>([
  //   {
  //     id: 1,
  //     datetime: "2025-01-01 10:00 AM",
  //     teacher: "donald",
  //     room: "slab4",
  //     item: "projector",
  //     occupied: "Alicaba",
  //     remarks: "N/A",
  //   },
  //   {
  //     id: 2,
  //     datetime: "2025-01-01 11:00 AM",
  //     teacher: "noel",
  //     room: "slab2",
  //     item: "hdmi",
  //     occupied: "Villa",
  //     remarks: "N/A",
  //   },
  //   {
  //     id: 3,
  //     datetime: "2025-01-01 12:00 AM",
  //     teacher: "jovelyn",
  //     room: "205",
  //     item: "extension wire",
  //     occupied: "Casupanan",
  //     remarks: "N/A",
  //   },
  //   {
  //     id: 4,
  //     datetime: "2025-01-01 12:00 AM",
  //     teacher: "panfilo",
  //     room: "205",
  //     item: "RG45",
  //     occupied: "Sedilio",
  //     remarks: "N/A",
  //   },
  //   {
  //     id: 5,
  //     datetime: "2025-01-01 12:00 AM",
  //     teacher: "amoin",
  //     room: "205",
  //     item: "computer",
  //     occupied: "Cortes",
  //     remarks: "N/A",
  //   },
  //   {
  //     id: 6,
  //     datetime: "2025-01-01 12:00 AM",
  //     teacher: "dada",
  //     room: "205",
  //     item: "mouse",
  //     occupied: "Morales",
  //     remarks: "N/A",
  //   },
  //   {
  //     id: 7,
  //     datetime: "2025-01-01 12:00 AM",
  //     teacher: "dada",
  //     room: "205",
  //     item: "mouse",
  //     occupied: "Morales",
  //     remarks: "N/A",
  //   },
  //   {
  //     id: 8,
  //     datetime: "2025-01-01 12:00 AM",
  //     teacher: "dada",
  //     room: "205",
  //     item: "mouse",
  //     occupied: "Morales",
  //     remarks: "N/A",
  //   },
  //   {
  //     id: 9,
  //     datetime: "2025-01-01 12:00 AM",
  //     teacher: "dada",
  //     room: "205",
  //     item: "mouse",
  //     occupied: "Morales",
  //     remarks: "N/A",
  //   },
  //   {
  //     id: 10,
  //     datetime: "2025-01-01 12:00 AM",
  //     teacher: "dada",
  //     room: "205",
  //     item: "mouse",
  //     occupied: "Morales",
  //     remarks: "N/A",
  //   },
  //   {
  //     id: 11,
  //     datetime: "2025-01-01 12:00 AM",
  //     teacher: "dada",
  //     room: "205",
  //     item: "mouse",
  //     occupied: "Morales",
  //     remarks: "N/A",
  //   },
  // ]);

  const badges = [
    { name: "Total Items", data: 123, link: "/home/inventory-list" },
    { name: "Categories", data: 123, link: "/home/inventory-list" },
    { name: "Active Staff", data: 123, link: "/home/user-management" },
    { name: "Total Borrowed", data: 212, link: "/home/history-list" },
  ];

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const results = useQueries({
    queries: [useUserQuery(), useBorrowedItemsQuery()],
  });

  // const userResult = results[0];
  const borrowedItemsResult = results[1];

  // userResult.data ?? null;
  const borrowedItemsData: TBorrowedItems[] = useMemo(() => {
    return borrowedItemsResult.data ?? [];
  }, [borrowedItemsResult]);

  const filteredData = useMemo(
    () =>
      borrowedItemsData.filter((item) =>
        item.item.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [borrowedItemsData, searchTerm],
  );

  const paginatedData = useMemo(
    () =>
      filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
      ),
    [filteredData, currentPage],
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const isLoading = borrowedItemsResult.isLoading;
  const isError = borrowedItemsResult.error;

  if (isLoading) return <DashboardSkeletonLoader />;

  return (
    <div className="animate-fadeIn min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col items-center py-10 px-2">
      {/* Stats Badges */}
      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {badges.map((item, index) => (
          <div key={index}>
            <DashboardBadges
              name={item.name}
              link={item.link}
              data={isError ? 0 : (item.data as number)}
            />
          </div>
        ))}
      </div>

      {/* Table Borrowed Section */}
      <div className="w-full max-w-7xl bg-white/90 shadow-xl rounded-2xl p-8 border border-[#e0e7ef]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h1 className="font-bold text-[#1e293b] text-2xl -mt-10">
            Recently Borrowed Items
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            {totalPages > 1 && (
              // Pagination Component
              <Pagination
                totalPages={totalPages}
                currentPage={currentPage}
                handlePageChange={handlePageChange}
              />
            )}
            {/* Search Bar Component */}
            <SearchBar
              onChangeValue={(value) => setSearchTerm(value)}
              name={"search"}
              placeholder={"Search items..."}
            />
          </div>
        </div>
        <div className="h-[55vh] overflow-x-auto rounded-xl shadow-inner bg-white/95">
          {isError ? (
            <ErrorTable />
          ) : (
            <table className="relative w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                    Date & Time
                  </th>
                  <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                    Teacher
                  </th>
                  <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                    Room
                  </th>
                  <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                    Item
                  </th>
                  <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                    Occupied By
                  </th>
                  <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#f1f5f9] transition-colors odd:bg-white even:bg-[#f8fafc]"
                  >
                    {/* Borrowers Table Component */}
                    <RecentBorrowedItemsTable
                      id={item.id}
                      datetime={item.datetime}
                      teacher={item.teacher}
                      room={item.room}
                      item={item.item}
                      occupied={item.occupied}
                      remarks={item.remarks}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
