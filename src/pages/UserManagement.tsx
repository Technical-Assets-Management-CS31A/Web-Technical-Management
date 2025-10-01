import { useEffect, useMemo, useState } from "react";
import { AddUsers } from "../components/AddUser";
import Button from "../components/Button";
import EditUser from "../components/EditUser";
import SearchBar from "../components/SearchBar";
import type { TUsers } from "../types/types";
import { useQuery } from "@tanstack/react-query";
import { SelectUserStatus } from "../components/SelectUserStatus";
import { useAllStaffsQuery } from "../query/get/useAllStaffsQuery";
import { StaffSkeletonLoader } from "../loader/StaffSkeletonLoader";
import { useDeleteUserMutation } from "../query/delete/useDeleteUserMutation";
import UserTable from "../components/UserTable";
import ErrorTable from "../components/ErrorTables";

export const UserManagement = () => {
  const [isAddUserOpen, setIsAddUserOpen] = useState<boolean>(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState<boolean>(false);
  const [searchUser, setSearchUser] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [editUserId, setEditUserId] = useState<string | undefined>(undefined);
  const [users, setUsers] = useState<TUsers[]>([
    {
      Id: "6EEAC6D",
      firstName: "Alice",
      lastName: "Johnson",
      middleName: "",
      username: "",
      email: "",
      phoneNumber: "",
      userRole: "Staff",
      status: "Active",
    },
    {
      Id: "6EEACFD",
      firstName: "Alice",
      lastName: "Johnson",
      middleName: "",
      username: "",
      email: "",
      phoneNumber: "",
      userRole: "Staff",
      status: "Active",
    },
    {
      Id: "6EECF6D",
      firstName: "Alice",
      lastName: "Johnson",
      middleName: "",
      username: "",
      email: "",
      phoneNumber: "",
      userRole: "Staff",
      status: "Active",
    },
    {
      Id: "6EACF6D",
      firstName: "Alice",
      lastName: "Johnson",
      middleName: "",
      username: "",
      email: "",
      phoneNumber: "",
      userRole: "Staff",
      status: "InActive",
    },
    {
      Id: "6EEACF2D",
      firstName: "Alice",
      lastName: "Johnson",
      middleName: "",
      username: "",
      email: "",
      phoneNumber: "",
      userRole: "Staff",
      status: "InActive",
    },
  ]);

  const filteredUser = useMemo(
    () =>
      users.filter((user) => {
        const userStatus = user.status.toLowerCase();
        const searchValue = searchUser.toLowerCase();
        const selected = selectedStatus.toLowerCase();

        const matchesStatus =
          selected === "all" ? true : userStatus === selected;

        if (selected !== "all") {
          return (
            matchesStatus &&
            (user.firstName.toLowerCase().includes(searchValue) ||
              user.lastName.toLowerCase().includes(searchValue) ||
              user.userRole.toLowerCase().includes(searchValue) ||
              userStatus.includes(searchValue))
          );
        }

        return (
          user.firstName.toLowerCase().includes(searchValue) ||
          user.lastName.toLowerCase().includes(searchValue) ||
          user.userRole.toLowerCase().includes(searchValue) ||
          userStatus.includes(searchValue)
        );
      }),
    [searchUser, selectedStatus, users]
  );

  const { data, isPending, isError } = useQuery(useAllStaffsQuery());
  const { mutate } = useDeleteUserMutation();

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setUsers(data);
    }
  }, [data]);

  if (isPending) {
    return <StaffSkeletonLoader />;
  }

  return (
    <div className="animate-fadeIn min-h-screen w-full bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#c7d2fe] flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-[90%] bg-white/90 shadow-2xl rounded-3xl p-8 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#1e293b] mb-2 tracking-tight drop-shadow">
              User Management
            </h1>
            <span className="text-lg text-[#64748b] font-medium">
              Manage your staff members efficiently. Search and update staff
              records.
            </span>
          </div>
        </div>
        <section className="flex flex-row justify-between">
          <div>
            <Button onClick={() => setIsAddUserOpen(true)} />
          </div>
          <div className="flex flex-row">
            {/* Select Component */}
            <SelectUserStatus onChangeStatus={setSelectedStatus} />
            {/* Search Bar Component */}
            <SearchBar
              onChangeValue={(value) => setSearchUser(value)}
              name={"Search Staff"}
              placeholder={"Search your Staff"}
            />
          </div>
        </section>

        {/* User Table */}
        <div className="h-[60vh] overflow-x-auto rounded-2xl shadow-lg bg-white/95">
          {isError ? (
            <ErrorTable />
          ) : (
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
                    Role
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
                {filteredUser.map((user) => (
                  <tr
                    key={user.Id}
                    className="hover:bg-[#f1f5f9] transition-colors odd:bg-white even:bg-[#f8fafc]"
                  >
                    {/* User Table Component*/}
                    <UserTable
                      Id={user.Id}
                      firstName={user.firstName}
                      lastName={user.lastName}
                      userRole={user.userRole}
                      status={user.status}
                      onSetEditUserId={() => setEditUserId(user.Id)}
                      onSetIsEditUserOpen={() => setIsEditUserOpen(true)}
                      onMutate={() => mutate(user.Id)}
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Description */}
        <p className="mt-6 text-[#64748b] text-sm text-center">
          <span className="font-semibold">Description:</span> Each row
          represents a staff member. <em>Role</em> shows their assigned role.{" "}
          <em>Status</em> indicates whether the staff is active or inactive.
        </p>
      </div>
      {isAddUserOpen && <AddUsers onClose={() => setIsAddUserOpen(false)} />}
      {isEditUserOpen && (
        <EditUser onClose={() => setIsEditUserOpen(false)} Id={editUserId} />
      )}
    </div>
  );
};
