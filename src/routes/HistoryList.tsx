import { useEffect, useMemo, useState, useCallback } from "react";
import SearchBar from "../components/SearchBar";
import HistoryListSkeletonLoader from "../loader/HistoryListSkeletonLoader";
import { useQuery } from "@tanstack/react-query";
import type { LoanDto, LoanStatus } from "../@types/types";
import HistoryTable from "../components/HistoryTable";
import ErrorTable from "../components/ErrorTables";
import Pagination from "../components/Pagination";
import LoanDetailDialog from "../components/LoanDetailDialog";
import { useAllLoans } from "../hooks/loanHooks";
import { HISTORY_LIST_CONTENT as T } from "../constants/historyListContent";

type StatusTab = "all" | LoanStatus;

const TABS: { id: StatusTab; active: string; badge: string }[] = [
  { id: "all", active: "border-blue-600 text-blue-600", badge: "bg-blue-100 text-blue-600" },
  { id: "ACTIVE", active: "border-blue-600 text-blue-600", badge: "bg-blue-100 text-blue-600" },
  { id: "OVERDUE", active: "border-orange-600 text-orange-600", badge: "bg-orange-100 text-orange-600" },
  { id: "RETURNED", active: "border-green-600 text-green-600", badge: "bg-green-100 text-green-600" },
  { id: "MISSING", active: "border-red-600 text-red-600", badge: "bg-red-100 text-red-600" },
];

const EMPTY: LoanDto[] = [];

export default function HistoryList({
  title = T.title,
  description = T.description,
}) {
  const [searchItem, setSearchItem] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const itemsPerPage = 10;

  const { data, isPending, isError } = useQuery(useAllLoans());
  const loans = Array.isArray(data) ? data : EMPTY;

  const statusCounts = useMemo(() => {
    const counts: Record<StatusTab, number> = { all: loans.length, ACTIVE: 0, OVERDUE: 0, RETURNED: 0, MISSING: 0 };
    loans.forEach((loan) => { counts[loan.status] += 1; });
    return counts;
  }, [loans]);

  const filteredItems = useMemo(() => {
    const term = searchItem.toLowerCase();
    return loans
      .filter((loan) => {
        const matchesSearch =
          (loan.student?.fullName ?? loan.coordinator?.fullName ?? "").toLowerCase().includes(term) ||
          (loan.student?.studentNo ?? "").toLowerCase().includes(term) ||
          loan.asset.name.toLowerCase().includes(term) ||
          loan.asset.assetCode.toLowerCase().includes(term) ||
          loan.loanNo.toLowerCase().includes(term);
        const matchesStatus = activeTab === "all" || loan.status === activeTab;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => new Date(b.checkedOutAt).getTime() - new Date(a.checkedOutAt).getTime());
  }, [loans, searchItem, activeTab]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const validCurrentPage =
    totalPages > 0 ? Math.min(currentPage, totalPages) : 1;

  const paginatedData = useMemo(
    () =>
      filteredItems.slice(
        (validCurrentPage - 1) * itemsPerPage,
        validCurrentPage * itemsPerPage,
      ),
    [filteredItems, itemsPerPage, validCurrentPage],
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Reset to page 1 when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchItem]);

  if (isPending) return <HistoryListSkeletonLoader />;

  return (
    <div className="relative flex flex-col items-center py-10 px-2 w-full min-h-screen bg-gradient-to-br animate-fadeIn from-slate-50 via-[#e0e7ef] to-[#c7d2fe]">
      <div className="w-full bg-white/90 rounded-2xl p-8 relative">
        {/* Title */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-[#1e293b] text-3xl md:text-5xl mb-2 font-extrabold tracking-tight drop-shadow-lg">
              {title}
            </h1>
            <span className="text-lg font-medium text-slate-500">
              {description}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-semibold text-sm transition-all duration-200 border-b-2 whitespace-nowrap ${activeTab === tab.id
                  ? tab.active
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
            >
              {T.tabs[tab.id]}
              {statusCounts[tab.id] > 0 && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${tab.badge}`}>
                  {statusCounts[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pagination & Search */}
        <div className="flex flex-row gap-2 justify-end items-center mb-6 flex-wrap">
          {filteredItems.length > 0 && (
            <Pagination
              totalPages={totalPages}
              currentPage={validCurrentPage}
              totalItems={filteredItems.length}
              itemsPerPage={itemsPerPage}
              handlePageChange={handlePageChange}
            />
          )}
          <SearchBar
            onChangeValue={setSearchItem}
            name={T.searchName}
            placeholder={T.searchPlaceholder}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl shadow-lg h-[50vh] md:h-[60vh] bg-white/95">
          {isError ? (
            <ErrorTable />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  {T.tableHeaders.map((header) => (
                    <th
                      key={header}
                      className="sticky bg-white  top-0 py-4 px-6 text-sm font-semibold tracking-wider text-left uppercase text-slate-500"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={T.tableHeaders.length} className="py-8 text-center text-gray-500">
                      {T.empty}
                    </td>
                  </tr>
                ) : (
                  <HistoryTable items={paginatedData} onSelect={setSelectedLoanId} />
                )}
              </tbody>
            </table>
          )}
        </div>

        <p className="mt-6 text-sm text-center text-slate-500">
          <span className="font-semibold">{T.footer.label}</span>{" "}
          {T.footer.intro} <em>{T.footer.eventDate}</em> {T.footer.eventDateDesc}{" "}
          <em>{T.footer.status}</em> {T.footer.statusDesc}
        </p>
      </div>

      {selectedLoanId && <LoanDetailDialog loanId={selectedLoanId} onClose={() => setSelectedLoanId(null)} />}
    </div>
  );
}
