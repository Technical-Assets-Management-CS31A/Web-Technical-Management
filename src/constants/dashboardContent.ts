export const DASHBOARD_CONTENT = {
  title: "Dashboard",
  description: "Live status of every borrowable asset, updated as kiosks and room stations report in.",
  openAnomalies: (count: number) => `${count} open anomal${count === 1 ? "y" : "ies"}`,
  greetings: {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
  },
  activity: {
    title: "Checkout Activity",
    description: "Loans checked out over the last 7 days",
    totalLabel: "this week",
    today: "Today",
  },
  statusOverview: {
    title: "Loan Status",
    description: "loans by status",
    empty: "No loans yet.",
  },
  badges: {
    atCounter: "At Counter",
    inTransit: "In Transit",
    inRoomVerified: "Verified in Room",
    anomaly: "Anomaly",
    overdue: "Overdue",
  },
  stations: {
    title: "Stations",
    empty: "No station heartbeats yet.",
  },
  recentBorrows: {
    title: "Latest Loans",
    description: "The 5 most recent loans still out",
    viewAll: "View all",
    empty: {
      title: "No assets out",
      description: "Loans appear here once a kiosk checkout completes.",
    },
  },
  tableHeaders: [
    "Asset",
    "Borrower",
    "Room",
    "Checked Out",
    "Custody",
    "Due",
  ],
} as const;
