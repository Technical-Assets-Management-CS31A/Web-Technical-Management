export const BORROW_LOGS_CONTENT = {
  title: "Borrow Logs",
  description:
    "Track every item borrowing event — who borrowed what, when it was returned, and the full status trail.",
  searchPlaceholder: "Search by borrower, item, serial no...",
  tableHeaders: {
    borrower: "Borrower",
    item: "Item",
    serialNo: "Serial No.",
    status: "Status",
    borrowedAt: "Borrowed At",
    returnedAt: "Returned At",
    remarks: "Remarks",
  },
  roles: {
    student: "Student",
  },
  reservedFor: "Reserved for:",
  notReturned: "Not returned",
  noRemarks: "No remarks",
  empty: {
    title: "No logs found",
    description:
      "No borrow logs match your current search or filter. Try adjusting your criteria.",
  },
  error: {
    title: "Connection Issue",
    description:
      "We couldn't fetch the borrow logs. Please check your connection and try again.",
    refresh: "Refresh Page",
  },
  pagination: {
    showing: "Showing",
    of: "of",
    entries: "entries",
    prev: "Prev",
    next: "Next",
  },
} as const;
