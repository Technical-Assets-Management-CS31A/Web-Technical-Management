import { SlugStatus } from "./SlugStatus";
import type { TRecentBorrowedItemsTableProps } from "../types/types";
export default function RecentBorrowedItemsTable({
  id,
  datetime,
  teacher,
  room,
  item,
  occupied,
  status,
}: TRecentBorrowedItemsTableProps) {
  return (
    <>
      <td hidden>{id}</td>
      <td className="py-3 px-6">{datetime}</td>
      <td className="py-3 px-6">
        {teacher.charAt(0).toUpperCase() + teacher.slice(1)}
      </td>
      <td className="py-3 px-6">
        {room.charAt(0).toUpperCase() + room.slice(1)}
      </td>
      <td className="py-3 px-6">
        {item.charAt(0).toUpperCase() + item.slice(1)}
      </td>
      <td className="py-3 px-6">
        {occupied.charAt(0).toUpperCase() + occupied.slice(1)}
      </td>
      <td className="py-3 px-6">
        {SlugStatus(status.charAt(0).toUpperCase() + status.slice(1))}
      </td>
    </>
  );
}
