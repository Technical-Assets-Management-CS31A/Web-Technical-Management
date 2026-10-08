import { useEffect, useMemo } from "react";
import no_image_svg from "../assets/no-image-svgrepo-com.svg";
import { DashboardSkeletonLoader } from "../loader/DashboardSkeletonLoader";
import DashboardBadges from "../components/DashboardBadges";
import ErrorTable from "../components/ErrorTables";
import { ViewRecentBorrowItems } from "../components/ViewRecentBorrowItems";
import { useReturnItem } from "../hooks/itemHooks";
import { showToast } from "../components/AppToast";
import { getToken } from "../utils/token";
import { BorrowDetailDialog } from "../components/BorrowDetailDialog";
import { SlugStatus } from "../components/SlugStatus";
import { useRecentlyAllBorrowItems, useSummarriesData } from "../data/dashboard-data";
import { useDashboardStore } from "../states/dashboard-state";
import { truncateRemarks } from "../components/truncateRemarks";
import { BookOpen, LayoutGrid, Package, RotateCcw, ScanLine, Users, X } from "lucide-react";
import DashboardActivityChart from "../components/DashboardActivityChart";
import DashboardStatusOverview from "../components/DashboardStatusOverview";
import { UserData } from "../utils/usersData/userData";
import { Link } from "@tanstack/react-router";
import { FormattedDateTime } from "../components/FormattedDateTime";
import { DASHBOARD_CONTENT as T } from "../constants/dashboardContent";

const TABLE_HEADERS = T.tableHeaders;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return T.greetings.morning;
  if (hour < 18) return T.greetings.afternoon;
  return T.greetings.evening;
};

export default function Dashboard() {
  const { dataSummary } = useSummarriesData();
  const { firstName } = UserData();
  const { borrowedItemData, isBorrowedItemLoading, isBorrowedItemError } =
    useRecentlyAllBorrowItems();

  const {
    selectedId,
    setSelectedId,
    scannedLentItemId,
    setScannedLentItemId,
    showReturnModal,
    setShowReturnModal,
    returnBarcode,
    setReturnBarcode,
    returnError,
    setReturnError,
    showScanModal,
    setShowScanModal,
    scannedBarcode,
    setScannedBarcode,
    scanError,
    setScanError,
  } = useDashboardStore();

  const returnItemMutation = useReturnItem();

  const badges = [
    { name: T.badges.totalItems, data: dataSummary.totalItems, link: "/home/inventory-list", icon: <Package className="h-5 w-5" /> },
    { name: T.badges.categories, data: dataSummary.totalItemsCategories, link: "/home/inventory-list", icon: <LayoutGrid className="h-5 w-5" /> },
    { name: T.badges.activeUsers, data: dataSummary.totalActiveUsers, link: "/home/user-management", icon: <Users className="h-5 w-5" /> },
    { name: T.badges.totalBorrowed, data: dataSummary.totalLentItems, link: "/home/history-list", icon: <BookOpen className="h-5 w-5" /> },
  ];

  const recentBorrows = useMemo(
    () => borrowedItemData.filter((item) => item.status === "Borrowed").slice(0, 5),
    [borrowedItemData],
  );

  // Keep store in sync with fetched data (optional — useful if other pages read it)
  const setBorrowedItemData = useDashboardStore((s) => s.setBorrowedItemData);
  useEffect(() => {
    setBorrowedItemData(borrowedItemData);
  }, [borrowedItemData, setBorrowedItemData]);

  const handleViewOpen = (id: string) => setSelectedId(id);
  const handleViewClose = () => setSelectedId(null);

  const handleReturnSubmit = async () => {
    setReturnError("");
    const barcode = returnBarcode.trim();
    if (!barcode) { setReturnError(T.errors.barcodeRequired); return; }
    try {
      await returnItemMutation.mutateAsync(barcode);
      setShowReturnModal(false);
      setReturnBarcode("");
      setReturnError("");
      showToast.success(T.toast.returnedTitle, T.toast.returnedMessage);
    } catch (error: any) {
      showToast.error(T.toast.returnFailedTitle, error.message || T.toast.returnFailed);
      setShowReturnModal(false);
      setReturnBarcode("");
    }
  };

  const handleScanSubmit = async () => {
    setScanError("");
    const lentItemBarcode = scannedBarcode.trim();
    if (!lentItemBarcode) { setScanError(T.errors.lentBarcodeRequired); return; }
    if (!/^LENT-\d{8}-\d{3}$/.test(lentItemBarcode)) {
      setScanError(T.errors.invalidLentBarcode);
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/lentItems/barcode/${lentItemBarcode}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );
      const contentType = response.headers.get("content-type");
      const hasJson = contentType?.includes("application/json");
      if (!response.ok) {
        let msg: string = T.errors.lentItemNotFound;
        if (hasJson) {
          try { const err = await response.json(); msg = err.message || msg; } catch { /* ignore */ }
        } else {
          msg = (await response.text()) || `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(msg);
      }
      if (!hasJson) throw new Error(T.errors.invalidResponseFormat);
      const { data: lentItem } = await response.json();
      if (!lentItem) throw new Error(T.errors.invalidResponseStructure);
      setShowScanModal(false);
      setScannedBarcode("");
      setScanError("");
      setScannedLentItemId(lentItem.id);
    } catch (error: any) {
      setScanError(error.message || T.errors.fetchLentItemFailed);
    }
  };

  if (isBorrowedItemLoading) return <DashboardSkeletonLoader />;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 md:px-8">
      <div className="mx-auto max-w-8xl space-y-6">

        {/* ── Header ── */}
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {getGreeting()}{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{T.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
            <span>
              {new Intl.DateTimeFormat("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              }).format(new Date())}
            </span>
            <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {T.notifications}
              <span className="font-medium text-emerald-600">{T.online}</span>
            </span>
          </div>
        </header>

        {/* ── Stat Cards ── */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {badges.map((item) => (
            <DashboardBadges key={item.name} name={item.name} link={item.link} data={item.data} icon={item.icon} />
          ))}
        </section>

        {/* ── Insights ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardActivityChart records={borrowedItemData} />
          </div>
          <DashboardStatusOverview records={borrowedItemData} />
        </div>

        {/* ── Recent Borrows Table ── */}
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{T.recentBorrows.title}</h2>
              <p className="text-sm text-slate-500">{T.recentBorrows.description}</p>
            </div>
            <Link
              to="/home/active-borrowed-items"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {T.recentBorrows.viewAll}
            </Link>
          </div>

          <div className="overflow-x-auto">
            {isBorrowedItemError ? (
              <ErrorTable />
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200">
                    {TABLE_HEADERS.map((h) => (
                      <th key={h} className="px-5 py-3 font-medium text-slate-500">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBorrows.length > 0 ? (
                    recentBorrows
                      .slice()
                      .sort((a, b) => new Date(b.lentAt).getTime() - new Date(a.lentAt).getTime())
                      .map((row) => (
                        <tr
                          key={row.id}
                          onClick={() => handleViewOpen(row.id)}
                          className="cursor-pointer hover:bg-slate-50"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={typeof row.item.image === "string" ? row.item.image : no_image_svg}
                                alt={row.item.itemName}
                                className="h-9 w-9 rounded object-cover"
                              />
                              <div>
                                <p className="text-slate-900">{row.item.itemName}</p>
                                <p className="text-xs text-slate-500">{row.item.serialNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-700">{row.borrowerFullName}</td>
                          <td className="px-5 py-3 text-slate-700">{row.room || "-"}</td>
                          <td className="px-5 py-3 text-slate-700">{FormattedDateTime(row.lentAt || "-")}</td>
                          <td className="px-5 py-3">
                            <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugStatus(row.status)}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-500">
                            {row.remarks ? truncateRemarks(row.remarks) : "-"}
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan={TABLE_HEADERS.length} className="px-5 py-12 text-center">
                        <p className="text-sm font-medium text-slate-700">{T.recentBorrows.empty.title}</p>
                        <p className="mt-1 text-sm text-slate-500">{T.recentBorrows.empty.description}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* ── Dialogs ── */}
      {selectedId && (
        <ViewRecentBorrowItems
          itemId={selectedId}
          isOpen={!!selectedId}
          onClose={handleViewClose}
        />
      )}

      <BorrowDetailDialog
        itemId={scannedLentItemId ?? ""}
        isOpen={!!scannedLentItemId}
        onClose={() => setScannedLentItemId(null)}
        fromScan
        onProceedToScan={() => showToast.success(T.toast.borrowedTitle, T.toast.borrowedMessage)}
      />

      {/* ── Return Modal ── */}
      {showReturnModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowReturnModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <RotateCcw className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <h2 className="text-base font-bold text-slate-900">{T.returnModal.title}</h2>
              </div>
              <button
                onClick={() => setShowReturnModal(false)}
                className="h-10 w-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                {T.returnModal.instructions.prefix}{" "}
                <span className="font-semibold text-slate-700">{T.returnModal.instructions.highlight}</span>{" "}
                {T.returnModal.instructions.suffix}
              </p>
              <div>
                <input
                  type="text"
                  autoFocus
                  value={returnBarcode}
                  onChange={(e) => { setReturnBarcode(e.target.value); setReturnError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleReturnSubmit(); }}
                  placeholder={T.returnModal.placeholder}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-4 transition-all ${returnError
                    ? "border-rose-300 focus:ring-rose-500/10 focus:border-rose-500"
                    : "border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500"
                    }`}
                />
                {returnError && <p className="text-rose-500 text-xs mt-1.5 font-medium">{returnError}</p>}
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  {T.returnModal.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleReturnSubmit}
                  disabled={returnItemMutation.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {returnItemMutation.isPending ? T.returnModal.processing : T.returnModal.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Scan Modal ── */}
      {showScanModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowScanModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <ScanLine className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <h2 className="text-base font-bold text-slate-900">{T.scanModal.title}</h2>
              </div>
              <button
                onClick={() => setShowScanModal(false)}
                className="h-10 w-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 leading-relaxed">
                {T.scanModal.instructions.prefix}{" "}
                <span className="font-semibold text-slate-700">{T.scanModal.instructions.highlight}</span>{" "}
                {T.scanModal.instructions.suffix}
              </p>
              <div>
                <input
                  type="text"
                  autoFocus
                  value={scannedBarcode}
                  onChange={(e) => { setScannedBarcode(e.target.value); setScanError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleScanSubmit(); }}
                  placeholder={T.scanModal.placeholder}
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-4 transition-all ${scanError
                    ? "border-rose-300 focus:ring-rose-500/10 focus:border-rose-500"
                    : "border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500"
                    }`}
                />
                {scanError && <p className="text-rose-500 text-xs mt-1.5 font-medium">{scanError}</p>}
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowScanModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  {T.scanModal.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleScanSubmit}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
                >
                  {T.scanModal.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
