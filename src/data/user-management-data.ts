import { useQuery } from "@tanstack/react-query";
import type { StudentDto, StudentStanding, UserDto } from "../@types/types";
import { useMemo, useState } from "react";
import { useAllStudents, useAllUsers } from "../hooks/userHooks";
import { formatRole, fullName } from "../lib/utils";

const EMPTY_USERS: UserDto[] = [];
const EMPTY_STUDENTS: StudentDto[] = [];

export const useAllUsersManagement = () => {
    const { data, isPending, isError } = useQuery(useAllUsers());
    const users = Array.isArray(data) ? data : EMPTY_USERS;

    return { users, isPending, isError }
}

export const useFilteredUser = (users: UserDto[]) => {
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
            return matchesStatus && matchesRole && matchesSearch && !user.deletedAt;
        });
    }, [searchUser, selectedStatus, selectedRole, users]);

    return { filteredUser, setSearchUser, selectedStatus, setSelectedStatus, selectedRole, setSelectedRole }
}

export const useStudentRoster = () => {
    const { data, isPending, isError } = useQuery(useAllStudents());
    const students = Array.isArray(data) ? data : EMPTY_STUDENTS;

    const [searchStudent, setSearchStudent] = useState<string>("");
    const [selectedStanding, setSelectedStanding] = useState<StudentStanding | "all">("all");

    const filteredStudents = useMemo(() => {
        const searchValue = searchStudent.trim().toLowerCase();
        return students.filter((student) => {
            const matchesStanding = selectedStanding === "all" || student.standing === selectedStanding;
            const matchesSearch =
                !searchValue ||
                fullName(student).toLowerCase().includes(searchValue) ||
                student.studentNo.toLowerCase().includes(searchValue) ||
                student.section?.code.toLowerCase().includes(searchValue);
            return matchesStanding && matchesSearch && !student.deletedAt;
        });
    }, [students, searchStudent, selectedStanding]);

    return { students, filteredStudents, isPending, isError, setSearchStudent, selectedStanding, setSelectedStanding }
}
