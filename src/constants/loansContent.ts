export const LOANS_CONTENT = {
  eyebrow: "Loans",
  title: "Loans",
  instructorTitle: "Loans I approved",
  description:
    "Active and past loans from the kiosk. Loans start and end only at the kiosk; this list is read-only.",
  tableTitle: "All loans",
  liveLabel: "Live",
  countLabel: (count: number) => `${count} loan${count !== 1 ? "s" : ""}`,
  searchPlaceholder: "Search asset, loan no., student or room...",
  stats: {
    active: "Out now",
    inTransit: "In transit",
    anomaly: "Location anomaly",
    overdue: "Overdue",
  },
  tabs: {
    all: "All",
    ACTIVE: "Active",
    OVERDUE: "Overdue",
    RETURNED: "Returned",
    MISSING: "Missing",
  },
  roomFilter: {
    label: "Room",
    all: "All rooms",
  },
  sort: {
    newest: "Newest",
    due: "Due soonest",
  },
  clearFilters: "Clear filters",
  tableHeaders: ["Asset", "Borrower", "Approved by", "Room", "Checked out", "Custody", "Due / Returned", "Status", ""],
  eventLoan: (title?: string) => (title ? `Event · ${title}` : "Event loan"),
  transitLeft: (duration: string) => `${duration} to arrive`,
  transitLate: (duration: string) => `${duration} late`,
  dueIn: (duration: string) => `Due in ${duration}`,
  overdueBy: (duration: string) => `Overdue ${duration}`,
  notReturned: "Not returned",
  footerHint:
    "Click a row for the checkout photo, class length, due time and approval ledger. Staff can mark an asset missing or change its room; borrows and returns happen at the kiosk.",
  empty: {
    title: "No loans yet",
    description: "Loans appear here once a kiosk checkout completes.",
    filteredTitle: "No matching loans",
    filteredDescription: "Try another status, room or search term.",
  },
} as const;
