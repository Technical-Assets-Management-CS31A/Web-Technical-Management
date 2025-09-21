import React, { useState } from "react"
import type { TRegisterUser } from "../types/types";
import CloseButton from "../components/CloseButton";

type RegisterProps = {
    onClose: () => void
}

export default function Register({ onClose }: RegisterProps) {
    const BASE_URL = import.meta.env.VITE_REGISTER_USER_API;
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
    const [firstNameError, setFirstNameError] = useState<string>("")
    const [lastNameError, setLastNameError] = useState<string>("")
    const [usernameError, setUsernameError] = useState<string>("")
    const [passwordError, setPasswordError] = useState<string>("")
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>("")
    const [submitForm, setSubmitForm] = useState<TRegisterUser>({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        confirmPassword: ""
    });


    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setSubmitForm((prev) => ({ ...prev, [name]: value }))

        if (name === "firstName") setFirstNameError("")
        if (name === "lastName") setLastNameError("")
        if (name === "username") setUsernameError("")
        if (name === "password") setPasswordError("")

        if (name === "confirmPassword") setConfirmPasswordError("")
    }

    // Handle Register User
    const handleSubmitRegisterForm = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (submitForm.firstName == "" && submitForm.lastName == "" && submitForm.username == "" && submitForm.password == "" && submitForm.confirmPassword == "") {
            setFirstNameError("Firstname is required");
            setLastNameError("Lastname is required");
            setUsernameError("Username is required");
            setPasswordError("Password is required");
            setConfirmPasswordError("Confirm password is required");
            setIsSubmitting(false);
            return;
        }

        if (submitForm.confirmPassword !== submitForm.password) {
            setConfirmPasswordError("Password does not match");
            setIsSubmitting(false);
            return;
        }

        try {
            const submitUserData = {
                firstName: submitForm.firstName,
                lastName: submitForm.lastName,
                username: submitForm.username,
                password: submitForm.password,
                confirmPassword: submitForm.confirmPassword,
            };

            const response = await fetch(BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitUserData),
            });

            if (!response.ok && response.status === 400) {
                setIsSubmitting(false);
                setUsernameError("Username already Exist");
                return
            }

            const data = await response.json();
            if (data) {
                alert("Registration successful! You can now log in.");
                window.location.reload();
            }

            if (!response.ok) {
                throw data.errors || { general: "Registration failed" };
            }

        } catch (error: unknown) {
            if (error instanceof Error) {
                throw error.message;
            }
            throw "An unknown error occurred";
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <>
            <div className="animate-fadeIn fixed flex flex-row justify-center items-center p-[2rem] bg-gray-900/60 z-[1000] w-full h-full m-h-full top-0 left-0">
                <div className="Register-container relative w-full max-w-[550px] bg-white rounded-2xl shadow-gray-600 mt-[2rem] p-[2.5rem] animate-fade-in">
                    <form onSubmit={handleSubmitRegisterForm} className="register-form flex flex-col gap-4 m-0" method="post">
                        <div className="close-container absolute top-[1rem] right-[1rem] z-[10]">
                            <CloseButton onClick={onClose} />
                        </div>
                        <div className="register-title text-center mb-[2rem]">
                            <h1 className="text-black text-3xl font-extrabold mb-2">Create account</h1>
                            <p className="text-gray-700 text-md font-[400]">Register an admin account to manage the system.</p>
                        </div>
                        <input
                            autoFocus
                            className={`w-full h-[56px] outline-0 border-[1px] border-gray-400 rounded-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600 ${firstNameError ? 'border-red-700' : ''}`}
                            type="text"
                            name="firstName"
                            value={submitForm.firstName}
                            placeholder="First name"
                            onChange={handleChange}
                        />
                        {firstNameError && <p style={{ marginTop: "-0.9rem", color: "red", fontSize: "16px", }}>{firstNameError}</p>}

                        <input
                            type="text"
                            name="lastName"
                            className={`w-full h-[56px] outline-0 border-[1px] border-gray-400 rounded-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600 ${lastNameError ? 'border-red-700' : ''}`}
                            value={submitForm.lastName}
                            placeholder="Last name"
                            onChange={handleChange}
                        />
                        {lastNameError && <p style={{ marginTop: "-0.9rem", color: "red", fontSize: "16px", }}>{lastNameError}</p>}

                        <input
                            type="text"
                            name="username"
                            className={`w-full h-[56px] outline-0 border-[1px] border-gray-400 rounded-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600 ${usernameError ? 'border-red-700' : ''}`}
                            value={submitForm.username}
                            placeholder="Username"
                            onChange={handleChange}
                        />
                        {usernameError && <p style={{ marginTop: "-0.9rem", color: "red", fontSize: "16px", }}>{usernameError}</p>}

                        <input
                            type="password"
                            name="password"
                            className={`w-full h-[56px] outline-0 border-[1px] border-gray-400 rounded-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600 ${passwordError ? 'border-red-700' : ''}`}
                            value={submitForm.password}
                            placeholder="Password"
                            onChange={handleChange}
                        />
                        {passwordError && <p style={{ marginTop: "-0.9rem", color: "red", fontSize: "16px", }}>{passwordError}</p>}

                        <input
                            type="password"
                            name="confirmPassword"
                            className={`w-full h-[56px] outline-0 border-[1px] border-gray-400 rounded-lg pl-4 bg-white hover:border-gray-600 hover:bg-gray-50 focus:border-blue-600 ${confirmPasswordError ? 'border-red-700' : ''}`}
                            value={submitForm.confirmPassword}
                            placeholder="Confirm password"
                            onChange={handleChange}
                        />
                        {confirmPasswordError && <p style={{ marginTop: "-0.9rem", color: "red", fontSize: "16px", }}>{confirmPasswordError}</p>}

                        <div className="register-container overflow-hidden relative w-full h-[56px] flex justify-center items-center outline-0 border-0 rounded-[12px] bg-blue-500 text-white font-semibold cursor-pointer  hover:bg-blue-400">
                            <button className="cursor-pointer" type="submit">
                                {isSubmitting ? (<div className="flex justify-center items-center">
                                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-white animate-spin"></div>
                                </div>) : "Register"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
