import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa6";
import logo from "../assets/img/aclcLogo.webp";

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
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            Condition === "New"
              ? "bg-green-100 text-green-700"
              : Condition === "Used"
                ? "bg-yellow-100 text-yellow-700"
                : Condition === "Refurbished"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-200 text-gray-600"
          }`}
        >
          {Condition}
        </span>
      </td>
      <td className="py-3 px-4">
        {new Date(createdAt).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="py-3 pr-6 flex flex-row gap-4">
        <Link
          to={`/item/${id}`}
          className="px-4 py-2 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white rounded-xl font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150"
        >
          View
        </Link>
        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this item?")) {
              onMutate(SerialNumber);
              console.log("Delete item:", SerialNumber);
            }
          }}
          className="px-4 py-2 bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white rounded-xl font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150"
        >
          <FaTrash />
        </button>
      </td>
    </>
  );
}
