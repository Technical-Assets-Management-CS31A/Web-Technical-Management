export const ACTIVE_BORROWED_ITEMS_CONTENT = {
  eyebrow: "Loans",
  title: "Active Loans",
  instructorTitle: "Loans I approved",
  description: "Loans start only at the kiosk. Track custody from counter to room and the time each loan is due.",
  tableTitle: "Currently Out",
  liveLabel: "Live",
  countLabel: (count: number) => `${count} active loan${count !== 1 ? "s" : ""}`,
  searchPlaceholder: "Search asset, loan no., or student...",
  stats: {
    active: "Active loans",
    inTransit: "In transit",
    anomaly: "Location anomaly",
    overdue: "Overdue",
  },
  sort: {
    due: "Due soonest",
    newest: "Newest",
  },
  tableHeaders: ["Asset", "Borrower", "Approved by", "Room", "Checked out", "Custody", "Due", ""],
  eventLoan: (title?: string) => (title ? `Event · ${title}` : "Event loan"),
  transitLeft: (duration: string) => `${duration} to arrive`,
  transitLate: (duration: string) => `${duration} late`,
  dueIn: (duration: string) => `Due in ${duration}`,
  overdueBy: (duration: string) => `Overdue ${duration}`,
  footerHint:
    "Click a row for the checkout photo, approval and timing. Staff can mark an asset missing or change its room; returns happen at the kiosk.",
  empty: {
    title: "No active loans",
    description: "Loans appear here once a kiosk checkout completes.",
    searchTitle: "No matches found",
    searchDescription: "Try a different asset, loan number, or student.",
  },
} as const;
