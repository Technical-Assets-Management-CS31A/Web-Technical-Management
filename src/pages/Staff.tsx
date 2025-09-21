import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { AddStaff } from "../components/AddStaff";
import Button from "../components/Button";
import EditStaff from "../components/EditStaff";
import { FaTrash } from "react-icons/fa6";
import SearchBar from "../components/SearchBar";
import type { TStaffs } from "../types/types";
import { useQuery } from "@tanstack/react-query";
import { SelectStaffStatus } from "../components/SelectStaffStatus";
import { useAllStaffsQuery } from "../query/get/useAllStaffsQuery";
import { StaffSkeletonLoader } from "../loader/StaffSkeletonLoader";
export const Staff = () => {
  const [isAddStaffOpen, setIsAddStaffOpen] = useState<boolean>(false);
  const [isEditStaffOpen, setIsEditStaffOpen] = useState<boolean>(false);
  const [searchStaff, setSearchStaff] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editStaffId, setEditStaffId] = useState<number | null>(null);
  const [staffs, setStaffs] = useState<TStaffs[]>([
    {
      id: 1,
      firstName: "Alice",
      lastName: "Johnson",
      position: "Intern",
      status: "Active",
    },
    {
      id: 2,
      firstName: "Bob",
      lastName: "Smith",
      position: "Intern",
      status: "Inactive",
    },
    {
      id: 3,
      firstName: "Charlie",
      lastName: "Brown",
      position: "Intern",
      status: "Active",
    },
    {
      id: 4,
      firstName: "Diana",
      lastName: "Lopez",
      position: "Intern",
      status: "Active",
    },
    {
      id: 5,
      firstName: "Edward",
      lastName: "Williams",
      position: "Intern",
      status: "Inactive",
    },
  ]);

  const { data, isPending, error } = useQuery(useAllStaffsQuery());

  // useEffect(() => {
  //   if (data && Array.isArray(data)) {
  //     setStaffs(data);
  //   }
  // }, [data])

  // if (error || !data) {
  //   return (
  //     <div className="w-full h-full flex justify-center items-center">
  //       <span className="text-lg text-red-500 font-semibold">Failed to load staff details.</span>
  //     </div>
  //   );
  // }

  if (isPending) {
    return <StaffSkeletonLoader />;
  }


  const filteredStaff = staffs.filter((staff) => {
    const staffStatus = staff.status.toLowerCase();
    const searchValue = searchStaff.toLowerCase();
    const selected = selectedStatus.toLowerCase();

    const matchesStatus =
      selected === "all" ? true : staffStatus === selected;

    if (selected !== "all") {
      return (
        matchesStatus &&
        (
          staff.firstName.toLowerCase().includes(searchValue) ||
          staff.lastName.toLowerCase().includes(searchValue) ||
          staff.position.toLowerCase().includes(searchValue) ||
          staffStatus.includes(searchValue)
        )
      );
    }

    return (
      staff.firstName.toLowerCase().includes(searchValue) ||
      staff.lastName.toLowerCase().includes(searchValue) ||
      staff.position.toLowerCase().includes(searchValue) ||
      staffStatus.includes(searchValue)
    );
  });

  return (
    // Main Container
    <div className="animate-fadeIn min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-[90%] bg-white/90 shadow-2xl rounded-3xl p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1e293b] mb-2 tracking-tight drop-shadow">
              Staff Management
            </h1>
            <span className="text-lg text-[#64748b] font-medium">
              Manage your staff members efficiently. Search and update staff
              records.
            </span>
          </div>

        </div>
        <section className="flex flex-row justify-between">
          <div>
            <Button onClick={() => setIsAddStaffOpen(true)} />
          </div>
          <div className="flex flex-row">
            {/* Select Component */}
            <SelectStaffStatus onChangeStatus={setSelectedStatus} />
            {/* Search Bar Component */}
            <SearchBar
              onChangeValue={(value) => setSearchStaff(value)}
              name={"Search Staff"}
              placeholder={"Search your Staff"}
            />
          </div>
        </section>

        {/* Staff Table */}
        <div className="h-[60vh] overflow-x-auto rounded-2xl shadow-lg bg-white/95">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  ID
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Firstname
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Lastname
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Position
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Status
                </th>
                <th className="bg-[#f8fafc] sticky top-0 font-semibold py-4 px-6 border-b border-[#e6e6e6] text-[#2563eb]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr
                  key={staff.id}
                  className="hover:bg-[#f1f5f9] transition-colors odd:bg-white even:bg-[#f8fafc]"
                >
                  <td className="py-3 px-6">{staff.id}</td>
                  <td className="py-3 px-6">{staff.firstName}</td>
                  <td className="py-3 px-6">{staff.lastName}</td>
                  <td className="py-3 px-6">{staff.position}</td>
                  <td className="py-3 px-6">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${staff.status.toLowerCase() === "active"
                        ? "bg-green-100 text-green-700"
                        : staff.status.toLowerCase() === "inactive"
                          ? "bg-orange-100 text-gray-700"
                          : "bg-gray-400 text-gray-700"
                        }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 flex flex-row gap-4">
                    <button
                      className="px-4 py-2 cursor-pointer bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white rounded-lg font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150"
                      onClick={() => {
                        setEditStaffId(staff.id);
                        setIsEditStaffOpen(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button className="px-4 py-2 cursor-pointer bg-gradient-to-r from-[#ffce72] to-[orange] text-white rounded-lg font-semibold shadow hover:scale-105 hover:shadow-lg transition-all duration-150">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Description */}
        <p className="mt-6 text-[#64748b] text-sm text-center">
          <span className="font-semibold">Description:</span> Each row
          represents a staff member. <em>Role</em> shows their assigned role.{" "}
          <em>Status</em> indicates whether the staff is active or inactive.
        </p>
      </div>
      {isAddStaffOpen && <AddStaff onClose={() => setIsAddStaffOpen(false)} />}
      {isEditStaffOpen && (
        <EditStaff onClose={() => setIsEditStaffOpen(false)} id={editStaffId} />
      )}
    </div>
  );
}
