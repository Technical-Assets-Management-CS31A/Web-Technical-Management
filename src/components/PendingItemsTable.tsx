import { useState, useMemo } from "react";
import no_image_svg from "../assets/no-image-svgrepo-com.svg";
import type { THistoryBorrwedItems } from "../@types/types";
import { FormattedDateTime } from "./FormattedDateTime";
import { SlugStatus } from "./SlugStatus";
import Pagination from "./Pagination";
import { Check, ClipboardCheck, Clock, Info, PackageCheck, X } from "lucide-react";

type PendingItemsTableProps = {
    items: THistoryBorrwedItems[];
    onApprove: (item: THistoryBorrwedItems) => void;
    onDeny: (item: THistoryBorrwedItems) => void;
    onMarkBorrowed: (item: THistoryBorrwedItems) => void;
    onRowClick: (itemId: string) => void;
};

const ITEMS_PER_PAGE = 10;
const PICKUP_SOON_MS = 60 * 60 * 1000;

const HEADERS = ["Item", "Borrower", "Room", "Requested", "Reserved For", "Status", "Remarks", ""];

const isPickupSoon = (item: THistoryBorrwedItems) => {
    if (item.status !== "Approved" || !item.reservedFor) return false;
    const diff = new Date(item.reservedFor).getTime() - Date.now();
    return diff > 0 && diff <= PICKUP_SOON_MS;
};

const secondaryButton =
    "inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600";

export default function PendingItemsTable({
    items,
    onApprove,
    onDeny,
    onMarkBorrowed,
    onRowClick,
}: PendingItemsTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const validCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
    const paginatedItems = useMemo(
        () => items.slice((validCurrentPage - 1) * ITEMS_PER_PAGE, validCurrentPage * ITEMS_PER_PAGE),
        [items, validCurrentPage],
    );

    return (
        <>
            <div className="overflow-x-auto">
                <div className="max-h-[60vh] min-h-[45vh] overflow-y-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="sticky top-0 z-10 bg-slate-50">
                                {HEADERS.map((header, i) => (
                                    <th
                                        key={`${header}-${i}`}
                                        className="border-b border-slate-200 px-5 py-3 font-medium text-slate-500"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td colSpan={HEADERS.length} className="px-8 py-20 text-center">
                                        <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                                            <ClipboardCheck className="h-5 w-5 text-slate-400" />
                                        </span>
                                        <p className="text-sm font-semibold text-slate-900">Nothing to review</p>
                                        <p className="mt-1 text-sm text-slate-500">New requests will appear here.</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item) => {
                                    // "Approved" = reservation approved and awaiting pickup
                                    const isApprovedReservation = item.status === "Approved";
                                    const pickupSoon = isPickupSoon(item);

                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={() => onRowClick(item.id)}
                                            className={`cursor-pointer transition-colors ${
                                                pickupSoon ? "bg-amber-50/60 hover:bg-amber-50" : "hover:bg-slate-50"
                                            }`}
                                        >
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={typeof item.item.image === "string" ? item.item.image : no_image_svg}
                                                        alt={item.item.itemName}
                                                        className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-cover"
                                                        onError={(e) => { e.currentTarget.src = no_image_svg; }}
                                                    />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-slate-900">{item.item.itemName}</p>
                                                        <p className="text-xs text-slate-500">{item.item.serialNumber}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3">
                                                <p className="text-slate-900">{item.borrowerFullName}</p>
                                                <p className="text-xs text-slate-500">
                                                    {item.teacherFullName ? `Teacher: ${item.teacherFullName}` : "No teacher"}
                                                </p>
                                            </td>
                                            <td className="px-5 py-3 text-slate-700">{item.room || "-"}</td>
                                            <td className="px-5 py-3 text-slate-600">{FormattedDateTime(item.item.createdAt)}</td>

                                            {/* Reserved For — with urgency indicator */}
                                            <td className="px-5 py-3">
                                                {item.reservedFor ? (
                                                    <div>
                                                        <p className="text-slate-700">{FormattedDateTime(item.reservedFor)}</p>
                                                        {pickupSoon && (
                                                            <p className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                                                                <Clock className="h-3 w-3" /> Pickup soon
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>

                                            <td className="px-5 py-3">
                                                <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugStatus(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="max-w-48 truncate px-5 py-3 text-slate-500">{item.remarks || "-"}</td>

                                            {/* Action buttons */}
                                            <td className="px-5 py-3">
                                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {isApprovedReservation ? (
                                                        <>
                                                            <button
                                                                onClick={() => onMarkBorrowed(item)}
                                                                title="Mark as borrowed manually (use when RFID scan is unavailable)"
                                                                className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                                                            >
                                                                <PackageCheck className="h-3.5 w-3.5" /> Mark Borrowed
                                                            </button>
                                                            <button onClick={() => onDeny(item)} title="Cancel reservation" className={secondaryButton}>
                                                                <X className="h-3.5 w-3.5" /> Cancel
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => onApprove(item)}
                                                                title="Approve request"
                                                                className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
                                                            >
                                                                <Check className="h-3.5 w-3.5" /> Approve
                                                            </button>
                                                            <button onClick={() => onDeny(item)} title="Deny request" className={secondaryButton}>
                                                                <X className="h-3.5 w-3.5" /> Deny
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                totalPages={totalPages}
                currentPage={validCurrentPage}
                totalItems={items.length}
                itemsPerPage={ITEMS_PER_PAGE}
                handlePageChange={setCurrentPage}
            />

            <p className="flex items-start gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500">
                <Info className="mt-px h-3.5 w-3.5 shrink-0 text-slate-400" />
                <span>
                    Use <span className="font-medium text-slate-700">Approve / Deny</span> for pending requests.
                    For approved reservations, use <span className="font-medium text-slate-700">Mark Borrowed</span> if the
                    RFID scan didn't trigger, or <span className="font-medium text-slate-700">Cancel</span> to cancel the reservation.
                </span>
            </p>
        </>
    );
}
