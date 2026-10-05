export const ACTIVITY_LOGS_CONTENT = {
  title: "Activity Logs",
  description:
    "Monitor comprehensive system actions, track inventory movements, and audit user activity with complete visibility.",
  searchPlaceholder: "Search by actor, action, or item...",
  tableHeaders: [
    "Actor Details",
    "Action Type",
    "Target Item",
    "Status Transition",
    "Timestamp",
  ],
  none: "None",
  noStatusChange: "No status change",
  empty: {
    title: "No logs found",
    description:
      "We couldn't find any activity logs matching your search criteria. Try adjusting your filters.",
  },
  error: {
    title: "Connection Issue",
    description:
      "We encountered a problem while trying to fetch the activity history. Please check your connection and try again.",
    refresh: "Refresh Page",
  },
  pagination: {
    showing: "Showing",
    of: " of ",
    entries: " entries",
    prev: "Prev",
    next: "Next",
  },
} as const;
