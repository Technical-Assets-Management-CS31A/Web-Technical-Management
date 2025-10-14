import React, { useState } from 'react';
import type { TBorrowItemForm } from '../types/types';
import { SuccessAlert } from '../components/SuccessAlert';

const BorrowItemForm = () => {
    const [showAlert, setShowAlert] = useState<boolean>(false);
    const [itemIdError, setItemIdError] = useState<string>("");
    const [borrowerFirstNameError, setBorrowerFirstNameError] = useState<string>("");
    const [borrowerLastNameError, setBorrowerLastNameError] = useState<string>("");
    const [borrowerTeacherFirstNameError, setBorrowerTeacherFirstNameError] = useState<string>("");
    const [borrowerTeacherLastNameError, setBorrowerTeacherLastNameError] = useState<string>("");
    const [borrowerStudentIdNumberError, setBorrowerStudentIdNumberError] = useState<string>("");
    const [borrowerRoleError, setBorrowerRoleError] = useState<string>("");
    const [roomError, setRoomError] = useState<string>("");
    const [subjectTimeScheduleError, setSubjectTimeScheduleError] = useState<string>("");

    const [formData, setFormData] = useState<TBorrowItemForm>({
        itemId: "",
        itemName: "",
        borrowerFirstName: "",
        borrowerLastName: "",
        borrowerRole: "",
        teacherFirstName: "",
        teacherLastName: "",
        room: "",
        subjectTimeSchedule: "",
        remarks: "",
        studentIdNumber: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value === "" ? null : value,
        }));

        if (name === "itemId") setItemIdError("");
        if (name === "borrowerFirstName") setBorrowerFirstNameError("");
        if (name === "borrowerLastName") setBorrowerLastNameError("");
        if (name === "teacherFirstName") setBorrowerTeacherFirstNameError("")
        if (name === "teacherLastName") setBorrowerTeacherLastNameError("")
        if (name === "borrowerRole") setBorrowerRoleError("");
        if (name === "studentIdNumber") setBorrowerStudentIdNumberError("");
        if (name === "room") setRoomError("");
        if (name === "subjectTimeSchedule") setSubjectTimeScheduleError("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let hasError = false;

        // Required field validations
        if (!formData.itemId) {
            setItemIdError("Item ID is required");
            hasError = true;
        }

        if (!formData.borrowerFirstName) {
            setBorrowerFirstNameError("First name is required");
            hasError = true;
        }

        if (!formData.borrowerLastName) {
            setBorrowerLastNameError("Last name is required");
            hasError = true;
        }

        if (!formData.borrowerRole) {
            setBorrowerRoleError("Borrower role is required");
            hasError = true;
        }

        if (!formData.teacherFirstName) {
            setBorrowerTeacherFirstNameError("Teacher first name is required");
            hasError = true;
        }

        if (!formData.teacherLastName) {
            setBorrowerTeacherLastNameError("Teacher last name is required");
            hasError = true;
        }

        if (!formData.studentIdNumber) {
            setBorrowerStudentIdNumberError("Student ID is required");
            hasError = true;
        }

        if (!formData.room) {
            setRoomError("Room is required");
            hasError = true;
        }

        if (!formData.subjectTimeSchedule) {
            setSubjectTimeScheduleError("Subject/Time/Schedule is required");
            hasError = true;
        }

        if (hasError) return;

        console.log("Borrow request data:", formData);

        setShowAlert(true);
        setTimeout(() => {
            setShowAlert(false);
        }, 2000);
    };

    return (
        <>
            {showAlert && <SuccessAlert message={"Borrow Request Submitted Successfully"} />}
            <div className="bg-white border border-gray-200 p-8">
                <h2 className="text-2xl font-medium text-gray-900 mb-8">
                    Borrow Item
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Grid Container */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Item ID */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="itemId"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Item ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${itemIdError ? "border-red-500" : "border-gray-300"}`}
                                type="text"
                                id="itemId"
                                name="itemId"
                                placeholder="Enter item ID"
                                value={formData.itemId}
                                onChange={handleChange}
                                data-testid="itemId"
                            />
                            {itemIdError && (
                                <p className="text-red-500 text-sm mt-1">{itemIdError}</p>
                            )}
                        </div>
                      
                         {/* Borrower First Name */}
                        <div>
                            <label
                                htmlFor="borrowerFirstName"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Item Name<span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${borrowerFirstNameError ? "border-red-500" : "border-gray-300"}`}
                                type="text"
                                id="borrowerFirstName"
                                name="borrowerFirstName"
                                placeholder="Enter Item Name"
                                value={formData.itemName}
                                onChange={handleChange}
                                data-testid="borrowerFirstName"
                            />
                            {borrowerFirstNameError && (
                                <p className="text-red-500 text-sm mt-1">{borrowerFirstNameError}</p>
                            )}
                        </div>


                        {/* Borrower First Name */}
                        <div>
                            <label
                                htmlFor="borrowerFirstName"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Borrower First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${borrowerFirstNameError ? "border-red-500" : "border-gray-300"}`}
                                type="text"
                                id="borrowerFirstName"
                                name="borrowerFirstName"
                                placeholder="Enter borrower's first name"
                                value={formData.borrowerFirstName}
                                onChange={handleChange}
                                data-testid="borrowerFirstName"
                            />
                            {borrowerFirstNameError && (
                                <p className="text-red-500 text-sm mt-1">{borrowerFirstNameError}</p>
                            )}
                        </div>

                        {/* Borrower Last Name */}
                        <div>
                            <label
                                htmlFor="borrowerLastName"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Borrower Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${borrowerLastNameError ? "border-red-500" : "border-gray-300"}`}
                                type="text"
                                id="borrowerLastName"
                                name="borrowerLastName"
                                placeholder="Enter borrower's last name"
                                value={formData.borrowerLastName}
                                onChange={handleChange}
                                data-testid="borrowerLastName"
                            />
                            {borrowerLastNameError && (
                                <p className="text-red-500 text-sm mt-1">{borrowerLastNameError}</p>
                            )}
                        </div>

                        {/* Borrower Role */}
                        <div>
                            <label
                                htmlFor="borrowerRole"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Borrower Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${borrowerRoleError ? "border-red-500" : "border-gray-300"}`}
                                id="borrowerRole"
                                name="borrowerRole"
                                value={formData.borrowerRole}
                                onChange={handleChange}
                                data-testid="borrowerRole"
                            >
                                <option value="">Select Role</option>
                                <option value="Student">Student</option>
                                <option value="Teacher">Teacher</option>
                            </select>
                            {borrowerRoleError && (
                                <p className="text-red-500 text-sm mt-1">{borrowerRoleError}</p>
                            )}
                        </div>

                        {/* Student ID Number */}
                        <div>
                            <label
                                htmlFor="studentIdNumber"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Student ID Number
                            </label>
                            <input
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${borrowerStudentIdNumberError ? "border-red-500" : "border-gray-300"}`}
                                type="text"
                                id="studentIdNumber"
                                name="studentIdNumber"
                                placeholder="Enter student ID number"
                                value={formData.studentIdNumber || ""}
                                onChange={handleChange}
                                data-testid="studentIdNumber"
                            />

                            {borrowerStudentIdNumberError && (
                                <p className="text-red-500 text-sm mt-1">{borrowerStudentIdNumberError}</p>
                            )}
                        </div>

                        {/* Teacher First Name */}
                        <div>
                            <label
                                htmlFor="teacherFirstName"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Teacher First Name
                            </label>
                            <input
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${borrowerTeacherFirstNameError ? "border-red-500" : "border-gray-300"}`}
                                type="text"
                                id="teacherFirstName"
                                name="teacherFirstName"
                                placeholder="Enter teacher's first name"
                                value={formData.teacherFirstName || ""}
                                onChange={handleChange}
                                data-testid="teacherFirstName"
                            />
                            {borrowerTeacherFirstNameError && (
                                <p className="text-red-500 text-sm mt-1">{borrowerTeacherFirstNameError}</p>
                            )}
                        </div>

                        {/* Teacher Last Name */}
                        <div>
                            <label
                                htmlFor="teacherLastName"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Teacher Last Name
                            </label>
                            <input
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${borrowerTeacherLastNameError ? "border-red-500" : "border-gray-300"}`}
                                type="text"
                                id="teacherLastName"
                                name="teacherLastName"
                                placeholder="Enter teacher's last name"
                                value={formData.teacherLastName || ""}
                                onChange={handleChange}
                                data-testid="teacherLastName"
                            />
                            {borrowerTeacherLastNameError && (
                                <p className="text-red-500 text-sm mt-1">{borrowerTeacherLastNameError}</p>
                            )}
                        </div>

                        {/* Room */}
                        <div>
                            <label
                                htmlFor="room"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Room <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${roomError ? "border-red-500" : "border-gray-300"}`}
                                type="text"
                                id="room"
                                name="room"
                                placeholder="Enter room number"
                                value={formData.room}
                                onChange={handleChange}
                                data-testid="room"
                            />
                            {roomError && (
                                <p className="text-red-500 text-sm mt-1">{roomError}</p>
                            )}
                        </div>

                        {/* Subject/Time/Schedule */}
                        <div>
                            <label
                                htmlFor="subjectTimeSchedule"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Subject/Time/Schedule <span className="text-red-500">*</span>
                            </label>
                            <input
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${subjectTimeScheduleError ? "border-red-500" : "border-gray-300"}`}
                                type="text"
                                id="subjectTimeSchedule"
                                name="subjectTimeSchedule"
                                placeholder="e.g., Math 101 - 9:00 AM - 10:00 AM"
                                value={formData.subjectTimeSchedule}
                                onChange={handleChange}
                                data-testid="subjectTimeSchedule"
                            />
                            {subjectTimeScheduleError && (
                                <p className="text-red-500 text-sm mt-1">{subjectTimeScheduleError}</p>
                            )}
                        </div>

                        {/* Remarks */}
                        <div className="md:col-span-2">
                            <label
                                htmlFor="remarks"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Remarks <span className="text-gray-400">(Optional)</span>
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                id="remarks"
                                name="remarks"
                                rows={3}
                                placeholder="Enter any additional remarks or notes"
                                value={formData.remarks || ""}
                                onChange={handleChange}
                                data-testid="remarks"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-4">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                            data-testid="submit-borrow-button"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default function BorrowItem() {
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 w-full">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Borrow Item
                    </h1>
                    <p className="text-gray-600">
                        Request to borrow technical equipment for your classroom or event needs.
                    </p>
                </div>
                <BorrowItemForm />
            </div>
        </div>
    );
}
