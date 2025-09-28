import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import type { TBorrowedItems } from "../types/types";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useQueries } from "@tanstack/react-query";
import { useBorrowedItemsQuery } from "../query/get/useBorrwedItemsQuery";
import { DashboardSkeletonLoader } from "../loader/DashboardSkeletonLoader";
import { useUserQuery } from "../query/get/useUserQuery";
ChartJS.register(ArcElement, Tooltip, Legend);
// import { Pie } from "react-chartjs-2";

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
    { name: "Active Staff", data: 123, link: "/home/staff" },
    { name: "Total Borrowed", data: 212, link: "/home/history-list" },
  ];

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  const results = useQueries({
    queries: [useUserQuery(), useBorrowedItemsQuery()],
  });

  const userResult = results[0];
  const borrowedItemsResult = results[1];

  const user = userResult.data ?? null;
  const borrowedItemsData: TBorrowedItems[] = borrowedItemsResult.data ?? [];

  const filteredData = useMemo(
    () =>
      borrowedItemsData.filter((item) =>
        item.item.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [borrowedItemsData, searchTerm]
  );

  const paginatedData = useMemo(
    () =>
      filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [filteredData, currentPage]
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  console.log(user);

  const isLoading = borrowedItemsResult.isLoading;
  const isError = borrowedItemsResult.error;

  if (isLoading) return <DashboardSkeletonLoader />;

  // Pie Chart Component
  // const PieChart = () => {
  //   const data = {
  //     labels: ["HDMI", "Projector", "Extension Wire", "Others"],
  //     datasets: [
  //       {
  //         label: "Equipment Count",
  //         data: [12, 19, 30, 10],
  //         backgroundColor: [
  //           "rgba(255, 99, 132, 0.6)",
  //           "rgba(54, 162, 235, 0.6)",
  //           "rgba(255, 206, 86, 0.6)",
  //           "rgba(75, 192, 192, 0.6)",
  //         ],
  //         borderColor: [
  //           "rgba(255, 99, 132, 1)",
  //           "rgba(54, 162, 235, 1)",
  //           "rgba(255, 206, 86, 1)",
  //           "rgba(75, 192, 192, 1)",
  //         ],
  //         borderWidth: 1,
  //       },
  //     ],
  //   };

  //   const options = {
  //     responsive: true,
  //     plugins: {
  //       legend: {
  //         position: "right" as const,
  //         labels: {
  //           color: "rgba(0, 0, 0, 1)",
  //           font: {
  //             size: 14,
  //           },
  //           padding: 20,
  //         },
  //       },
  //       tooltip: {
  //         enabled: true,
  //       },
  //     },
  //   };

  //   return <Pie data={data} options={options} />;
  // };

  // // Staff Status Component
  // const staffStatus = [
  //   { id: 1, name: "morales", status: "active" },
  //   { id: 2, name: "cortes", status: "inactive" },
  //   { id: 3, name: "sedillio", status: "active" },
  //   { id: 4, name: "alicaba", status: "inactive" },
  //   { id: 5, name: "alicaba", status: "inactive" },
  // ];

  // const { data, error } = useQuery({
  //   queryKey: ["borrow-items"],
  //   queryFn: () => GetBorrowItems()
  // })

  // if (error || !data) {
  //   return (
  //     <div className="w-full h-full flex justify-center items-center">
  //       <span className="text-lg text-red-500 font-semibold">Failed to load borrowers items.</span>
  //     </div>
  //   );
  // }

  // if (data && Array.isArray(data)) {
  //   setBorrowItems(data);
  // }

  // Filtered Data

  // Extract data safely

  // const filteredData: TBorrowedItems[] = borrowedItemsData.filter(
  //   (item: TBorrowedItems) =>
  //     item.item.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  // const paginatedData = filteredData.slice(
  //   (currentPage - 1) * itemsPerPage,
  //   currentPage * itemsPerPage
  // );

  return (
    <div className="animate-fadeIn min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col items-center py-10 px-2">
      {/* Stat Badges */}
      <div className="w-full max-w-7xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
        {badges.map((item) => (
          <Link
            to={item.link}
            className="flex flex-col bg-white/90 shadow-xl rounded-2xl p-8 items-center justify-center hover:scale-105 hover:shadow-2xl transition-all duration-200 border border-[#e0e7ef]"
          >
            <h2 className="font-semibold text-lg text-[#64748b] mb-2">
              {item.name}
            </h2>
            <p className="text-4xl font-bold text-[#2563eb]">
              {isError ? 0 : item.data}
            </p>
          </Link>
        ))}
      </div>

      {/* Chart & Staff Status */}
      {/* <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        Storage Section
        <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex flex-col justify-center border border-[#e0e7ef]">
          <h1 className="font-bold text-[#1e293b] text-xl mb-4">
            Items Available by Category
          </h1>
          <div className="flex justify-center items-center w-full h-full">
            <div style={{ width: "320px", height: "260px" }}>
              <PieChart />
            </div>
          </div>
        </div>
        Staff Status Section
        <div className="bg-white/90 shadow-xl rounded-2xl p-6 flex flex-col border border-[#e0e7ef]">
          <h1 className="font-bold text-[#1e293b] text-xl mb-4">
            Staff Status
          </h1>
          <ul className="flex flex-col gap-3 h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
            {staffStatus.map((staff) => (
              <li
                key={staff.id}
                className="flex justify-between items-center border-b border-[#e0e7ef] py-2"
              >
                <span className="font-medium text-[#334155]">
                  {staff.name.charAt(0).toUpperCase() + staff.name.slice(1)}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-block w-4 h-4 rounded-full ${staff.status === "active" ? "bg-green-300" : "bg-red-300"}`}
                  ></span>
                  <span
                    className={`text-sm font-semibold ${staff.status === "active" ? "text-green-700" : "text-red-500"}`}
                  >
                    {staff.status.charAt(0).toUpperCase() +
                      staff.status.slice(1)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div> */}

      {/* Table Borrowed Section */}
      <div className="w-full max-w-7xl bg-white/90 shadow-xl rounded-2xl p-8 border border-[#e0e7ef]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <h1 className="font-bold text-[#1e293b] text-2xl -mt-10">
            Recently Borrowed Items
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            {totalPages > 1 && (
              <div className="flex items-center gap-2 -mt-6">
                <button
                  className="px-4 py-3 rounded bg-[#e0e7ef] text-[#2563eb] font-semibold disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    className={`px-4 py-3 rounded font-semibold ${
                      currentPage === idx + 1
                        ? "bg-[#2563eb] text-white"
                        : "bg-[#e0e7ef] text-[#2563eb]"
                    }`}
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  className="px-4 py-3 rounded bg-[#e0e7ef] text-[#2563eb] font-semibold disabled:opacity-50"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
            <SearchBar
              onChangeValue={(value) => setSearchTerm(value)}
              name={"search"}
              placeholder={"Search items..."}
            />
          </div>
        </div>
        <div className="h-[55vh] overflow-x-auto rounded-xl shadow-inner bg-white/95">
          {isError ? (
            <div className="flex flex-col items-center justify-center h-full w-full p-6 bg-red-50 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-red-700 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-red-600 text-center mb-4">
                We were unable to load your data. Please check your internet
                connection or try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
            </div>
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
                    <td className="py-3 px-6">{item.datetime}</td>
                    <td className="py-3 px-6">
                      {item.teacher.charAt(0).toUpperCase() +
                        item.teacher.slice(1)}
                    </td>
                    <td className="py-3 px-6">
                      {item.room.charAt(0).toUpperCase() + item.room.slice(1)}
                    </td>
                    <td className="py-3 px-6">
                      {item.item.charAt(0).toUpperCase() + item.item.slice(1)}
                    </td>
                    <td className="py-3 px-6">
                      {item.occupied.charAt(0).toUpperCase() +
                        item.occupied.slice(1)}
                    </td>
                    <td className="py-3 px-6">
                      {item.remarks.charAt(0).toUpperCase() +
                        item.remarks.slice(1)}
                    </td>
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
