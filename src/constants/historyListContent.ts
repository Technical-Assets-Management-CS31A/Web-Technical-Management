export const HISTORY_LIST_CONTENT = {
  title: "Loan History",
  description:
    "Every loan from the kiosk, from checkout to return. Click a row for the checkout photo and approval.",
  tabs: {
    all: "All",
    ACTIVE: "Active",
    OVERDUE: "Overdue",
    RETURNED: "Returned",
    MISSING: "Missing",
  },
  searchName: "Search History",
  searchPlaceholder: "Search student, asset or loan no.",
  tableHeaders: [
    "Loan No.",
    "Asset",
    "Borrower",
    "Approved By",
    "Room",
    "Checked Out",
    "Returned",
    "Status",
  ],
  empty: "No loans found for this status.",
  footer: {
    label: "Description:",
    intro: "Each row is one loan.",
    eventDate: "Checked Out",
    eventDateDesc: "is when the kiosk session completed.",
    status: "Status",
    statusDesc: "is Active, Overdue, Returned or Missing.",
  },
} as const;
