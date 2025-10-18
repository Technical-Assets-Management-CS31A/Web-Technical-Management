import { FaTrash } from "react-icons/fa6";
import { UserData } from "../utils/usersData/userData";
import { FaTrashRestore } from "react-icons/fa";

type ArchiveTeacherTableProps = {
    id: string;
    firstName: string;
    middleName: string;
    lastName: string;
    username: string;
    userRole: string;
    status: string;
    onDelete: (id: string) => void;
    onRestore: (id: string) => void;
    isRestoring: boolean;
    isDeleting: boolean;
}
export default function ArchiveTeacherTable({
    id,
    firstName,
    middleName,
    lastName,
    username,
    userRole,
    status,
    onDelete,
    onRestore,
    isRestoring,
    isDeleting,
}: ArchiveTeacherTableProps) {

    type checkIfUserAdminProps = {
        userRole?: string,
        onHandleRestoreItem: () => void,
        onHandleDeleteItem: () => void
    }
    const data = UserData()


    const ShowButtonIfUserAdmin = ({ userRole, onHandleRestoreItem, onHandleDeleteItem }:checkIfUserAdminProps) => {
        if (userRole !== "Admin") return null;
        return (
            <>
                <button
                    onClick={onHandleDeleteItem}
                    disabled={isDeleting}
                    title="Delete item"
                    className="text-red-600 text-2xl cursor-pointer mr-2"
                >
                    <FaTrash />
                </button>

                <button
                    onClick={onHandleRestoreItem}
                    disabled={isRestoring}
                    title="Restore item"
                    className="text-orange-300 text-2xl cursor-pointer"
                >
                    <FaTrashRestore />
                </button>
            </>
        )
    }
    return (
        <>
            <td className="py-4 px-4 border-b border-[#e6e6e6] text-[#1e293b] font-medium">
                {id}
            </td>
            <td className="py-4 px-4 border-b border-[#e6e6e6] text-[#1e293b] font-medium">
                {firstName} {middleName} {lastName}
            </td>
            <td className="py-4 px-4 border-b border-[#e6e6e6] text-[#1e293b] font-medium">
                {username}
            </td>
            <td className="py-4 px-4 border-b border-[#e6e6e6] text-[#1e293b] font-medium">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${userRole === 'teacher'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {userRole}
                </span>
            </td>
            <td className="py-4 px-4 border-b border-[#e6e6e6] text-[#1e293b] font-medium">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                    }`}>
                    {status}
                </span>
            </td>
            <td className="py-4 px-4 border-b border-[#e6e6e6] text-[#1e293b] font-medium">
                <ShowButtonIfUserAdmin
                    userRole={data.userRole}
                    onHandleDeleteItem={() => onDelete(id)}
                    onHandleRestoreItem={() => onRestore(id)}
                />
            </td>
        </>
    )
}
