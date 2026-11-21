// Pill colours for the UPPER_SNAKE status enums (asset status, loan status, custody state).
const STATUS_CLASSES: Record<string, string> = {
    // AssetStatus
    IN_STORAGE: "bg-green-100 text-green-700",
    AT_COUNTER: "bg-indigo-100 text-indigo-700",
    IN_TRANSIT: "bg-blue-100 text-blue-700",
    IN_ROOM_VERIFIED: "bg-emerald-100 text-emerald-700",
    LOCATION_ANOMALY: "bg-amber-100 text-amber-800",
    OVERDUE: "bg-orange-100 text-orange-700",
    MISSING: "bg-red-100 text-red-700",
    MAINTENANCE: "bg-yellow-100 text-yellow-800",
    RETIRED: "bg-gray-100 text-gray-600",
    // LoanStatus
    ACTIVE: "bg-blue-100 text-blue-700",
    RETURNED: "bg-green-100 text-green-700",
    // CustodyState
    AWAITING_ARRIVAL: "bg-blue-100 text-blue-700",
    VERIFIED: "bg-emerald-100 text-emerald-700",
    ANOMALY: "bg-amber-100 text-amber-800",
    NOT_REQUIRED: "bg-gray-100 text-gray-600",
};

export const SlugStatus = (status: string | null | undefined) => {
    if (!status) return "";
    return STATUS_CLASSES[status] ?? "bg-gray-100 text-gray-700";
};
