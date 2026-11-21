export const ACTIVITY_LOG_DETAIL_CONTENT = {
  loading: {
    title: "Loading Log Details",
    description: "Fetching audit entry...",
  },
  notFound: {
    title: "Log Not Found",
    description:
      "We couldn't load this audit entry. It may have been removed or the ID is invalid.",
    goBack: "Go Back",
  },
  backToLogs: "Back to Activity Logs",
  badge: "Audit entry",
  title: "Log Entry",
  idLabel: "ID:",
  uidLabel: "UID:",
  sections: {
    actor: "Actor",
    action: "Action",
    statusTransition: "Changes",
    record: "Record",
    reason: "Reason",
  },
  none: "None",
  noStatusChange: "No field changes recorded",
  record: {
    type: "Type",
    id: "Record ID",
  },
  timestamps: {
    createdAt: "Recorded At",
  },
  noReason: "No reason recorded",
} as const;
