import type { FC } from "react";
import { useState } from "react";
import { IoArchive } from "react-icons/io5";
import { useArchiveItem } from "../hooks/itemHooks";
import no_image_svg from "../assets/no-image-svgrepo-com.svg";
import { FormattedDateTime } from "./FormattedDateTime";
import { SlugCondition } from "./SlugCondition";
import { SlugStatus } from "./SlugStatus";
import { UserData } from "../utils/usersData/userData";
import PopUpModal from "./PopUpModal";
import { useNavigate } from "@tanstack/react-router";
import type { TItemList } from "../@types/types";
import { showToast } from "./AppToast";

type InventoryTableProps = {
    item: TItemList[];
};

const BLOCKED_STATUSES = ["Borrowed", "Reserved", "Pending", "Archived"];

type ShowButtonIfUserAdminProps = {
    userRole?: string;
    itemStatus?: string;
    onHandleArchive: () => void;
};

const ShowButtonIfUserAdmin: FC<ShowButtonIfUserAdminProps> = ({
    userRole,
    itemStatus,
    onHandleArchive,
}) => {
    if (userRole !== "Admin" && userRole !== "SuperAdmin" && userRole !== "Staff") return null;

    const isBlocked = BLOCKED_STATUSES.some(
        (s) => s.toLowerCase() === itemStatus?.toLowerCase()
    );

    const isAlreadyArchived = itemStatus?.toLowerCase() === "archived";

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                if (!isBlocked) onHandleArchive();
            }}
            disabled={isBlocked}
            title={
                isAlreadyArchived
                    ? "Item is already archived"
                    : isBlocked
                        ? `Cannot archive — item is currently ${itemStatus}`
                        : "Archive item"
            }
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
        >
            <IoArchive /> Archive
        </button>
    );
};

export const InventoryTable = ({ item }: InventoryTableProps) => {
    const navigate = useNavigate();
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const data = UserData();
    const userRole = data.userRole;

    const { mutate, isPending: isArchiving } = useArchiveItem();

    const handleArchive = (id: string) => {
        setSelectedItemId(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmArchive = () => {
        if (selectedItemId) {
            mutate(selectedItemId, {
                onSuccess: (data) => {
                    showToast.success("Item Archived", data.message);
                },
                onError: (error) => {
                    showToast.error("Archive Failed", error.message);
                },
            });
            setIsConfirmOpen(false);
        }
    };

    const handleCancelArchive = () => {
        setIsConfirmOpen(false);
        setSelectedItemId(null);
    };

    return (
        <>
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                    <tr className="sticky top-0 z-10 bg-slate-50">
                        {["Item", "Category", "Condition", "Date Added", "Status", ""].map((header, i) => (
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
                    {item.map((row) => (
                        <tr
                            key={row.id}
                            onClick={() => navigate({ to: `/home/item/$id`, params: { id: row.id } })}
                            className="cursor-pointer transition-colors hover:bg-slate-50"
                        >
                            <td className="px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={typeof row.image === "string" ? row.image : no_image_svg}
                                        alt={row.itemName}
                                        className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 bg-slate-50 object-cover"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-900">{row.itemName}</p>
                                        <p className="text-xs text-slate-500">{row.serialNumber}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-5 py-3 text-slate-700">{row.category}</td>
                            <td className="px-5 py-3">
                                <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugCondition(row.condition)}`}>
                                    {row.condition === "NeedRepair" ? "Need Repair" : row.condition}
                                </span>
                            </td>
                            <td className="px-5 py-3 text-slate-600">{FormattedDateTime(row.createdAt)}</td>
                            <td className="px-5 py-3">
                                <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugStatus(row.status)}`}>
                                    {row.status}
                                </span>
                            </td>
                            <td className="px-5 py-3 text-right">
                                <ShowButtonIfUserAdmin
                                    userRole={userRole}
                                    itemStatus={row.status}
                                    onHandleArchive={() => handleArchive(row.id)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {isConfirmOpen && (
                <PopUpModal
                    title="Archive item"
                    label="archive"
                    noun="item"
                    destination="archive"
                    onHandleCancelAction={handleCancelArchive}
                    onHandleConfirmAction={handleConfirmArchive}
                    isLoading={isArchiving}
                />
            )}
        </>
    );
};
