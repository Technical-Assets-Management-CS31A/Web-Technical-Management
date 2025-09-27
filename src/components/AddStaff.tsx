import React, { useState } from "react";
import type { TStaffFormData } from "../types/types";
import CloseButton from "./CloseButton";
import { usePostStaffMutation } from "../query/post/usePostStaffMutation";

type AddStaffProps = {
  onClose: () => void;
};

export const AddStaff = ({ onClose }: AddStaffProps) => {
  const [firstnameError, setFirstnameError] = useState<string>("");
  const [lastnameError, setLastnameError] = useState<string>("");
  const [middlenameError, setMiddlenameError] = useState<string>("");
  const [usernameError, setUsernameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [phoneNumberError, setPhoneNumberError] = useState<string>("");
  const [positionError, setPositionError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const [formData, setFormData] = useState<TStaffFormData>({
    firstName: "",
    lastName: "",
    middleName: "",
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    position: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "firstName") return setFirstnameError("");
    if (name === "lastName") return setLastnameError("");
    if (name === "middleName") return setMiddlenameError("");
    if (name === "username") return setUsernameError("");
    if (name === "email") return setEmailError("");
    if (name === "phoneNumber") return setPhoneNumberError("");
    if (name === "password") return setPasswordError("");
    if (name === "confirmPassword") return setConfirmPasswordError("");
    if (name === "position") return setPositionError("");
  };

  const { mutate } = usePostStaffMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Staff data:", formData);

    let hasError = false;

    if (
      !formData.firstName &&
      !formData.lastName &&
      !formData.username &&
      !formData.email &&
      !formData.phoneNumber &&
      !formData.position &&
      !formData.password &&
      !formData.confirmPassword
    ) {
      setFirstnameError("First name is required");
      setLastnameError("Last name is required");
      setUsernameError("Username is required");
      setEmailError("Email is required");
      setPhoneNumberError("Phone number is required");
      setPositionError("Position is required");
      setPasswordError("Password is required");
      setConfirmPasswordError("Confirm password is required");
      hasError = true
    }

    if (!formData.firstName) {
      setFirstnameError("First name is required");
      hasError = true;
    }

    if (!formData.lastName) {
      setLastnameError("Last name is required");
      hasError = true;
    }

    if (!formData.username) {
      setUsernameError("Username is required");
      hasError = true;
    }

    if (!formData.email) {
      setEmailError("Email is required");
      hasError = true;
    }

    if (!formData.phoneNumber) {
      setPhoneNumberError("Phone number is required");
      hasError = true;
    }

    if (!formData.position) {
      setPositionError("Position is required");
      hasError = true;
    }

    if (!formData.password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (!formData.confirmPassword) {
      setConfirmPasswordError("Confirm password is required");
      hasError = true;
    }

    if (hasError) return;

    mutate(formData);

    setFormData({
      firstName: "",
      lastName: "",
      middleName: "",
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      position: "",
    });

    onClose();
  };

  return (
    <>
      <div className="fixed animate-fadeIn inset-0 z-50 flex items-center justify-center bg-gray-900/60">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl relative animate-fadeInUp">
          <button
            className="absolute top-4 right-4 text-2xl text-[#64748b] hover:text-[#2563eb] transition-colors"
            aria-label="Close"
            onClick={onClose}
          >
            <CloseButton onClick={onClose} />
          </button>
          <h2 className="text-3xl font-extrabold text-[#1e293b] mb-6 text-center tracking-tight">
            New Staff
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="firstName"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.firstName === "" && firstnameError
                      ? "border-red-500"
                      : firstnameError
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  data-testid="firstName"
                />
                {firstnameError && (
                  <p className="text-red-500 text-sm mt-1">{firstnameError}</p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="lastName"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.lastName === "" && lastnameError
                      ? "border-red-500"
                      : lastnameError
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  data-testid="lastName"
                />
                {lastnameError && (
                  <p className="text-red-500 text-sm mt-1">{lastnameError}</p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="middleName"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Middle Name{" "}
                  <span className="text-gray-400/50">(Optional)</span>{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="middleName"
                  name="middleName"
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.middleName === "" && middlenameError
                      ? "border-red-500"
                      : middlenameError
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formData.middleName}
                  onChange={handleInputChange}
                  placeholder="Enter middle name"
                  data-testid="middleName"
                />
                {middlenameError && (
                  <p className="text-red-500 text-sm mt-1">{middlenameError}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="username"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.username === "" && usernameError
                      ? "border-red-500"
                      : usernameError
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter username"
                  data-testid="username"
                />
                {usernameError && (
                  <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="email"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.email === "" && emailError
                      ? "border-red-500"
                      : emailError
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@example.com"
                  data-testid="email"
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="phoneNumber"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.phoneNumber === "" && phoneNumberError
                      ? "border-red-500"
                      : phoneNumberError
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formData.phoneNumber}
                  maxLength={11}
                  onChange={handleInputChange}
                  placeholder="09XXXXXXXXX"
                  data-testid="phoneNumber"
                />
                {phoneNumberError && (
                  <p className="text-red-500 text-sm mt-1">
                    {phoneNumberError}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="phone"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.password === "" && passwordError
                      ? "border-red-500"
                      : passwordError
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
                  data-testid="password"
                />
                {passwordError && (
                  <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                )}
              </div>
              <div className="flex-1">
                <label
                  htmlFor="confirmPassword"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.confirmPassword === "" && confirmPasswordError
                      ? "border-red-500"
                      : confirmPasswordError
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="********"
                  data-testid="confirmPassword"
                />
                {confirmPasswordError && (
                  <p className="text-red-500 text-sm mt-1">
                    {confirmPasswordError}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="position"
                  className="block text-[#2563eb] font-semibold mb-1"
                >
                  Position <span className="text-red-500">*</span>
                </label>
                <select
                  id="position"
                  name="position"
                  className={`w-full px-4 py-3 rounded-xl border border-[#e0e7ef] bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#2563eb] text-lg ${
                    formData.position === "" && positionError
                      ? "border-red-500"
                      : positionError
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formData.position}
                  onChange={handleInputChange}
                  data-testid="position"
                >
                  <option value="">Select Position</option>
                  <option value="Technical">Technical</option>
                  <option value="intern">Intern</option>
                  <option value="regular">Regular</option>
                </select>
                {positionError && (
                  <p className="text-red-500 text-sm mt-1">{positionError}</p>
                )}
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-[#2563eb] to-[#38bdf8] text-white font-bold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-150 cursor-pointer"
                data-testid="button-staff"
              >
                Save Staff
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
