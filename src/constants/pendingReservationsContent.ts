export const PENDING_RESERVATIONS_CONTENT = {
  title: "Pending & Reservations",
  description:
    "Review and approve pending reservation requests and manage confirmed reservations.",
  tabs: {
    pending: "Pending Reservations",
    reservations: "Reservations",
  },
  toast: {
    actionFailed: "Action Failed",
    noItemSelected: "No item selected.",
    approvedTitle: "Reservation Approved",
    approvedMessage: (itemName: string) => `Reservation approved for ${itemName}`,
    approvalFailedTitle: "Approval Failed",
    approvalFailed: "Failed to approve reservation",
    processedTitle: "Request Processed",
    canceledReservation: "canceled reservation",
    deniedRequest: "denied borrow request",
    processedMessage: (actionText: string, itemName: string) =>
      `Successfully ${actionText} for ${itemName}`,
    processFailed: "Failed to process request",
    markedBorrowedTitle: "Marked as Borrowed",
    markedBorrowedMessage: (itemName: string, borrower: string) =>
      `${itemName} marked as borrowed for ${borrower}`,
    markBorrowedFailed: "Failed to mark item as borrowed",
  },
} as const;
