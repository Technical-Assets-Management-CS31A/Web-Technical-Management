import { FaEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa6";
import { UserData } from "../utils/usersData/userData";

type UserTableProps = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  userRole: string;
  status: string;
  onSetEditUserId: (value: string) => void;
  onSetIsEditUserOpen: (value: boolean) => void;
  onMutate: (value: string) => void;
};

export default function UserTable({
  id,
  firstName,
  lastName,
  username,
  email,
  userRole,
  status,
  onSetEditUserId,
  onSetIsEditUserOpen,
  onMutate,
}: UserTableProps) {

  const data = UserData()

  const UserStatus = (status: string) => {
    if (!status) return "bg-red-100 text-gray-700"
    if (status === "Online") return "bg-green-100 text-green-700"
    if (status === "Offline") return "bg-orange-100 text-gray-700"
    return status
  }

  const handleArchveUser = () => {
    if (window.confirm(`Are you sure you want to archive this User Email ${email} ?`)) {
      onMutate(id)
    }
  }

  const handleEditUser = (id: string) => {
    onSetEditUserId(id);
    onSetIsEditUserOpen(true);
  }

  return (
    <>
      <td className="py-3 px-6">{id}</td>
      <td className="py-3 px-6">{firstName}</td>
      <td className="py-3 px-6">{lastName}</td>
      <td className="py-3 px-6">{username}</td>
      <td className="py-3 px-6">{email}</td>
      <td className="py-3 px-6">{userRole}</td>
      <td className="py-3 px-6">
        <span
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${UserStatus(status)}`}
        >
          {status}
        </span>
      </td>
      <td className="py-3 px-6 flex flex-row gap-4">
        <button
          className="px-4 py-2 cursor-pointer bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white rounded-lg font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150"
          onClick={() => handleEditUser(id)}
        >
          <FaEdit />
        </button>
        {data.userRole === "Admin" ? <button
          onClick={handleArchveUser}
          className="px-4 py-2 cursor-pointer bg-gradient-to-r from-[#ffce72] to-[orange] text-white rounded-lg font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150"
        >
          <FaTrash />
        </button> : ""}

      </td>
    </>
  );
}
