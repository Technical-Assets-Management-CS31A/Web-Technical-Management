import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Nfc, Trash2 } from "lucide-react";
import { useAllRooms, useDeleteAsset } from "../hooks/assetHooks";
import { SlugCondition } from "./SlugCondition";
import { SlugStatus } from "./SlugStatus";
import { UserData, canManageAssets } from "../utils/usersData/userData";
import PopUpModal from "./PopUpModal";
import { useNavigate } from "@tanstack/react-router";
import type { AssetDto, AssetStatus } from "../@types/types";
import { showToast } from "./AppToast";
import { getErrorMessage } from "./form/FormKit";
import { formatEnum } from "../lib/utils";

type InventoryTableProps = {
    item: AssetDto[];
};

// An asset that is out on a loan or under investigation can't be deleted.
const LOCKED_STATUSES: AssetStatus[] = ["AT_COUNTER", "IN_TRANSIT", "IN_ROOM_VERIFIED", "LOCATION_ANOMALY", "OVERDUE", "MISSING"];

export const InventoryTable = ({ item }: InventoryTableProps) => {
    const navigate = useNavigate();
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const { data: rooms = [] } = useQuery(useAllRooms());
    const roomCode = (id: string | null) => rooms.find((room) => room.id === id)?.code ?? "—";

    const viewer = UserData();
    const canDelete = canManageAssets(viewer.role);

    const { mutate, isPending: isDeleting } = useDeleteAsset();

    const handleConfirmDelete = () => {
        if (!selectedItemId) return;
        mutate(selectedItemId, {
            onSuccess: () => showToast.success("Asset Deleted", "The asset was moved to deleted records."),
            onError: (error) => showToast.error("Delete Failed", getErrorMessage(error, "Failed to delete asset.")),
            onSettled: () => setSelectedItemId(null),
        });
    };

    return (
        <>
            <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                    <tr className="sticky top-0 z-10 bg-slate-50">
                        {["Asset", "Category", "Type", "Condition", "Home / Current", "Status", ""].map((header, i) => (
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
                    {item.map((row) => {
                        const isLocked = LOCKED_STATUSES.includes(row.status);
                        return (
                            <tr
                                key={row.id}
                                onClick={() => navigate({ to: `/home/item/$id`, params: { id: row.id } })}
                                className="cursor-pointer transition-colors hover:bg-slate-50"
                            >
                                <td className="px-5 py-3">
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-900">{row.name}</p>
                                        <p className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <span className="font-mono">{row.assetCode}</span>
                                            {row.rfidTagUid && <Nfc className="h-3 w-3 text-slate-400" aria-label="RFID tagged" />}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-slate-700">{row.category?.name}</td>
                                <td className="px-5 py-3 text-slate-600">{formatEnum(row.type)}</td>
                                <td className="px-5 py-3">
                                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugCondition(row.condition)}`}>
                                        {formatEnum(row.condition)}
                                    </span>
                                </td>
                                <td className="px-5 py-3 font-mono text-xs text-slate-600">
                                    {roomCode(row.homeRoomId)}
                                    {row.currentRoomId && row.currentRoomId !== row.homeRoomId && <span className="text-blue-700"> → {roomCode(row.currentRoomId)}</span>}
                                </td>
                                <td className="px-5 py-3">
                                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${SlugStatus(row.status)}`}>
                                        {formatEnum(row.status)}
                                    </span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    {canDelete && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (!isLocked) setSelectedItemId(row.id);
                                            }}
                                            disabled={isLocked}
                                            title={isLocked ? `Cannot delete — asset is ${formatEnum(row.status).toLowerCase()}` : "Delete asset"}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" /> Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {selectedItemId && (
                <PopUpModal
                    title="Delete asset"
                    label="delete"
                    noun="asset"
                    destination="Deleted records page"
                    onHandleCancelAction={() => setSelectedItemId(null)}
                    onHandleConfirmAction={handleConfirmDelete}
                    isLoading={isDeleting}
                />
            )}
        </>
    );
};
