import { useQuery } from "@tanstack/react-query";
import type { UserDto } from "../@types/types";
import { useMemo, useState } from "react";
import { useAllUsers } from "../hooks/userHooks";
import { formatRole, fullName } from "../lib/utils";

const EMPTY_USERS: UserDto[] = [];

// Accounts are a short list (staff plus instructors), so they are loaded whole and filtered here.
export const useAllUsersManagement = (includeDeleted = false) => {
    const { data, isPending, isError } = useQuery(useAllUsers(includeDeleted));
    const users = Array.isArray(data) ? data : EMPTY_USERS;

    return { users, isPending, isError }
}

export const useFilteredUser = (users: UserDto[], showDeleted = false) => {
    const [searchUser, setSearchUser] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [selectedRole, setSelectedRole] = useState<string>("all");

    const filteredUser = useMemo(() => {
        const searchValue = searchUser.trim().toLowerCase();
        return users.filter((user) => {
            const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
            const matchesRole = selectedRole === "all" || user.role === selectedRole;
            const matchesSearch =
                !searchValue ||
                fullName(user).toLowerCase().includes(searchValue) ||
                user.email.toLowerCase().includes(searchValue) ||
                user.employeeNo.toLowerCase().includes(searchValue) ||
                formatRole(user.role).toLowerCase().includes(searchValue);
            return matchesStatus && matchesRole && matchesSearch && (showDeleted || !user.deletedAt);
        });
    }, [searchUser, selectedStatus, selectedRole, users, showDeleted]);

    return { filteredUser, setSearchUser, selectedStatus, setSelectedStatus, selectedRole, setSelectedRole }
}
