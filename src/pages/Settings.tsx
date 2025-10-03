import { useQuery } from "@tanstack/react-query";
import { useUserQuery } from "../query/get/useUserQuery";
import type { TUsers } from "../types/types";
import { FaUser, FaClock, FaPhone } from "react-icons/fa6";
import { CiSettings } from "react-icons/ci";
import { MdOutlineEmail } from "react-icons/md";
import { FormatedPhoneNumber } from "../components/FormatedPhoneNumber";
import SettingsSkeletonLoader from "../loader/SettingsSkeletonLoader";

export default function Settings() {
  const {
    data: userData,
    isLoading,
    error,
    isError,
  } = useQuery(useUserQuery());

  if (isLoading) {
    return <SettingsSkeletonLoader />;
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center w-full h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600">
            {error instanceof Error ? error.message : "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  const user: TUsers = userData;

  return (
    <div className="p-8 w-full mx-auto">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user.firstName?.charAt(0)?.toUpperCase() ||
                    user.username?.charAt(0)?.toUpperCase() ||
                    "U"}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.username || "User Profile"}
                </h2>
                <p className="text-blue-100 text-lg">
                  {user.userRole || "User"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaUser />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">First Name</p>
                      <p className="font-medium text-gray-900">
                        {user.firstName || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaUser />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Name</p>
                      <p className="font-medium text-gray-900">
                        {user.lastName || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FaUser />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Middle Name</p>
                      <p className="font-medium text-gray-900">
                        {user.middleName || "Not Provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Account Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CiSettings className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium text-gray-900">
                        {user.username || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MdOutlineEmail className="text-2xl" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">
                        {user.email || user?.email || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <FaClock className="text-gray-700 text-md" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium text-gray-900">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {user.userRole || "User"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {user.phoneNumber && (
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FaPhone />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-medium text-gray-900">
                          {FormatedPhoneNumber(user.phoneNumber)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">
                    Account Status
                  </h4>
                  <p className="text-sm text-gray-500">
                    Your account is active and verified
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium text-green-600">
                    {user.userRole && "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
