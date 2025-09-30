import type { THistoryBorrwedItems } from "../types/types";

const slugStatus = (stat: string) => {
  if (stat === "returned") return "bg-green-100 text-green-700";
  if (stat === "borrowed") return "bg-blue-100 text-blue-700";
  if (stat === "overdue") return "bg-yellow-100 text-yellow-700";
  if (stat === "lost") return "bg-red-100 text-red-700";

  return stat;
};

const dateTImeFormated = (datetime: string) => {
  if (!datetime) return;
  return new Date(datetime).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

type HistoryTableProps = {
  id: number;
  ItemName: string;
  Borrowed_id: string;
  Teacher: string;
  Room: string;
  Occupied: string;
  Condition: string;
  Event_Date: string;
  Status: string;
  filteredItems: THistoryBorrwedItems[];
};

export default function HistoryTable({
  id,
  ItemName,
  Borrowed_id,
  Teacher,
  Room,
  Occupied,
  Condition,
  Event_Date,
  Status,
  filteredItems,
}: HistoryTableProps) {
  return (
    <>
      {filteredItems.map((r) => (
        <tr
          key={r.id}
          className="hover:bg-[#f1f5f9] transition-colors  odd:bg-white even:bg-[#f8fafc]"
        >
          <td className="py-3 px-6">{id}</td>
          <td className="py-3 px-6">{ItemName}</td>
          <td className="py-3 px-6">{Borrowed_id}</td>
          <td className="py-3 px-6">{Teacher}</td>
          <td className="py-3 px-6">{Room}</td>
          <td className="py-3 px-6">{Occupied}</td>
          <td className="py-3 px-6">{Condition}</td>
          <td className="py-3 px-6">{dateTImeFormated(Event_Date)}</td>
          <td className="py-3 px-6">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${slugStatus(
                Status
              )}`}
            >
              {Status}
            </span>
          </td>
        </tr>
      ))}
    </>
  );
}
