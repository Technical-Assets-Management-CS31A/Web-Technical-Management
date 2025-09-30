type RecentBorrowedItemsTableProps = {
  id: number;
  datetime: string;
  teacher: string;
  room: string;
  item: string;
  occupied: string;
  remarks: string;
};
export default function RecentBorrowedItemsTable({
  id,
  datetime,
  teacher,
  room,
  item,
  occupied,
  remarks,
}: RecentBorrowedItemsTableProps) {
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
        {remarks.charAt(0).toUpperCase() + remarks.slice(1)}
      </td>
    </>
  );
}
