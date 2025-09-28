import React, { useState } from "react";
import type { TRegisterUser } from "../types/types";
import CloseButton from "../components/CloseButton";
import { usePostRegisterMutation } from "../query/post/usePostRegisterMutation";

type RegisterProps = {
  onClose: () => void;
};

export default function Register({ onClose }: RegisterProps) {
  const [UsernameError, setUsernameError] = useState<string>("");
  const [EmailError, setEmailError] = useState<string>("");
  const [PhoneNumberError, setPhoneNumberError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [submitForm, setSubmitForm] = useState<TRegisterUser>({
    username: "",
    email: "",
    phoneNumber: "",
    role: "",
    password: "",
    confirmPassword: "",
  });

  const { mutate, isPending, error, isError } = usePostRegisterMutation();

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSubmitForm((prev) => ({ ...prev, [name]: value }));

    if (name === "username") setUsernameError("");
    if (name === "email") setEmailError("");
    if (name === "phoneNumber") setPhoneNumberError("");
    if (name === "password") setPasswordError("");
    if (name === "confirmPassword") setConfirmPasswordError("");
  };

  // Handle Register User
  const handleSubmitRegisterForm = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (
      !submitForm.username &&
      !submitForm.email &&
      !submitForm.phoneNumber &&
      !submitForm.password &&
      !submitForm.confirmPassword
    ) {
      setUsernameError("Username is required");
      setEmailError("Email is required");
      setPhoneNumberError("Phone number is required");
      setPasswordError("Password is required");
      setConfirmPasswordError("Confirm password is required");
      hasError = true;
    }

    if (!submitForm.username) {
      setUsernameError("Username is required");
      hasError = true;
    }

    if (!submitForm.email) {
      setEmailError("Email is required");
      hasError = true;
    }

    if (!submitForm.phoneNumber) {
      setPhoneNumberError("Phone number is required");
      hasError = true;
    }

    if (submitForm.password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      hasError = true;
    }

    if (!submitForm.password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (!submitForm.confirmPassword) {
      setConfirmPasswordError("Confirm password is required");
      hasError = true;
    }

    if (submitForm.password !== submitForm.confirmPassword) {
      setConfirmPasswordError("Password does not match");
      hasError = true;
    }

    if (hasError) return;

    mutate(
      { ...submitForm, role: "Admin" },
      {
        onSuccess: () => {
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
            onClose();
          }, 2500);
        },
        onError: (err: any) => {
          console.error("Registration failed:", err.message);
        },
      }
    );
  };

  return (
    <div className="animate-fadeIn fixed flex flex-row justify-center items-center p-[2rem] bg-gray-900/60 z-[1000] w-full h-full m-h-full top-0 left-0">
      {showAlert && (
        <div className="absolute top-8 right-4">
          <div
            className={
              "bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 transition-all duration-500 ease-in-out"
            }
          >
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="font-semibold text-lg">
              Admin Register Successfully
            </div>
          </div>
        </div>
      )}

      <div className="Register-container relative w-full max-w-2xl bg-white rounded-2xl shadow-gray-600 mt-[2rem] p-[2.5rem] animate-fade-in">
        <form
          onSubmit={handleSubmitRegisterForm}
          className="register-form flex flex-col gap-4 m-0"
          method="post"
          data-testid="register-form"
        >
          <div className="close-container absolute top-[1rem] right-[1rem] z-[10]">
            <CloseButton onClick={onClose} />
          </div>
          <div className="register-title text-center mb-[2rem]">
            <h1 className="text-black text-3xl font-extrabold mb-2">
              Create account
            </h1>
            <p className="text-gray-700 text-md font-[400]">
              Register an admin account to manage the system.
            </p>
            {isError && error instanceof Error && (
              <div className="text-red-500 text-md mt-2">{error.message}</div>
            )}
          </div>

          <div className="flex flex-row gap-2">
            <div className="flex flex-col w-full">
              <input
                autoFocus
                className={`w-full h-[56px] outline-0 border-[1px] border-gray-400 rounded-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600 ${
                  UsernameError ? "border-red-700" : ""
                }`}
                type="text"
                name="username"
                value={submitForm.username}
                placeholder="Your Username"
                onChange={handleChange}
                data-testid="username"
              />
              {UsernameError && (
                <p
                  style={{
                    marginTop: "0.2rem",
                    color: "red",
                    fontSize: "16px",
                  }}
                >
                  {UsernameError}
                </p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <input
                type="email"
                name="email"
                className={`w-full h-[56px] outline-0 border-[1px] border-gray-400 rounded-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600 ${
                  EmailError ? "border-red-700" : ""
                }`}
                value={submitForm.email}
                placeholder="Your Email"
                onChange={handleChange}
                data-testid="email"
              />
              {EmailError && (
                <p
                  style={{
                    marginTop: "0.2rem",
                    color: "red",
                    fontSize: "16px",
                  }}
                >
                  {EmailError}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-row gap-1.5">
            <div className="flex flex-col w-full">
              <div className="flex w-full">
                <span className="flex items-center justify-center px-3 border border-gray-400 border-r-0 rounded-l-lg bg-gray-50 text-gray-600">
                  +63
                </span>
                <input
                  type="text"
                  name="phoneNumber"
                  className={`flex-1 h-[56px] outline-0 border border-gray-400 rounded-r-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600 ${
                    PhoneNumberError ? "border-red-700" : ""
                  }`}
                  value={submitForm.phoneNumber}
                  placeholder="9XX XXX XXX"
                  onChange={handleChange}
                  maxLength={10}
                  data-testid="phoneNumber"
                />
              </div>

              {PhoneNumberError && (
                <p
                  style={{
                    marginTop: "0.2rem",
                    color: "red",
                    fontSize: "16px",
                  }}
                >
                  {PhoneNumberError}
                </p>
              )}
            </div>

            <div className="flex flex-col w-full">
              <input
                type="password"
                name="password"
                className={`w-full h-[56px] outline-0 border-[1px] border-gray-400 rounded-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600 ${
                  passwordError ? "border-red-700" : ""
                }`}
                value={submitForm.password}
                placeholder="Password"
                onChange={handleChange}
                data-testid="password"
              />
              {passwordError && (
                <p
                  style={{
                    marginTop: "0.2rem",
                    color: "red",
                    fontSize: "16px",
                  }}
                >
                  {passwordError}
                </p>
              )}
            </div>
          </div>

          <input
            type="password"
            name="confirmPassword"
            className={`w-full h-[56px] outline-0 border-[1px] border-gray-400 rounded-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600 ${
              confirmPasswordError ? "border-red-700" : ""
            }`}
            value={submitForm.confirmPassword}
            placeholder="Confirm password"
            onChange={handleChange}
            data-testid="confirmPassword"
          />
          {confirmPasswordError && (
            <p style={{ marginTop: "-0.9rem", color: "red", fontSize: "16px" }}>
              {confirmPasswordError}
            </p>
          )}
          {/* <select
            name="role"
            id="role"
            className="w-full h-[56px] outline-0 border-[1px] border-gray-400 rounded-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600"
            value={submitForm.role}
            onChange={handleChange}
            data-testid="role"
          >
            <option value="Admin">Admin</option>
            <option value="Technical">Technical</option>
            <option value="Intern">Intern</option>
          </select> */}

          <div className="register-container overflow-hidden relative w-full h-[56px] flex justify-center items-center outline-0 border-0 rounded-[12px] bg-blue-500 text-white font-semibold cursor-pointer  hover:bg-blue-400">
            <button
              className="cursor-pointer"
              type="submit"
              data-testid="register-button"
              disabled={isPending}
            >
              {isPending ? (
                <div className="flex justify-center items-center">
                  <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-white animate-spin"></div>
                </div>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
