import { useState, useMemo, useEffect } from "react";
import { AddTeacher } from "./AddTeacher";
import { AddStudent } from "./AddStudent";
import EditUser from "./EditUser";
import SearchBar from "./SearchBar";
import type { TStudent, TTeacher } from "../types/types";
import { useQuery } from "@tanstack/react-query";
// import { useAllUsersQuery } from "../query/get/useAllUsersQuery";
import { useAllStudentsQuery } from "../query/get/useAllStudentsQuery";
import { useArchiveStudentMutation } from "../query/delete/useArchiveStudentMutation";
import { useArchiveTeacherMutation } from "../query/delete/useArchiveTeacherMutation";
import UserTable from "./UserTable";
import StudentTable from "./StudentTable";
import { FaChalkboardTeacher, FaGraduationCap } from "react-icons/fa";
import Button from "./Button";
import { useAllTeachersQuery } from "../query/get/useAllTeachersQuery";

export const RegistrationModule = () => {
    const [isAddTeacherOpen, setIsAddTeacherOpen] = useState<boolean>(false);
    const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
    const [isEditStudentOpen, setIsEditStudentOpen] = useState<boolean>(false);
    const [isEditTeacherOpen, setIsEditTeacherOpen] = useState<boolean>(false);
    const [searchUser, setSearchUser] = useState<string>("");
    const [selectedRole, setSelectedRole] = useState<string>("Teacher");
    const [editStudentId, setEditStudentId] = useState<string>("");
    const [editTeacherId, setEditTeacherId] = useState<string>("");
    const [students, setStudents] = useState<TStudent[]>([]);
    const [teachers, setTeachers] = useState<TTeacher[]>([]);


    const selectedStudent = useMemo(() => {
        return students.find((s) => s.id === editStudentId);
    }, [students, editStudentId]);

    const selectedTeacher = useMemo(() => {
        return teachers.find((t) => t.id === editTeacherId);
    }, [teachers, editTeacherId]);

    const { data: studentsData } = useQuery(useAllStudentsQuery());
    const { data: teachersData } = useQuery(useAllTeachersQuery());
    const { mutate: archiveStudent } = useArchiveStudentMutation();
    const { mutate: archiveTeacher } = useArchiveTeacherMutation();



    useEffect(() => {
        if (studentsData && Array.isArray(studentsData)) {
            setStudents(studentsData);
        }
    }, [studentsData]);

    useEffect(() => {
        if (teachersData && Array.isArray(teachersData)) {
            setTeachers(teachersData);
        }
    }, [teachersData]);

    const filteredStudents = useMemo(() => {
        let filtered = students;

        // Filter by search term
        if (searchUser) {
            filtered = filtered.filter(
                (student) =>
                    student.FirstName.toLowerCase().includes(searchUser.toLowerCase()) ||
                    student.LastName.toLowerCase().includes(searchUser.toLowerCase()) ||
                    student.StudentIdNumber.toLowerCase().includes(searchUser.toLowerCase()) ||
                    student.Course.toLowerCase().includes(searchUser.toLowerCase()) ||
                    student.Section.toLowerCase().includes(searchUser.toLowerCase())
            );
        }

        return filtered;
    }, [students, searchUser]);

    const filteredTeachers = useMemo(() => {
        let filtered = teachers;

        // Filter by search term
        if (searchUser) {
            filtered = filtered.filter(
                (teacher) =>
                    teacher.firstName.toLowerCase().includes(searchUser.toLowerCase()) ||
                    teacher.lastName.toLowerCase().includes(searchUser.toLowerCase()) ||
                    teacher.username.toLowerCase().includes(searchUser.toLowerCase()) ||
                    teacher.email.toLowerCase().includes(searchUser.toLowerCase()) ||
                    teacher.department.toLowerCase().includes(searchUser.toLowerCase()) ||
                    teacher.subject.toLowerCase().includes(searchUser.toLowerCase())
            );
        }

        return filtered;
    }, [teachers, searchUser]);

    const handleAddTeacher = () => {
        setIsAddTeacherOpen(true);
    };

    const handleAddStudent = () => {
        setIsAddStudentOpen(true);
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] p-6">
            <div className="w-full max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-[#1e293b] mb-2">
                        Registration Module
                    </h1>
                    <p className="text-[#64748b] text-lg">
                        Manage teachers and students registration
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <Button
                        onClick={handleAddTeacher}
                        name="New Teacher"
                    />
                    <Button
                        onClick={handleAddStudent}
                        name="New Student"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        {/* Role Filter Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <span className="text-[#64748b] font-semibold mr-2">Filter by Role:</span>
                            <button
                                onClick={() => setSelectedRole("Teacher")}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 ${selectedRole === "Teacher"
                                    ? "bg-[#059669] text-white shadow-md"
                                    : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                                    }`}
                            >
                                Teachers
                            </button>
                            <button
                                onClick={() => setSelectedRole("Student")}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-150 ${selectedRole === "Student"
                                    ? "bg-[#7c3aed] text-white shadow-md"
                                    : "bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]"
                                    }`}
                            >
                                Students
                            </button>
                        </div>

                        {/* Search */}
                        <div className="flex flex-col sm:flex-row gap-4 ml-auto">
                            <SearchBar
                                onChangeValue={setSearchUser}
                                placeholder="Search by name"
                            />
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-[#059669]/10 rounded-lg">
                                <FaChalkboardTeacher className="text-2xl text-[#059669]" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-[#64748b]">Teachers</p>
                                <p className="text-2xl font-bold text-[#1e293b]">{teachers.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-4">
                        <div className="flex items-center">
                            <div className="p-2 bg-[#7c3aed]/10 rounded-lg">
                                <FaGraduationCap className="text-2xl text-[#7c3aed]" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-[#64748b]">Students</p>
                                <p className="text-2xl font-bold text-[#1e293b]">{students.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users/Students Table */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-[#e2e8f0]">
                        <h2 className="text-2xl font-bold text-[#1e293b]">
                            {selectedRole === "Student" ? "Students" : "Teachers"}
                            <span className="text-[#64748b] font-normal ml-2">
                                ({selectedRole === "Student" ? filteredStudents.length : filteredTeachers.length} {selectedRole === "Student" ? (filteredStudents.length === 1 ? "student" : "students") : (filteredTeachers.length === 1 ? "teacher" : "teachers")})
                            </span>
                        </h2>
                    </div>

                    {selectedRole === "Student" ? (
                        filteredStudents.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-6xl text-[#cbd5e1] mb-4">
                                    <div className="flex items-center justify-center"><FaGraduationCap className="text-center" /></div>
                                </div>
                                <h3 className="text-xl font-semibold text-[#64748b] mb-2">
                                    No students found
                                </h3>
                                <p className="text-[#94a3b8]">
                                    {searchUser
                                        ? "Try adjusting your search criteria"
                                        : "No students match the current filters"}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#f8fafc]">
                                        <tr>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Student ID
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Full Name
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Course
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Section
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Year
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="hover:bg-[#f1f5f9] transition-colors odd:bg-white even:bg-[#f8fafc]"
                                            >
                                                <StudentTable
                                                    id={student.id}
                                                    FirstName={student.FirstName}
                                                    MiddleName={student.MiddleName}
                                                    LastName={student.LastName}
                                                    StudentIdNumber={student.StudentIdNumber}
                                                    Course={student.Course}
                                                    Section={student.Section}
                                                    Year={student.Year}
                                                    ProfilePicture={student.ProfilePicture}
                                                    onSetEditStudentId={() => setEditStudentId(student.id)}
                                                    onSetIsEditStudentOpen={() => setIsEditStudentOpen(true)}
                                                    onMutate={() => archiveStudent(student.id)}
                                                />
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    ) : (
                        filteredTeachers.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="text-6xl text-[#cbd5e1] mb-4">
                                    <div className="flex items-center justify-center"><FaChalkboardTeacher className="text-center" /></div>
                                </div>
                                <h3 className="text-xl font-semibold text-[#64748b] mb-2">
                                    No teachers found
                                </h3>
                                <p className="text-[#94a3b8]">
                                    {searchUser
                                        ? "Try adjusting your search criteria"
                                        : "No teachers match the current filters"}
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-[#f8fafc]">
                                        <tr>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                ID
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                First Name
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Last Name
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Username
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="py-4 px-6 text-left text-sm font-semibold text-[#64748b] uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTeachers.map((teacher) => (
                                            <tr
                                                key={teacher.id}
                                                className="hover:bg-[#f1f5f9] transition-colors odd:bg-white even:bg-[#f8fafc]"
                                            >
                                                <UserTable
                                                    id={teacher.id}
                                                    firstName={teacher.firstName}
                                                    lastName={teacher.lastName}
                                                    username={teacher.username}
                                                    email={teacher.email}
                                                    userRole="Teacher"
                                                    status="Active"
                                                    onSetEditUserId={() => setEditTeacherId(teacher.id)}
                                                    onSetIsEditUserOpen={() => setIsEditTeacherOpen(true)}
                                                    onMutate={() => archiveTeacher(teacher.id)}
                                                />
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>

                {/* Description */}
                <p className="mt-6 text-[#64748b] text-sm text-center">
                    <span className="font-semibold">Tip:</span> Use filters and search to quickly locate users by role.
                </p>
            </div>

            {/* Modals */}
            {isAddTeacherOpen && (
                <AddTeacher
                    onClose={() => setIsAddTeacherOpen(false)}
                />
            )}
            {isAddStudentOpen && (
                <AddStudent
                    onClose={() => setIsAddStudentOpen(false)}
                />
            )}
            {isEditStudentOpen && selectedStudent && (
                <EditUser
                    onClose={() => setIsEditStudentOpen(false)}
                    Id={editStudentId}
                    firstName={selectedStudent.FirstName}
                    lastName={selectedStudent.LastName}
                    middleName={selectedStudent.MiddleName}
                    position="Student"
                />
            )}
            {isEditTeacherOpen && selectedTeacher && (
                <EditUser
                    onClose={() => setIsEditTeacherOpen(false)}
                    Id={editTeacherId}
                    firstName={selectedTeacher.firstName}
                    lastName={selectedTeacher.lastName}
                    middleName={selectedTeacher.middleName}
                    position="Teacher"
                />
            )}
        </div>
    );
};