import { MdEmail, MdPhone, MdLocationOn, MdSchool, MdPerson, MdBadge } from "react-icons/md";
import { IoIdCard } from "react-icons/io5";
import type { FC } from "react";
import type { TStudent } from "../types/types";
import { FaPlus } from "react-icons/fa6";

type ViewStudentCredentialsProps = {
    student: TStudent;
    isOpen: boolean;
    onClose: () => void;
};

const ViewStudentCredentials: FC<ViewStudentCredentialsProps> = ({
    student,
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null;

    const getFullName = () => {
        const middleInitial = student.middleName ? `${student.middleName.charAt(0)}.` : "";
        return `${student.firstName} ${middleInitial} ${student.lastName}`.replace(/\s+/g, " ").trim();
    };

    const getFullAddress = () => {
        return `${student.street}, ${student.cityMunicipality}, ${student.province} ${student.postalCode}`;
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="scrollbar-none bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-full">
                            <MdPerson className="text-green-600 text-2xl" />
                        </div>
                        <div>
                             <h2 className="text-2xl font-bold text-gray-900">Student Credentials</h2>
                            <p className="text-gray-600">Complete student information</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <FaPlus data-testid="closebutton" className="transform rotate-45 transition-all duration-200 text-2xl text-gray-400 cursor-pointer w-[32px] h-[32px] items-center justify-center rounded-full hover:text-white hover:bg-red-500 hover:rotate-180" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <MdPerson className="mr-2 text-blue-600" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <p className="text-gray-900 font-medium">{getFullName()}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <p className="text-gray-900">{student.username}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="flex items-center">
                                    <MdEmail className="text-gray-400 mr-2" />
                                    <p className="text-gray-900">{student.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="flex items-center">
                                    <MdPhone className="text-gray-400 mr-2" />
                                    <p className="text-gray-900">{student.phoneNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Information */}
                    <div className="bg-blue-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <MdSchool className="mr-2 text-blue-600" />
                            Student Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID Number</label>
                                <div className="flex items-center">
                                    <MdBadge className="text-gray-400 mr-2" />
                                    <p className="text-gray-900 font-mono">{student.studentIdNumber}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                                <p className="text-gray-900">{student.course}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <p className="text-gray-900">{student.section}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year Level</label>
                                <p className="text-gray-900">{student.year}</p>
                            </div>
                        </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <MdLocationOn className="mr-2 text-green-600" />
                            Address Information
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                                <p className="text-gray-900">{student.street}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City/Municipality</label>
                                    <p className="text-gray-900">{student.cityMunicipality}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                                    <p className="text-gray-900">{student.province}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                    <p className="text-gray-900">{student.postalCode}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Complete Address</label>
                                <p className="text-gray-900">{getFullAddress()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-purple-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <IoIdCard className="mr-2 text-purple-600" />
                            Account Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.userRole === 'Admin'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {student.userRole}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${student.status === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {student.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewStudentCredentials;
