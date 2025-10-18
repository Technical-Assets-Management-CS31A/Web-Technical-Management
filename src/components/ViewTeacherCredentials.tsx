import { MdEmail, MdPhone, MdSchool, MdPerson } from "react-icons/md";
import { IoIdCard } from "react-icons/io5";
import type { FC } from "react";
import type { TTeacher } from "../types/types";
import { FaPlus } from "react-icons/fa6";

type ViewTeacherCredentialsProps = {
    teacher: TTeacher;
    isOpen: boolean;
    onClose: () => void;
};

const ViewTeacherCredentials: FC<ViewTeacherCredentialsProps> = ({
    teacher,
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null;

    const getFullName = () => {
        const middleInitial = teacher.middleName ? `${teacher.middleName.charAt(0)}.` : "";
        return `${teacher.firstName} ${middleInitial} ${teacher.lastName}`.replace(/\s+/g, " ").trim();
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
                            <h2 className="text-2xl font-bold text-gray-900">Teacher Credentials</h2>
                            <p className="text-gray-600">Complete teacher information</p>
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
                            <MdPerson className="mr-2 text-green-600" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <p className="text-gray-900 font-medium">{getFullName()}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <p className="text-gray-900">{teacher.username}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="flex items-center">
                                    <MdEmail className="text-gray-400 mr-2" />
                                    <p className="text-gray-900">{teacher.email}</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <div className="flex items-center">
                                    <MdPhone className="text-gray-400 mr-2" />
                                    <p className="text-gray-900">{teacher.phoneNumber}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Information */}
                    <div className="bg-green-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <MdSchool className="mr-2 text-green-600" />
                            Teacher Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <p className="text-gray-900">{teacher.department}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Specialization</label>
                                <p className="text-gray-900">{teacher.subject}</p>
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
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${teacher.userRole === 'Admin'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-green-100 text-green-800'
                                    }`}>
                                    {teacher.userRole}
                                </span>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${teacher.status === 'Active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {teacher.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewTeacherCredentials;
