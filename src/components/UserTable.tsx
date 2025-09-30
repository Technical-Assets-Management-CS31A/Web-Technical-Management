import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";

type UserTableProps = {
  Id: string;
  firstName: string;
  lastName: string;
  userRole: string;
  status: string;
  onSetEditUserId: (value: string) => void;
  onSetIsEditUserOpen: (value: boolean) => void;
  onMutate: (value: string) => void;
};

export default function UserTable({
  Id,
  firstName,
  lastName,
  userRole,
  status,
  onSetEditUserId,
  onSetIsEditUserOpen,
  onMutate,
}: UserTableProps) {
  return (
    <>
      <td className="py-3 px-6">{Id}</td>
      <td className="py-3 px-6">{firstName}</td>
      <td className="py-3 px-6">{lastName}</td>
      <td className="py-3 px-6">{userRole}</td>
      <td className="py-3 px-6">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            status.toLowerCase() === "active"
              ? "bg-green-100 text-green-700"
              : status.toLowerCase() === "inactive"
              ? "bg-orange-100 text-gray-700"
              : "bg-gray-400 text-gray-700"
          }`}
        >
          {status}
        </span>
      </td>
      <td className="py-3 px-6 flex flex-row gap-4">
        <button
          className="px-4 py-2 cursor-pointer bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white rounded-lg font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150"
          onClick={() => {
            onSetEditUserId(Id);
            onSetIsEditUserOpen(true);
          }}
        >
          <FaEdit />
        </button>
        <button
          onClick={() => {
            if (
              window.confirm(
                `Are you sure you want to archive this User Id ${Id} ?`
              )
            ) {
              onMutate(Id);
            }
          }}
          className="px-4 py-2 cursor-pointer bg-gradient-to-r from-[#ffce72] to-[orange] text-white rounded-lg font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150"
        >
          <FaTrash />
        </button>
      </td>
    </>
  );
}
