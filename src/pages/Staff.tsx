import { useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import "../../public/css/staff.css";
import { AddStaff } from "../components/AddStaff";

const demoStaff = [
  { id: 1, firstname: "Alice", lastname: "Johnson", role: "Intern", status: "Active" },
  { id: 2, firstname: "Bob", lastname: "Smith", role: "Intern", status: "Inactive" },
  { id: 3, firstname: "Charlie", lastname: "Brown", role: "Intern", status: "Active" },
  { id: 4, firstname: "Diana", lastname: "Lopez", role: "Intern", status: "Active" },
  { id: 5, firstname: "Edward", lastname: "Williams", role: "Intern", status: "Inactive" },
];

function toStatusSlug(status: string) {
  const s = String(status || "").toLowerCase();
  if (s.includes("active")) return "active";
  if (s.includes("inactive")) return "inactive";
  return "default";
}

export default function Staff() {
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [searchStaff, setSearchStaff] = useState("");

  const filteredStaff = demoStaff.filter(
    (staff) =>
      staff.firstname.toLowerCase().includes(searchStaff.toLowerCase()) ||
      staff.lastname.toLowerCase().includes(searchStaff.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchStaff.toLowerCase())
  );

  return (
    <div className="staff-container">
      <div className="staff-wrap">
        <div id="staff-caption" className="staff-table-caption">
          <strong>Staff Management</strong>
          <span className="staff-caption-desc">
            Manage your staff members efficiently. Search and update staff records.
          </span>
        </div>

        <div className="staff-search-container">
          <FaSearch className="staff-search-icon" />
          <input
            type="search"
            name="searchStaff"
            placeholder="Search staff..."
            onChange={(e) => setSearchStaff(e.target.value)}
          />
        </div>

        <div className="add-staff-container">
          <button type="button" onClick={() => setIsAddStaffOpen((prev) => !prev)}>
            <FaPlus /> Add Staff
          </button>
        </div>

        <figure className="staff-table-card" role="group" aria-labelledby="staff-caption">
          <div className="staff-table-scroll">
            <table className="staff-table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Firstname</th>
                  <th scope="col">Lastname</th>
                  <th scope="col">Role</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td data-label="ID">{staff.id}</td>
                    <td data-label="Firstname">{staff.firstname}</td>
                    <td data-label="Lastname">{staff.lastname}</td>
                    <td data-label="Role">{staff.role}</td>
                    <td data-label="Status">
                      <span className={`badge staff-badge--${toStatusSlug(staff.status)}`}>
                        {staff.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="table-description">
            Description: Each row represents a staff member. <em>Role</em> shows their assigned role.{" "}
            <em>Status</em> indicates whether the staff is active or inactive.
          </p>
        </figure>
      </div>
      {isAddStaffOpen && <AddStaff />}
    </div>
  );
}
