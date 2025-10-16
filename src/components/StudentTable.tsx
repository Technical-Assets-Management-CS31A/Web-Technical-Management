import { MdOutlineGridView } from "react-icons/md";
import { IoArchive } from "react-icons/io5";
import type { FC } from "react";
import { useAllStudentsQuery } from "../query/get/useAllStudentsQuery";
import { useQuery } from "@tanstack/react-query";

type StudentTableProps = {
    id: string;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    StudentIdNumber: string;
    Course: string;
    Section: string;
    Year: string;
    ProfilePicture?: string;
    onSetEditStudentId: (value: string) => void;
    onSetIsEditStudentOpen: (value: boolean) => void;
    onMutate: (value: string) => void;
};

export default function StudentTable({
    id,
    FirstName,
    MiddleName,
    LastName,
    StudentIdNumber,
    Course,
    Section,
    Year,
    onSetEditStudentId,
    onSetIsEditStudentOpen,
    onMutate,
}: StudentTableProps) {
    const { data } = useQuery(useAllStudentsQuery());

    const handleArchiveStudent = () => {
        if (window.confirm(`Are you sure you want to archive this Student ${StudentIdNumber}?`)) {
            onMutate(id);
        }
    };

    const handleEditStudent = (id: string) => {
        onSetEditStudentId(id);
        onSetIsEditStudentOpen(true);
    };

    type ShowButtonIfUserAdminProps = {
        userRole?: string;
        onHandleArchiveStudent: () => void;
    };

    const ShowButtonIfUserAdmin: FC<ShowButtonIfUserAdminProps> = ({
        userRole,
        onHandleArchiveStudent,
    }) => {
        if (userRole !== "Admin") return null;
        return (
            <button
                onClick={onHandleArchiveStudent}
                title="Archive student"
                className="text-orange-600 text-2xl cursor-pointer hover:text-orange-700 transition-colors"
            >
                <IoArchive />
            </button>
        );
    };

    const getFullName = () => {
        const middleInitial = MiddleName ? `${MiddleName.charAt(0)}.` : "";
        return `${FirstName} ${middleInitial} ${LastName}`.replace(/\s+/g, " ").trim();
    };

    return (
        <>
            <td className="py-3 px-6">{StudentIdNumber}</td>
            <td className="py-3 px-6">{getFullName()}</td>
            <td className="py-3 px-6">{Course}</td>
            <td className="py-3 px-6">{Section}</td>
            <td className="py-3 px-6">{Year}</td>
            <td className="py-3 px-6 flex flex-row">
                <button
                    className="mr-2 text-blue-500 text-2xl hover:text-blue-700 transition-colors"
                    onClick={() => handleEditStudent(id)}
                    title="Edit student"
                >
                    <MdOutlineGridView />
                </button>
                <ShowButtonIfUserAdmin
                    userRole={data.userRole}
                    onHandleArchiveStudent={handleArchiveStudent}
                />
            </td>
        </>
    );
}
