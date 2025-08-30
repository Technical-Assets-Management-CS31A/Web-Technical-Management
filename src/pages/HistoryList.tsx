import { FaSearch } from "react-icons/fa";
import "../../public/css/history.css"
import { useState } from "react";

function formatDate(d: string | Date) {
  try {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(d);
  }
}


function toStatusSlug(status: string) {
  const s = String(status || "").toLowerCase();
  if (s.includes("return")) return "returned";
  if (s.includes("overdue")) return "overdue";
  if (s.includes("lost")) return "lost";
  if (s.includes("borrow")) return "borrowed";
  return "default";
}


const demoRows = [
  { id: 1, name: "HDMI", borrowedId: "BRW-0001", teacher: "John Doe", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-18T09:30:00", condition: "Good", status: "Returned" },
  { id: 2, name: "HDMI", borrowedId: "BRW-0001", teacher: "John Doe", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-18T09:30:00", condition: "Good", status: "Returned" },
  { id: 3, name: "HDMI", borrowedId: "BRW-0001", teacher: "John Doe", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-18T09:30:00", condition: "Good", status: "Returned" },
  { id: 4, name: "HDMI", borrowedId: "BRW-0001", teacher: "John Doe", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-18T09:30:00", condition: "Good", status: "Returned" },
  { id: 5, name: "HDMI", borrowedId: "BRW-0001", teacher: "John Doe", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-18T09:30:00", condition: "Good", status: "Returned" },
  { id: 6, name: "HDMI", borrowedId: "BRW-0001", teacher: "John Doe", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-18T09:30:00", condition: "Good", status: "Returned" },
  { id: 7, name: "HDMI", borrowedId: "BRW-0002", teacher: "Jane Smith", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-19T14:10:00", condition: "Minor scratches", status: "Borrowed" },
  { id: 8, name: "HDMI", borrowedId: "BRW-0003", teacher: "Emily Johnson", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-20T16:45:00", condition: "Like new", status: "Overdue" },
  { id: 9, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 10, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 11, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 12, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 13, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 14, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 15, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 16, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
  { id: 17, name: "HDMI", borrowedId: "BRW-0004", teacher: "Michael Brown", room: "Slab2", occupied_by: "Cortes", eventDate: "2025-08-21T10:00:00", condition: "Damaged port", status: "Lost" },
];



export default function HistoryList({
  title = "Borrowing History",
  description = "This table lists item borrowing events, including the condition reported and the current status.",
}) {

  const [searchItem, setSearchItem] = useState<string>("");

  const filteredItems = demoRows.filter(item => item.teacher.toLowerCase().includes(searchItem.toLowerCase()));

  return (
    <div className="history-wrap">
      <div id="history-caption" className="table-caption">
        <strong>{title}</strong>
        <span className="caption-desc">{description}</span>
      </div>
      <div className="history-search-container">
        <FaSearch className="search-icon" />
        <input type="search" name="searchItem" onChange={(e) => setSearchItem(e.target.value)} placeholder="Search by Teacher..." />
      </div>
      <figure className="table-card" role="group" aria-labelledby="history-caption">
        <div className="table-scroll">
          <table className="history-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Item Name</th>
                <th scope="col">Borrowed ID</th>
                <th scope="col">Teacher</th>
                <th scope="col">Room</th>
                <th scope="col">Occupied By</th>
                <th scope="col">Condition</th>
                <th scope="col">Event Date</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((r) => (
                <tr key={r.id}>
                  <td data-label="ID">{r.id}</td>
                  <td data-label="Name">{r.name}</td>
                  <td data-label="Borrowed ID">{r.borrowedId}</td>
                  <td data-label="Teacher">{r.teacher}</td>
                  <td data-label="Room">{r.room}</td>
                  <td data-label="Occupied By">{r.occupied_by}</td>
                  <td data-label="Condition">{r.condition}</td>
                  <td data-label="Event Date">{formatDate(r.eventDate)}</td>
                  <td data-label="Status">
                    <span className={`badge badge--${toStatusSlug(r.status)}`}>{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-description">
          Description: Each row represents one history event. <em>Event Date</em> shows when it occurred. <em>Condition</em> is the item state reported at that time. <em>Status</em> reflects the latest known state for that borrow record.
        </p>
      </figure>
    </div>
  );
}
