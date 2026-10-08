import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { THistoryBorrwedItems } from "../@types/types";
import PendingItemsTable from "../components/PendingItemsTable";
import SearchBar from "../components/SearchBar";
import PendingReservationsSkeletonLoader from "../loader/PendingReservationsSkeletonLoader";
import { CalendarCheck, Hourglass } from "lucide-react";
import ErrorTable from "../components/ErrorTables";
import ApproveConfirmationModal from "../components/ApproveConfirmationModal";
import DenyConfirmationModal from "../components/DenyConfirmationModal";
import MarkBorrowedConfirmationModal from "../components/MarkBorrowedConfirmationModal";
import { useUpdateLentItemStatusMutation } from "../query/patch/useUpdateLentItemStatusMutation";
import { showToast } from "../components/AppToast";
import { BorrowDetailDialog } from "../components/BorrowDetailDialog";
import { useRecentlyBorrowItems } from "../hooks/itemHooks";
import { usePendingReservationsState } from "../states/pending-reservations-state";
import { PENDING_RESERVATIONS_CONTENT as T } from "../constants/pendingReservationsContent";

export default function PendingReservations() {
  const {
    activeTab,
    setActiveTab,
    searchItem,
    setSearchItem,
    isApproveModalOpen,
    setIsApproveModalOpen,
    isDenyModalOpen,
    setIsDenyModalOpen,
    isMarkBorrowedModalOpen,
    setIsMarkBorrowedModalOpen,
    selectedItem,
    setSelectedItem,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    selectedItemId,
    setSelectedItemId,
  } = usePendingReservationsState();

  // If navigated here from the due-soon dialog, open the Reservations tab directly
  useEffect(() => {
    const intent = sessionStorage.getItem("pendingReservationsTab");
    if (intent === "reservations") {
      setActiveTab("reservations");
      sessionStorage.removeItem("pendingReservationsTab");
    }
  }, [setActiveTab]);

  const { data, isPending, isError } = useQuery(useRecentlyBorrowItems());
  const { mutate: approveLentItem, isPending: isApproving } = useUpdateLentItemStatusMutation();
  const { mutate: denyLentItem,   isPending: isDenying   } = useUpdateLentItemStatusMutation();
  const { mutate: borrowLentItem, isPending: isBorrowing } = useUpdateLentItemStatusMutation();

  const borrowedItem: THistoryBorrwedItems[] = useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );

  // Filtered lists
  const pendingItems = useMemo(
    () =>
      borrowedItem.filter((item) => {
        const matchesSearch =
          item.borrowerFullName?.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.item.itemName?.toLowerCase().includes(searchItem.toLowerCase());
        return matchesSearch && item.status === "Pending";
      }),
    [borrowedItem, searchItem],
  );

  const reservationItems = useMemo(
    () =>
      borrowedItem.filter((item) => {
        const matchesSearch =
          item.borrowerFullName?.toLowerCase().includes(searchItem.toLowerCase()) ||
          item.item.itemName?.toLowerCase().includes(searchItem.toLowerCase());
        return matchesSearch && item.status === "Approved";
      }),
    [borrowedItem, searchItem],
  );

  const filteredItems = activeTab === "pending" ? pendingItems : reservationItems;

  // Approve
  const handleApproveClick = (item: THistoryBorrwedItems) => {
    setSelectedItem(item);
    setIsApproveModalOpen(true);
  };

  const handleConfirmApprove = () => {
    if (!selectedItem) {
      showToast.error(T.toast.actionFailed, T.toast.noItemSelected);
      setIsApproveModalOpen(false);
      return;
    }

    approveLentItem(
      { id: selectedItem.id, lentItemsStatus: "Approved" },
      {
        onSuccess: () => {
          showToast.success(
            T.toast.approvedTitle,
            T.toast.approvedMessage(selectedItem.item.itemName),
          );
          setIsApproveModalOpen(false);
          setSelectedItem(null);
        },
        onError: (error) => {
          showToast.error(T.toast.approvalFailedTitle, error.message || T.toast.approvalFailed);
          setIsApproveModalOpen(false);
        },
      },
    );
  };

  // Deny / Cancel
  const handleDenyClick = (item: THistoryBorrwedItems) => {
    setSelectedItem(item);
    setIsDenyModalOpen(true);
  };

  const handleConfirmDeny = () => {
    if (!selectedItem) {
      showToast.error(T.toast.actionFailed, T.toast.noItemSelected);
      setIsDenyModalOpen(false);
      return;
    }

    const statusToSet = selectedItem.status === "Approved" ? "Canceled" : "Denied";

    denyLentItem(
      { id: selectedItem.id, lentItemsStatus: statusToSet },
      {
        onSuccess: () => {
          const actionText =
            selectedItem.status === "Approved"
              ? T.toast.canceledReservation
              : T.toast.deniedRequest;
          showToast.success(
            T.toast.processedTitle,
            T.toast.processedMessage(actionText, selectedItem.item.itemName),
          );
          setIsDenyModalOpen(false);
          setSelectedItem(null);
        },
        onError: (error) => {
          showToast.error(T.toast.actionFailed, error.message || T.toast.processFailed);
          setIsDenyModalOpen(false);
        },
      },
    );
  };

  // Mark as Borrowed
  const handleMarkBorrowedClick = (item: THistoryBorrwedItems) => {
    setSelectedItem(item);
    setIsMarkBorrowedModalOpen(true);
  };

  const handleConfirmMarkBorrowed = () => {
    if (!selectedItem) {
      showToast.error(T.toast.actionFailed, T.toast.noItemSelected);
      setIsMarkBorrowedModalOpen(false);
      return;
    }

    borrowLentItem(
      { id: selectedItem.id, lentItemsStatus: "Borrowed" },
      {
        onSuccess: () => {
          showToast.success(
            T.toast.markedBorrowedTitle,
            T.toast.markedBorrowedMessage(selectedItem.item.itemName, selectedItem.borrowerFullName),
          );
          setIsMarkBorrowedModalOpen(false);
          setSelectedItem(null);
          setActiveTab("reservations");
        },
        onError: (error) => {
          showToast.error(T.toast.actionFailed, error.message || T.toast.markBorrowedFailed);
          setIsMarkBorrowedModalOpen(false);
        },
      },
    );
  };

  // Details modal
  const handleRowClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedItemId(null);
  };

  const totalPending = useMemo(
    () => borrowedItem.filter((item) => item.status === "Pending").length,
    [borrowedItem],
  );

  const totalApproved = useMemo(
    () => borrowedItem.filter((item) => item.status === "Approved").length,
    [borrowedItem],
  );

  const stats = [
    { label: T.stats.pending, value: totalPending, icon: Hourglass },
    { label: T.stats.approved, value: totalApproved, icon: CalendarCheck },
  ];

  const tabs = [
    { id: "pending" as const, label: T.tabs.pending, count: pendingItems.length },
    { id: "reservations" as const, label: T.tabs.reservations, count: reservationItems.length },
  ];

  if (isPending) return <PendingReservationsSkeletonLoader />;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-8xl space-y-6 px-4 py-6 sm:px-6 md:px-8">

        {/* Header */}
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{T.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{T.description}</p>
        </header>

        {/* Summary */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5"
            >
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-900 tabular-nums">{stat.value}</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                <stat.icon className="h-5 w-5" />
              </span>
            </div>
          ))}
        </section>

        {/* Table card */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          {/* Toolbar: tabs + search */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 pt-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="-mb-px flex gap-6 overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex shrink-0 items-center gap-2 border-b-2 pb-3 pt-1 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-blue-600 text-slate-900"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab.label}
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                        isActive ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="pb-3">
              <SearchBar
                onChangeValue={setSearchItem}
                name="Search Pending"
                placeholder={T.searchPlaceholder}
              />
            </div>
          </div>

          {isError ? (
            <ErrorTable />
          ) : (
            <PendingItemsTable
              key={activeTab}
              items={filteredItems}
              onApprove={handleApproveClick}
              onDeny={handleDenyClick}
              onMarkBorrowed={handleMarkBorrowedClick}
              onRowClick={handleRowClick}
            />
          )}
        </section>
      </div>

      {/* Modals */}
      <ApproveConfirmationModal
        isOpen={isApproveModalOpen}
        item={selectedItem}
        onConfirm={handleConfirmApprove}
        onCancel={() => { setIsApproveModalOpen(false); setSelectedItem(null); }}
        isLoading={isApproving}
      />

      <DenyConfirmationModal
        isOpen={isDenyModalOpen}
        item={selectedItem}
        onConfirm={handleConfirmDeny}
        onCancel={() => { setIsDenyModalOpen(false); setSelectedItem(null); }}
        isLoading={isDenying}
      />

      <MarkBorrowedConfirmationModal
        isOpen={isMarkBorrowedModalOpen}
        item={selectedItem}
        onConfirm={handleConfirmMarkBorrowed}
        onCancel={() => { setIsMarkBorrowedModalOpen(false); setSelectedItem(null); }}
        isLoading={isBorrowing}
      />

      {selectedItemId && (
        <BorrowDetailDialog
          itemId={selectedItemId}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
        />
      )}
    </div>
  );
}
