import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa6";
import logo from "../assets/img/aclcLogo.webp";
import { FormattedDateTime } from "./FormatedDateTime";
import { SlugCondition } from "./SlugCondition";
import { MdOutlineGridView } from "react-icons/md";
import { UserData } from "../utils/usersData/userData";

type InventoryTableProps = {
  id?: string;
  createdAt: string;
  ItemName: string;
  SerialNumber: string;
  Image: string | File;
  ItemType: string;
  Category: string;
  Condition: string;
  onMutate: (value: string) => void;
};

export default function InventoryTable({
  id,
  createdAt,
  ItemName,
  SerialNumber,
  Image,
  Category,
  Condition,
  onMutate,
}: InventoryTableProps) {

  const data = UserData()

  return (
    <>
      <td className="py-3 px-4 font-semibold">{SerialNumber}</td>
      <td className="py-3 px-4">
        <img
          src={typeof Image === "string" ? Image : logo}
          alt={ItemName}
          className="w-10 h-10 rounded-xl"
        />
      </td>
      <td className="py-3 px-4">{ItemName}</td>
      <td className="py-3 px-4">{Category}</td>
      <td className="py-3 px-4">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${SlugCondition(Condition)}`}
        >
          {Condition}
        </span>
      </td>
      <td className="py-3 px-4">{FormattedDateTime(createdAt)}</td>
      <td className="py-3 pr-4 flex flex-row ">
        <Link
          to={`/item/${id}`}
          title="View more"
          className="px-4 py-2 text-blue-500 text-2xl"
        >
          <MdOutlineGridView />
        </Link>
        {data.userRole === "Admin" ? (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to archive this item?")) {
                onMutate(id!);
                window.location.reload();
              } else {
                return;
              }
            }}
            title="Delete item"
            className="text-red-600 text-lg cursor-pointer"
          >
            <FaTrash />
          </button>
        ) : ""}

      </td>
    </>
  );
}
