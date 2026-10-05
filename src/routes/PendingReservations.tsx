import { useEffect, useMemo } from "react";
import HistoryListSkeletonLoader from "../loader/HistoryListSkeletonLoader";
import { useQuery } from "@tanstack/react-query";
import type { THistoryBorrwedItems } from "../@types/types";
import PendingItemsTable from "../components/PendingItemsTable";
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

  if (isPending) return <HistoryListSkeletonLoader />;

  return (
    <div className="relative flex flex-col items-center py-10 px-2 w-full min-h-screen lg:h-full bg-gradient-to-br animate-fadeIn from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe]">
      <div className="w-full bg-white/90 rounded-2xl p-8 relative">
        {/* Title */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-[#1e293b] text-3xl md:text-3xl mb-2 font-extrabold tracking-tight drop-shadow-lg">
              {T.title}
            </h1>
            <span className="text-lg font-medium text-[#64748b]">
              {T.description}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 font-semibold text-base transition-all duration-200 border-b-2 ${
              activeTab === "pending"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {T.tabs.pending}
            {pendingItems.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                {pendingItems.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("reservations")}
            className={`px-6 py-3 font-semibold text-base transition-all duration-200 border-b-2 ${
              activeTab === "reservations"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {T.tabs.reservations}
            {reservationItems.length > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                {reservationItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Table */}
        {isError ? (
          <ErrorTable />
        ) : (
          <PendingItemsTable
            items={filteredItems}
            onApprove={handleApproveClick}
            onDeny={handleDenyClick}
            onMarkBorrowed={handleMarkBorrowedClick}
            onRowClick={handleRowClick}
            searchValue={searchItem}
            onSearchChange={setSearchItem}
          />
        )}
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
