export const ACTIVITY_LOG_DETAIL_CONTENT = {
  loading: {
    title: "Loading Log Details",
    description: "Fetching activity entry...",
  },
  notFound: {
    title: "Log Not Found",
    description:
      "We couldn't load this activity log. It may have been removed or the ID is invalid.",
    goBack: "Go Back",
  },
  backToLogs: "Back to Activity Logs",
  badge: "Activity detail",
  title: "Log Entry",
  idLabel: "ID:",
  uidLabel: "UID:",
  sections: {
    actor: "Actor",
    action: "Action",
    statusTransition: "Status Transition",
    item: "Item",
    remarks: "Remarks",
  },
  none: "None",
  noStatusChange: "No status change",
  item: {
    name: "Name",
    serialNumber: "Serial Number",
    category: "Category",
    reservedFor: "Reserved For",
  },
  timestamps: {
    createdAt: "Created At",
    borrowedAt: "Borrowed At",
    returnedAt: "Returned At",
  },
  noRemarks: "No remarks",
} as const;
