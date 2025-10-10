import { FaTrashRestore, FaTrash } from "react-icons/fa";
import { FormattedDateTime } from "./FormatedDateTime";
import { SlugCondition } from "./SlugCondition";
import { UserData } from "../utils/usersData/userData";

type ArchiveTableProps = {
    id: string;
    archivedAt: string;
    itemName: string;
    serialNumber: string;
    image: string;
    itemType: string;
    itemModel: string;
    itemMake: string;
    description: string;
    category: string;
    condition: string;
    barCode: string;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
    isRestoring: boolean;
    isDeleting: boolean;
};

export default function ArchiveTableRow({
    id,
    archivedAt,
    itemName,
    serialNumber,
    image,
    itemType,
    itemModel,
    itemMake,
    description,
    category,
    condition,
    barCode,
    onDelete,
    onRestore,
    isRestoring,
    isDeleting
}: ArchiveTableProps) {

    const data = UserData()

    return (
        <>
            <td className="py-3 px-4 font-semibold">{serialNumber}</td>
            <td className="py-3 px-4">
                <img
                    src={
                        typeof image === "string" ? image : ""
                    }
                    alt={itemName}
                    className="w-10 h-10 rounded-xl"
                />
            </td>
            <td className="py-3 px-4">{itemName}</td>
            <td className="py-3 px-4">{itemType}</td>
            <td className="py-3 px-4">{itemModel}</td>
            <td className="py-3 px-4">{itemMake}</td>
            <td className="py-3 px-4 max-w-xs truncate" title={description}>
                {description}
            </td>
            <td className="py-3 px-4">{category}</td>
            <td className="py-3 px-4">
                <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${SlugCondition(condition)}`}
                >
                    {condition}
                </span>
            </td>
            <td className="py-3 px-4 font-mono text-sm">{barCode}</td>
            <td className="py-3 px-4">{FormattedDateTime(archivedAt)}</td>
            <td className="py-3 text-center">
                {data.userRole === "Admin" ? (
                    <button
                        onClick={() => onDelete(id)}
                        disabled={isDeleting}
                        title="Delete item"
                        className="text-red-600 text-2xl cursor-pointer mr-2"
                    >
                        <FaTrash />
                    </button>
                ) : ""}
                {data.userRole === "Admin" ? (
                    <button
                        onClick={() => onRestore(id)}
                        disabled={isRestoring}
                        title="Restore item"
                        className="text-orange-300 text-2xl cursor-pointer"
                    >
                        <FaTrashRestore />
                    </button>
                ) : ""}
            </td>
        </>
    );
}
